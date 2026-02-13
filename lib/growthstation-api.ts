import axios from 'axios'

export interface GrowthstationPerformance {
  nome: string
  userId?: string // ID real do usuário da API
  atividades_diarias: number
  on_time: number
  leads_iniciados: number
  leads_finalizados: number
  taxa_conversao: number
  ganhos: number
  // Métricas detalhadas adicionais
  calls?: number
  meetingsScheduled?: number
  meetingsCompleted?: number
  contracts?: number
  noshow?: number
  closing?: number
  leadTime?: number
}

export interface GrowthstationResponse {
  data: GrowthstationPerformance[]
  average?: GrowthstationPerformance
  total?: GrowthstationPerformance
}

class GrowthstationAPI {
  private async request<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    try {
      // Usar rota /api/sync que já existe e funciona (GET retorna dados, POST sincroniza)
      const url = '/api/sync'
      
      // Adicionar parâmetros de query se necessário
      let finalUrl = url
      if (params && Object.keys(params).length > 0) {
        const searchParams = new URLSearchParams()
        Object.keys(params).forEach((key) => {
          if (params[key] !== undefined && params[key] !== null) {
            searchParams.append(key, params[key].toString())
          }
        })
        finalUrl = `${url}?${searchParams.toString()}`
      }

      console.log('🌐 Chamando API:', finalUrl)
      const response = await axios.get<T>(finalUrl, {
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      console.log('📥 Resposta da API:', {
        status: response.status,
        hasData: !!response.data,
        dataKeys: response.data ? Object.keys(response.data) : [],
        dataLength: (response.data as any)?.data?.length || 0,
      })
      
      return response.data
    } catch (error: any) {
      console.error('❌ Growthstation API Error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        url: error.config?.url,
      })
      throw new Error(`API Error: ${error.response?.data?.message || error.message}`)
    }
  }

  async getPerformanceData(dateFrom?: string, dateTo?: string): Promise<GrowthstationResponse> {
    const params: Record<string, any> = {}
    if (dateFrom) params.dateFrom = dateFrom
    if (dateTo) params.dateTo = dateTo

    return this.request<GrowthstationResponse>('/performance', params)
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

export const growthstationAPI = new GrowthstationAPI()

