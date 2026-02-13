import axios from 'axios'

const API_URL = process.env.GROWTHSTATION_API_URL || 'https://growthstation.app/api/v1'
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

class GrowthstationAPI {
  private apiKey: string
  private baseURL: string

  constructor() {
    this.apiKey = API_KEY
    this.baseURL = API_URL
  }

  private async request<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    try {
      const response = await axios.get<T>(`${this.baseURL}${endpoint}`, {
        params: {
          ...params,
          apiKey: this.apiKey,
        },
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

