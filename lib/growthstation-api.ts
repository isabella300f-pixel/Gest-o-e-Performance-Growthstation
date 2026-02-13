import axios from 'axios'

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

      const response = await axios.get<T>(finalUrl, {
        headers: {
          'Content-Type': 'application/json',
        },
      })
      return response.data
    } catch (error: any) {
      console.error('Growthstation API Error:', error.response?.data || error.message)
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

