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
      // Usar API route do Next.js (server-side proxy) para evitar CORS
      // No cliente, sempre usa caminho relativo que será resolvido para o mesmo domínio
      const basePath = '/api/growthstation'
      let url: string
      
      if (typeof window !== 'undefined') {
        // No cliente: usar caminho relativo (mesmo domínio)
        url = `${basePath}${endpoint}`
      } else {
        // No servidor: usar URL completa se disponível
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
        url = `${baseUrl}${basePath}${endpoint}`
      }
      
      // Adicionar parâmetros de query
      if (params && Object.keys(params).length > 0) {
        const searchParams = new URLSearchParams()
        Object.keys(params).forEach((key) => {
          if (params[key] !== undefined && params[key] !== null) {
            searchParams.append(key, params[key].toString())
          }
        })
        url += `?${searchParams.toString()}`
      }
      
      if (params) {
        Object.keys(params).forEach((key) => {
          if (params[key] !== undefined && params[key] !== null) {
            url.searchParams.append(key, params[key].toString())
          }
        })
      }

      const response = await axios.get<T>(url, {
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

