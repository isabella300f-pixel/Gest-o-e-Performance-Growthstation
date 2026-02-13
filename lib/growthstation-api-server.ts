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
        const errorData = response.data
        console.error('Growthstation API Error Response:', {
          status: response.status,
          data: errorData,
          url,
        })
        
        // Mensagem de erro mais amigável
        let errorMessage = `API returned ${response.status}`
        if (errorData?.query) {
          // Erro de validação de parâmetros
          const queryErrors = errorData.query
          if (Array.isArray(queryErrors)) {
            const limitError = queryErrors.find((e: any) => e.path?.includes('limit'))
            if (limitError) {
              errorMessage = `Parâmetro 'limit' inválido: ${limitError.message || 'deve ser <= 100'}`
            } else {
              errorMessage = `Erro de validação: ${queryErrors.map((e: any) => e.message).join(', ')}`
            }
          }
        } else if (errorData?.error?.message) {
          errorMessage = errorData.error.message
        } else if (typeof errorData === 'string') {
          errorMessage = errorData
        }
        
        throw new Error(errorMessage)
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

  /**
   * Busca todos os dados de um endpoint usando paginação
   */
  private async fetchAllPages(endpoint: string, maxPages: number = 10): Promise<any[]> {
    const allData: any[] = []
    let page = 1
    const limit = 100 // Máximo permitido pela API
    
    while (page <= maxPages) {
      try {
        console.log(`📄 Buscando página ${page} de ${endpoint}...`)
        const response = await this.request<any>(endpoint, {
          limit,
          page,
        })
        
        const pageData = response?.data || []
        const meta = response?.meta || {}
        
        if (pageData.length === 0) {
          console.log(`✅ Todas as páginas buscadas. Total: ${allData.length} registros`)
          break
        }
        
        allData.push(...pageData)
        console.log(`✅ Página ${page}: ${pageData.length} registros (Total: ${allData.length})`)
        
        // Verificar se há mais páginas
        const totalPages = meta.totalPages || 1
        if (page >= totalPages) {
          console.log(`✅ Todas as páginas buscadas. Total: ${allData.length} registros`)
          break
        }
        
        page++
      } catch (error: any) {
        console.error(`❌ Erro ao buscar página ${page} de ${endpoint}:`, error.message)
        // Se for erro 400, pode ser que o limite seja muito alto ou página inválida
        if (error.response?.status === 400) {
          console.warn('⚠️ Erro 400 - parando paginação')
          break
        }
        throw error
      }
    }
    
    return allData
  }

  async getPerformanceData(dateFrom?: string, dateTo?: string): Promise<GrowthstationResponse> {
    // A API do GS Engage não tem endpoint /performance
    // Vamos usar prospecções e leads para calcular métricas
    try {
      console.log('📊 Fetching performance data from GS Engage API...')
      console.log('API URL:', this.baseURL)
      
      // Buscar todas as prospecções usando paginação
      const prospections = await this.fetchAllPages('/prospections', 20)
      
      // Buscar todos os leads usando paginação
      const leads = await this.fetchAllPages('/leads', 20)

      console.log(`✅ Found ${prospections.length} prospections and ${leads.length} leads`)
      
      if (prospections.length > 0) {
        console.log('📋 Sample prospection:', {
          id: prospections[0].id,
          hasResponsible: !!prospections[0].responsible,
          responsible: prospections[0].responsible ? {
            id: prospections[0].responsible.id,
            name: `${prospections[0].responsible.firstName || ''} ${prospections[0].responsible.lastName || ''}`.trim(),
            email: prospections[0].responsible.email,
          } : null,
          status: prospections[0].status,
          hasMeeting: !!prospections[0].meeting,
        })
      } else {
        console.warn('⚠️ Nenhuma prospecção encontrada na API')
      }

      if (prospections.length === 0) {
        console.warn('⚠️ Nenhuma prospecção encontrada. A API retornou dados vazios.')
        return { data: [] }
      }

      // Agrupar por responsável
      const byUser: Record<string, {
        userName: string
        userId: string
        prospections: any[]
        leads: any[]
        metrics: {
          calls: number
          meetingsScheduled: number
          meetingsCompleted: number
          contracts: number
          noshow: number
          closing: number
          activeProspections: number
          finishedProspections: number
          wonProspections: number
          lostProspections: number
        }
      }> = {}

      // Processar prospecções
      let prospectionsWithoutResponsible = 0
      prospections.forEach((prospection: any) => {
        const responsible = prospection.responsible
        if (!responsible) {
          prospectionsWithoutResponsible++
          if (prospectionsWithoutResponsible <= 3) {
            console.warn('⚠️ Prospecção sem responsável:', prospection.id, prospection.status)
          }
          return
        }

        const userId = responsible.id
        const userName = `${responsible.firstName || ''} ${responsible.lastName || ''}`.trim() || responsible.email || 'Unknown'
        
        if (!userId) {
          console.warn('⚠️ Prospecção com responsável sem ID:', prospection.id)
          return
        }

        if (!byUser[userId]) {
          byUser[userId] = {
            userName,
            userId,
            prospections: [],
            leads: [],
            metrics: {
              calls: 0,
              meetingsScheduled: 0,
              meetingsCompleted: 0,
              contracts: 0,
              noshow: 0,
              closing: 0,
              activeProspections: 0,
              finishedProspections: 0,
              wonProspections: 0,
              lostProspections: 0,
            },
          }
        }

        byUser[userId].prospections.push(prospection)

        // Contar meetings baseado no campo meeting da prospecção
        if (prospection.meeting) {
          byUser[userId].metrics.meetingsScheduled += 1
          // Se a prospecção está finalizada e tinha meeting, consideramos como completed
          if (prospection.status === 'FINISHED' || prospection.status === 'CLOSED' || prospection.status === 'WON') {
            byUser[userId].metrics.meetingsCompleted += 1
          }
        }

        // Contar status
        const status = prospection.status?.toUpperCase() || ''
        if (status === 'ACTIVE') {
          byUser[userId].metrics.activeProspections += 1
        } else if (status === 'FINISHED' || status === 'CLOSED') {
          byUser[userId].metrics.finishedProspections += 1
        } else if (status === 'WON') {
          byUser[userId].metrics.wonProspections += 1
          byUser[userId].metrics.contracts += 1 // WON = contrato gerado
          byUser[userId].metrics.closing += 1
        } else if (status === 'LOST') {
          byUser[userId].metrics.lostProspections += 1
          // Verificar se foi no-show baseado no lostReason
          const lostReason = prospection.lostReason?.toLowerCase() || ''
          if (lostReason.includes('no-show') || lostReason.includes('no show') || lostReason.includes('ausente')) {
            byUser[userId].metrics.noshow += 1
          }
        }
      })

      // Processar leads
      leads.forEach((lead: any) => {
        const responsible = lead.responsible
        if (responsible && byUser[responsible.id]) {
          byUser[responsible.id].leads.push(lead)
        }
      })

      console.log(`📈 Processed data for ${Object.keys(byUser).length} users`)
      console.log(`⚠️ Prospecções sem responsável: ${prospectionsWithoutResponsible} de ${prospections.length}`)
      
      if (Object.keys(byUser).length === 0) {
        console.error('❌ Nenhum usuário encontrado após processamento!')
        console.log('Debug info:', {
          totalProspections: prospections.length,
          prospectionsWithoutResponsible,
          sampleProspection: prospections[0] ? {
            id: prospections[0].id,
            hasResponsible: !!prospections[0].responsible,
            responsibleKeys: prospections[0].responsible ? Object.keys(prospections[0].responsible) : [],
          } : null,
        })
        return { data: [] }
      }

      // Converter para formato esperado
      const performanceData: GrowthstationPerformance[] = Object.values(byUser).map((user) => {
        const totalLeads = user.leads.length
        const finishedCount = user.metrics.finishedProspections + user.metrics.wonProspections
        const conversionRate = totalLeads > 0 ? (finishedCount / totalLeads) * 100 : 0
        
        // Atividades diárias = prospecções ativas + calls estimados + meetings
        // Estimamos calls baseado no número de prospecções (cada prospecção geralmente tem múltiplas ligações)
        const estimatedCalls = user.prospections.length * 2 // Estimativa: 2 calls por prospecção
        const dailyActivities = user.metrics.activeProspections + estimatedCalls + user.metrics.meetingsScheduled

        // Calcular lead time médio (diferença entre startDate e endDate das prospecções finalizadas)
        let totalLeadTime = 0
        let leadTimeCount = 0
        user.prospections.forEach((p: any) => {
          if (p.startDate && p.endDate && (p.status === 'FINISHED' || p.status === 'CLOSED' || p.status === 'WON')) {
            const start = new Date(p.startDate).getTime()
            const end = new Date(p.endDate).getTime()
            const hours = (end - start) / (1000 * 60 * 60) // Converter para horas
            if (hours > 0 && hours < 8760) { // Validar: entre 0 e 1 ano
              totalLeadTime += hours
              leadTimeCount += 1
            }
          }
        })
        const avgLeadTime = leadTimeCount > 0 ? totalLeadTime / leadTimeCount : 0

        console.log(`👤 ${user.userName}:`, {
          prospections: user.prospections.length,
          leads: totalLeads,
          calls: estimatedCalls,
          meetings: user.metrics.meetingsScheduled,
          meetingsCompleted: user.metrics.meetingsCompleted,
          contracts: user.metrics.contracts,
          noshow: user.metrics.noshow,
          closing: user.metrics.closing,
          leadTime: avgLeadTime.toFixed(1) + 'h',
          conversionRate: conversionRate.toFixed(2) + '%',
        })
        
        return {
          nome: user.userName,
          atividades_diarias: dailyActivities,
          on_time: 95, // Placeholder - será calculado quando houver dados de atividades com timestamps
          leads_iniciados: totalLeads,
          leads_finalizados: finishedCount,
          taxa_conversao: conversionRate,
          ganhos: user.metrics.contracts,
          // Métricas detalhadas
          calls: estimatedCalls,
          meetingsScheduled: user.metrics.meetingsScheduled,
          meetingsCompleted: user.metrics.meetingsCompleted,
          contracts: user.metrics.contracts,
          noshow: user.metrics.noshow,
          closing: user.metrics.closing,
          leadTime: avgLeadTime,
        }
      })

      console.log(`✅ Calculated performance for ${performanceData.length} users`)
      
      if (performanceData.length === 0) {
        console.warn('⚠️ Nenhum usuário encontrado. Verifique se há prospecções e leads na plataforma.')
      } else {
        console.log('📊 Performance data sample:', performanceData.slice(0, 2))
      }

      return {
        data: performanceData,
      }
    } catch (error: any) {
      console.error('❌ Error getting performance data:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        stack: error.stack,
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

