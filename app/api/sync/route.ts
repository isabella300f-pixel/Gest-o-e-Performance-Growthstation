import { NextResponse } from 'next/server'
import { growthstationAPIServer } from '@/lib/growthstation-api-server'
import { supabase } from '@/lib/supabase'
import { processPerformanceData } from '@/lib/data-processor'

export async function POST(request: Request) {
  try {
    // Extrair parâmetros de body para filtros de data (se fornecidos)
    let dateFrom: string | undefined
    let dateTo: string | undefined
    
    try {
      const body = await request.json().catch(() => ({}))
      dateFrom = body.dateFrom || undefined
      dateTo = body.dateTo || undefined
    } catch {
      // Se não houver body, usar undefined
    }

    // Buscar dados da API do Growthstation (server-side)
    console.log('📡 POST /api/sync - Iniciando sincronização...', { dateFrom, dateTo })
    const startTime = Date.now()
    const performanceData = await growthstationAPIServer.getPerformanceData(dateFrom, dateTo)
    const executionTime = Date.now() - startTime
    console.log(`⏱️ Tempo de execução: ${executionTime}ms`)

    // Processar dados - extrair métricas detalhadas diretamente dos dados da API
    const performanceItems = performanceData.data || []
    
    // Preparar dados adicionais para o processador
    const additionalData: {
      calls: Record<string, number>
      meetings: Record<string, { scheduled: number; completed: number }>
      contracts: Record<string, number>
      noshow: Record<string, number>
      closing: Record<string, number>
      leadTime: Record<string, number>
    } = {
      calls: {},
      meetings: {},
      contracts: {},
      noshow: {},
      closing: {},
      leadTime: {},
    }

    performanceItems.forEach((item) => {
      const userId = item.nome.toLowerCase().replace(/\s+/g, '_')
      if (item.calls !== undefined) additionalData.calls[userId] = item.calls
      if (item.meetingsScheduled !== undefined || item.meetingsCompleted !== undefined) {
        additionalData.meetings[userId] = {
          scheduled: item.meetingsScheduled || 0,
          completed: item.meetingsCompleted || 0,
        }
      }
      if (item.contracts !== undefined) additionalData.contracts[userId] = item.contracts
      if (item.noshow !== undefined) additionalData.noshow[userId] = item.noshow
      if (item.closing !== undefined) additionalData.closing[userId] = item.closing
      if (item.leadTime !== undefined) additionalData.leadTime[userId] = item.leadTime
    })

    const processed = processPerformanceData(performanceItems, additionalData)

    // Salvar no Supabase
    const today = new Date().toISOString().split('T')[0]
    const records = processed.individual.map((item) => ({
      user_id: item.userId,
      user_name: item.userName,
      date: today,
      daily_activities: item.metrics.dailyActivities,
      on_time: item.metrics.onTime,
      leads_started: performanceItems.find(p => p.nome === item.userName)?.leads_iniciados || 0,
      leads_finished: performanceItems.find(p => p.nome === item.userName)?.leads_finalizados || 0,
      conversion_rate: item.metrics.conversionRate,
      earnings: performanceItems.find(p => p.nome === item.userName)?.ganhos || 0,
      calls: item.metrics.calls,
      meetings_scheduled: item.metrics.meetingsScheduled,
      meetings_completed: item.metrics.meetingsCompleted,
      contracts_generated: item.metrics.contractsGenerated,
      noshow: item.metrics.noshow,
      closing: item.metrics.closing,
      lead_time: item.metrics.leadTime,
    }))

    // Upsert no Supabase
    const { error } = await supabase
      .from('performance_data')
      .upsert(records, {
        onConflict: 'user_id,date',
        ignoreDuplicates: false,
      })

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: 'Erro ao salvar no Supabase', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Dados sincronizados com sucesso',
      recordsCount: records.length,
    })
  } catch (error: any) {
    console.error('Sync error:', error)
    return NextResponse.json(
      { error: 'Erro ao sincronizar dados', details: error.message },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  try {
    // Verificar variáveis de ambiente
    const apiUrl = process.env.GROWTHSTATION_API_URL
    const apiKey = process.env.GROWTHSTATION_API_KEY
    
    if (!apiUrl || !apiKey) {
      return NextResponse.json(
        { 
          error: 'Variáveis de ambiente não configuradas',
          details: 'GROWTHSTATION_API_URL ou GROWTHSTATION_API_KEY não encontradas',
          suggestion: 'Configure as variáveis no Vercel Dashboard',
        },
        { 
          status: 500,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
          },
        }
      )
    }

    // Extrair parâmetros de query para filtros de data
    const { searchParams } = new URL(request.url)
    const dateFrom = searchParams.get('dateFrom') || undefined
    const dateTo = searchParams.get('dateTo') || undefined

    console.log('GET /api/sync - Environment check:', {
      hasApiUrl: !!apiUrl,
      hasApiKey: !!apiKey,
      apiUrl: apiUrl?.substring(0, 50),
      dateFrom,
      dateTo,
    })

    // Buscar dados da API do Growthstation (server-side)
    console.log('📡 Iniciando busca de dados da API Growthstation...')
    const startTime = Date.now()
    const performanceData = await growthstationAPIServer.getPerformanceData(dateFrom, dateTo)
    const executionTime = Date.now() - startTime
    console.log(`⏱️ Tempo de execução: ${executionTime}ms`)
    
    console.log('📦 Dados recebidos da API:', {
      hasData: !!performanceData,
      hasDataArray: !!performanceData?.data,
      dataLength: performanceData?.data?.length || 0,
      sample: performanceData?.data?.slice(0, 2),
    })

    // Se não houver dados, retornar estrutura vazia ao invés de erro
    if (!performanceData || !performanceData.data || performanceData.data.length === 0) {
      console.warn('⚠️ Nenhum dado retornado da API Growthstation')
      return NextResponse.json(
        {
          data: [],
          message: 'Nenhum dado retornado da API',
        },
        {
          status: 200,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
          },
        }
      )
    }

    console.log(`✅ Retornando ${performanceData.data.length} registros de performance`)
    return NextResponse.json(performanceData, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    })
  } catch (error: any) {
    console.error('❌ Sync GET error:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      url: error.config?.url,
      stack: error.stack,
    })
    
    // Extrair mensagem de erro mais amigável
    let errorMessage = error.message || 'Erro desconhecido'
    let errorDetails = ''
    
    // Verificar se é timeout
    if (error.message?.includes('timeout') || error.message?.includes('504') || error.code === 'ECONNABORTED') {
      errorMessage = 'Timeout ao buscar dados'
      errorDetails = 'A requisição demorou muito para responder. Tente novamente ou use filtros de data para reduzir a quantidade de dados.'
    } else if (error.message?.includes('limit') || error.message?.includes('Parâmetro')) {
      errorMessage = 'Erro de validação da API'
      errorDetails = error.message
    } else if (error.response?.status === 400) {
      errorMessage = 'Erro de validação na requisição'
      errorDetails = error.response?.data?.message || error.message
    } else if (error.response?.status === 401) {
      errorMessage = 'Erro de autenticação'
      errorDetails = 'Verifique se a API key está correta'
    } else if (error.response?.status === 404) {
      errorMessage = 'Endpoint não encontrado'
      errorDetails = 'O endpoint solicitado não existe na API'
    } else if (error.response?.status === 429) {
      errorMessage = 'Limite de requisições excedido'
      errorDetails = 'Aguarde alguns instantes antes de tentar novamente'
    } else if (error.response?.status === 504) {
      errorMessage = 'Gateway Timeout'
      errorDetails = 'O servidor demorou muito para responder. Tente novamente ou use filtros de data (dateFrom e dateTo) para reduzir a quantidade de dados buscados.'
    } else if (error.response?.status >= 500) {
      errorMessage = 'Erro no servidor da API'
      errorDetails = 'O servidor da API está temporariamente indisponível'
    }
    
    // Retornar erro mais detalhado
    return NextResponse.json(
      { 
        error: errorMessage,
        details: errorDetails || error.message,
        status: error.response?.status || 500,
        data: [], // Retornar array vazio para não quebrar a aplicação
      },
      { 
        status: 200, // Retornar 200 com dados vazios ao invés de erro para não quebrar o frontend
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      }
    )
  }
}

