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
      console.log('Fetching performance data from GS Engage API...')
      
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

      console.log(`Found ${prospections.length} prospections and ${leads.length} leads`)

      // Agrupar por responsável
      const byUser: Record<string, {
        userName: string
        prospections: any[]
        leads: any[]
        activities: {
          calls: number
          meetings: number
          emails: number
        }
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
            activities: {
              calls: 0,
              meetings: 0,
              emails: 0,
            },
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

      // Buscar atividades de cada prospecção (limitado para não sobrecarregar)
      const activityPromises = Object.values(byUser).slice(0, 10).map(async (user) => {
        for (const prospection of user.prospections.slice(0, 5)) {
          try {
            const activities = await this.request<any>(`/prospections/${prospection.id}/activities`, {
              limit: 100,
            })
            
            // Contar tipos de atividades
            const activityList = activities?.data || []
            activityList.forEach((activity: any) => {
              const type = activity.type?.toLowerCase() || ''
              if (type.includes('call') || type.includes('ligação')) {
                user.activities.calls += 1
              } else if (type.includes('meeting') || type.includes('reunião')) {
                user.activities.meetings += 1
              } else if (type.includes('email')) {
                user.activities.emails += 1
              }
            })
          } catch (err) {
            // Ignorar erros ao buscar atividades individuais
            console.warn(`Could not fetch activities for prospection ${prospection.id}`)
          }
        }
      })

      // Aguardar algumas buscas de atividades (não todas para não demorar muito)
      await Promise.all(activityPromises.slice(0, 3))

      // Converter para formato esperado
      const performanceData: GrowthstationPerformance[] = Object.values(byUser).map((user) => {
        const finishedProspections = user.prospections.filter((p: any) => 
          p.status === 'FINISHED' || p.status === 'CLOSED' || p.status === 'WON'
        )
        const activeProspections = user.prospections.filter((p: any) => p.status === 'ACTIVE')
        
        // Calcular métricas
        const totalLeads = user.leads.length
        const finishedCount = finishedProspections.length
        const conversionRate = totalLeads > 0 ? (finishedCount / totalLeads) * 100 : 0
        
        return {
          nome: user.userName,
          atividades_diarias: activeProspections.length + user.activities.calls + user.activities.meetings,
          on_time: 95, // Placeholder - será calculado quando houver dados de atividades com timestamps
          leads_iniciados: totalLeads,
          leads_finalizados: finishedCount,
          taxa_conversao: conversionRate,
          ganhos: finishedProspections.filter((p: any) => p.status === 'WON').length, // Assumindo que WON = ganho
        }
      })

      console.log(`✅ Calculated performance for ${performanceData.length} users`)
      
      if (performanceData.length === 0) {
        console.warn('⚠️ Nenhum usuário encontrado. Verifique se há prospecções e leads na plataforma.')
      }

      return {
        data: performanceData,
      }
    } catch (error: any) {
      console.error('Error getting performance data:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      })
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

