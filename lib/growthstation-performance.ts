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

/**
 * Calcula métricas de performance a partir de prospecções e leads da API
 */
export async function calculatePerformanceFromAPI(
  dateFrom?: string,
  dateTo?: string
): Promise<GrowthstationResponse> {
  try {
    // Buscar prospecções
    const prospectionsResponse = await axios.get(`${API_URL}/prospections`, {
      params: {
        apiKey: API_KEY,
        limit: 1000,
        page: 1,
      },
      headers: {
        'Content-Type': 'application/json',
      },
    })

    // Buscar leads
    const leadsResponse = await axios.get(`${API_URL}/leads`, {
      params: {
        apiKey: API_KEY,
        limit: 1000,
        page: 1,
      },
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const prospections = prospectionsResponse.data?.data || []
    const leads = leadsResponse.data?.data || []

    // Agrupar por responsável e calcular métricas
    const byUser: Record<string, {
      userName: string
      prospections: any[]
      leads: any[]
      metrics: {
        calls: number
        meetingsScheduled: number
        meetingsCompleted: number
        contracts: number
        noshow: number
        closing: number
        leadTime: number
        conversionRate: number
        onTime: number
        dailyActivities: number
      }
    }> = {}

    // Processar prospecções
    prospections.forEach((prospection: any) => {
      const responsible = prospection.responsible
      if (!responsible) return

      const userId = responsible.id
      const userName = `${responsible.firstName || ''} ${responsible.lastName || ''}`.trim() || responsible.email

      if (!byUser[userId]) {
        byUser[userId] = {
          userName,
          prospections: [],
          leads: [],
          metrics: {
            calls: 0,
            meetingsScheduled: 0,
            meetingsCompleted: 0,
            contracts: 0,
            noshow: 0,
            closing: 0,
            leadTime: 0,
            conversionRate: 0,
            onTime: 0,
            dailyActivities: 0,
          },
        }
      }

      byUser[userId].prospections.push(prospection)

      // Contar atividades (simplificado - pode ser expandido)
      if (prospection.status === 'ACTIVE') {
        byUser[userId].metrics.dailyActivities += 1
      }
    })

    // Processar leads
    leads.forEach((lead: any) => {
      const responsible = lead.responsible
      if (!responsible) return

      const userId = responsible.id
      if (byUser[userId]) {
        byUser[userId].leads.push(lead)
      }
    })

    // Converter para formato esperado
    const performanceData: GrowthstationPerformance[] = Object.values(byUser).map((user) => ({
      nome: user.userName,
      atividades_diarias: user.metrics.dailyActivities,
      on_time: user.metrics.onTime || 0,
      leads_iniciados: user.leads.length,
      leads_finalizados: user.prospections.filter((p: any) => p.status === 'FINISHED').length,
      taxa_conversao: user.leads.length > 0 
        ? (user.prospections.filter((p: any) => p.status === 'FINISHED').length / user.leads.length) * 100 
        : 0,
      ganhos: 0, // Será calculado quando houver dados de contratos
    }))

    return {
      data: performanceData,
    }
  } catch (error: any) {
    console.error('Error calculating performance from API:', error)
    return {
      data: [],
    }
  }
}

