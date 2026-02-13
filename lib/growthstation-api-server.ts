import axios from 'axios'

const API_URL = process.env.GROWTHSTATION_API_URL || 'https://api.gsengage.com/api/v1'
const API_KEY = process.env.GROWTHSTATION_API_KEY || '8bc7f25d967d79bd55d8e0acabdb8e2bd9391120'

export interface GrowthstationPerformance {
  nome: string
  atividades_diarias: number
  on_time: number
  leads_iniciados: number
  leads_finalizados: number
  taxa_conversao: number
  ganhos: number
}

export interface GrowthstationResponse {
  data: GrowthstationPerformance[]
  average?: GrowthstationPerformance
  total?: GrowthstationPerformance
}

class GrowthstationAPIServer {
  private apiKey: string
  private baseURL: string

  constructor() {
    this.apiKey = API_KEY
    this.baseURL = API_URL
  }

  private async request<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    try {
      const url = `${this.baseURL}${endpoint}`
      const requestParams = {
        ...params,
        apiKey: this.apiKey,
      }

      console.log('Growthstation API Request:', {
        url,
        hasApiKey: !!this.apiKey,
        params: { ...requestParams, apiKey: '***' },
      })

      const response = await axios.get<T>(url, {
        params: requestParams,
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 30000,
        validateStatus: (status) => status < 500, // Não lançar erro para 4xx
      })

      if (response.status >= 400) {
        console.error('Growthstation API Error Response:', {
          status: response.status,
          data: response.data,
          url,
        })
        throw new Error(`API returned ${response.status}: ${JSON.stringify(response.data)}`)
      }

      return response.data
    } catch (error: any) {
      console.error('Growthstation API Error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        url: error.config?.url,
      })
      throw new Error(`API Error: ${error.response?.data?.message || error.message}`)
    }
  }

  async getPerformanceData(dateFrom?: string, dateTo?: string): Promise<GrowthstationResponse> {
    // A API do GS Engage não tem endpoint /performance
    // Vamos usar prospecções e leads para calcular métricas
    try {
      // Buscar prospecções para calcular métricas
      const prospectionsResponse = await this.request<any>('/prospections', {
        limit: 1000,
        page: 1,
      })

      // Buscar leads para métricas adicionais
      const leadsResponse = await this.request<any>('/leads', {
        limit: 1000,
        page: 1,
      })

      const prospections = prospectionsResponse?.data || []
      const leads = leadsResponse?.data || []

      // Agrupar por responsável
      const byUser: Record<string, {
        userName: string
        prospections: any[]
        leads: any[]
      }> = {}

      // Processar prospecções
      prospections.forEach((prospection: any) => {
        const responsible = prospection.responsible
        if (!responsible) return

        const userId = responsible.id
        const userName = `${responsible.firstName || ''} ${responsible.lastName || ''}`.trim() || responsible.email || 'Unknown'

        if (!byUser[userId]) {
          byUser[userId] = {
            userName,
            prospections: [],
            leads: [],
          }
        }

        byUser[userId].prospections.push(prospection)
      })

      // Processar leads
      leads.forEach((lead: any) => {
        const responsible = lead.responsible
        if (responsible && byUser[responsible.id]) {
          byUser[responsible.id].leads.push(lead)
        }
      })

      // Converter para formato esperado
      const performanceData: GrowthstationPerformance[] = Object.values(byUser).map((user) => {
        const finishedProspections = user.prospections.filter((p: any) => p.status === 'FINISHED' || p.status === 'CLOSED')
        const activeProspections = user.prospections.filter((p: any) => p.status === 'ACTIVE')
        
        return {
          nome: user.userName,
          atividades_diarias: activeProspections.length,
          on_time: 95, // Placeholder - será calculado quando houver dados de atividades
          leads_iniciados: user.leads.length,
          leads_finalizados: finishedProspections.length,
          taxa_conversao: user.leads.length > 0 
            ? (finishedProspections.length / user.leads.length) * 100 
            : 0,
          ganhos: 0, // Será calculado quando houver dados de contratos
        }
      })

      return {
        data: performanceData,
      }
    } catch (error: any) {
      console.error('Error getting performance data:', error)
      throw error
    }
  }

  async getProspections(params?: { limit?: number; page?: number; status?: string }) {
    return this.request('/prospections', params)
  }

  async getLeadsData(params?: { limit?: number; page?: number }) {
    return this.request('/leads', params)
  }

  async getLeads(params?: { dateFrom?: string; dateTo?: string; status?: string }) {
    return this.request('/leads', params)
  }

  async getCalls(params?: { dateFrom?: string; dateTo?: string; userId?: string }) {
    return this.request('/calls', params)
  }

  async getMeetings(params?: { dateFrom?: string; dateTo?: string; userId?: string }) {
    return this.request('/meetings', params)
  }

  async getContracts(params?: { dateFrom?: string; dateTo?: string; userId?: string }) {
    return this.request('/contracts', params)
  }
}

export const growthstationAPIServer = new GrowthstationAPIServer()

