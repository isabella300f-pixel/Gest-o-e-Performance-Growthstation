import { NextResponse } from 'next/server'
import { growthstationAPIServer } from '@/lib/growthstation-api-server'
import { supabase } from '@/lib/supabase'
import { processPerformanceData } from '@/lib/data-processor'

export async function POST(request: Request) {
  let savedCount = 0
  let errorMessage: string | null = null
  
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
    
    let performanceData
    try {
      performanceData = await growthstationAPIServer.getPerformanceData(dateFrom, dateTo)
      const executionTime = Date.now() - startTime
      console.log(`⏱️ Tempo de execução: ${executionTime}ms`)
    } catch (apiError: any) {
      console.error('❌ Erro ao buscar da API:', apiError)
      errorMessage = apiError.message || 'Erro ao buscar dados da API'
      // Retornar erro mas não falhar completamente - pode haver dados antigos no Supabase
      return NextResponse.json(
        { 
          success: false,
          error: errorMessage,
          message: 'Não foi possível buscar dados da API, mas a aplicação continua funcionando com dados salvos anteriormente.',
          recordsCount: 0,
        },
        { status: 200 } // Retornar 200 para não quebrar o frontend
      )
    }

    // Verificar se há dados para processar
    if (!performanceData || !performanceData.data || performanceData.data.length === 0) {
      console.warn('⚠️ Nenhum dado retornado da API')
      return NextResponse.json({
        success: false,
        message: 'Nenhum dado retornado da API. A aplicação continua funcionando com dados salvos anteriormente.',
        recordsCount: 0,
      }, { status: 200 })
    }

    console.log(`✅ API retornou ${performanceData.data.length} registros`)

    // Processar dados - extrair métricas detalhadas diretamente dos dados da API
    const performanceItems = performanceData.data
    
    // Preparar dados adicionais para o processador
    // IMPORTANTE: Os dados já vêm calculados da API, então precisamos preservá-los
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

    console.log(`📋 Preparando dados adicionais de ${performanceItems.length} itens...`)
    performanceItems.forEach((item) => {
      // Usar userId da API se disponível, senão gerar a partir do nome
      const userId = item.userId || item.nome.toLowerCase().replace(/\s+/g, '_')
      
      // Preservar todos os valores calculados da API
      // Armazenar usando ambos os IDs para garantir compatibilidade
      additionalData.calls[userId] = item.calls ?? 0
      additionalData.meetings[userId] = {
        scheduled: item.meetingsScheduled ?? 0,
        completed: item.meetingsCompleted ?? 0,
      }
      additionalData.contracts[userId] = item.contracts ?? 0
      additionalData.noshow[userId] = item.noshow ?? 0
      additionalData.closing[userId] = item.closing ?? 0
      additionalData.leadTime[userId] = item.leadTime ?? 0
      
      // Se tiver userId da API, também armazenar usando o nome normalizado para compatibilidade
      if (item.userId) {
        const normalizedName = item.nome.toLowerCase().replace(/\s+/g, '_')
        additionalData.calls[normalizedName] = item.calls ?? 0
        additionalData.meetings[normalizedName] = {
          scheduled: item.meetingsScheduled ?? 0,
          completed: item.meetingsCompleted ?? 0,
        }
        additionalData.contracts[normalizedName] = item.contracts ?? 0
        additionalData.noshow[normalizedName] = item.noshow ?? 0
        additionalData.closing[normalizedName] = item.closing ?? 0
        additionalData.leadTime[normalizedName] = item.leadTime ?? 0
      }
      
      // Log para debug
      if (performanceItems.indexOf(item) < 3) {
        console.log(`📊 Dados para ${item.nome} (userId: ${userId}):`, {
          calls: additionalData.calls[userId],
          meetingsScheduled: additionalData.meetings[userId].scheduled,
          meetingsCompleted: additionalData.meetings[userId].completed,
          contracts: additionalData.contracts[userId],
          noshow: additionalData.noshow[userId],
          closing: additionalData.closing[userId],
          leadTime: additionalData.leadTime[userId],
        })
      }
    })

    const processed = processPerformanceData(performanceItems, additionalData)
    console.log(`📊 Processando ${processed.individual.length} registros individuais`)
    
    // Log dos primeiros registros processados para debug
    if (processed.individual.length > 0) {
      console.log('📋 Primeiros registros processados:', processed.individual.slice(0, 3).map(item => ({
        userName: item.userName,
        calls: item.metrics.calls,
        meetingsScheduled: item.metrics.meetingsScheduled,
        meetingsCompleted: item.metrics.meetingsCompleted,
        contractsGenerated: item.metrics.contractsGenerated,
        noshow: item.metrics.noshow,
        closing: item.metrics.closing,
        leadTime: item.metrics.leadTime,
      })))
    }

    // Salvar no Supabase
    const today = new Date().toISOString().split('T')[0]
    const records = processed.individual.map((item) => {
      const apiItem = performanceItems.find(p => p.nome === item.userName)
      
      // Usar userId da API se disponível, senão usar o gerado do nome
      const userId = apiItem?.userId || item.userId
      
      const record = {
        user_id: userId,
        user_name: item.userName,
        date: today,
        daily_activities: Number(item.metrics.dailyActivities) || 0,
        on_time: Number(item.metrics.onTime) || 0,
        leads_started: Number(apiItem?.leads_iniciados) || 0,
        leads_finished: Number(apiItem?.leads_finalizados) || 0,
        conversion_rate: Number(item.metrics.conversionRate) || 0,
        earnings: Number(apiItem?.ganhos) || 0,
        calls: Number(item.metrics.calls) || 0,
        meetings_scheduled: Number(item.metrics.meetingsScheduled) || 0,
        meetings_completed: Number(item.metrics.meetingsCompleted) || 0,
        contracts_generated: Number(item.metrics.contractsGenerated) || 0,
        noshow: Number(item.metrics.noshow) || 0,
        closing: Number(item.metrics.closing) || 0,
        lead_time: Number(item.metrics.leadTime) || 0,
      }
      
      // Log para debug dos primeiros registros
      if (processed.individual.indexOf(item) < 3) {
        console.log(`💾 Registro para ${item.userName}:`, {
          user_id: record.user_id,
          calls: record.calls,
          meetings_scheduled: record.meetings_scheduled,
          meetings_completed: record.meetings_completed,
          contracts_generated: record.contracts_generated,
          noshow: record.noshow,
          closing: record.closing,
          lead_time: record.lead_time,
        })
      }
      
      return record
    })

    console.log(`💾 Salvando ${records.length} registros no Supabase...`)
    console.log('📋 Exemplo de registro a ser salvo:', records[0] ? {
      user_id: records[0].user_id,
      user_name: records[0].user_name,
      date: records[0].date,
      calls: records[0].calls,
      meetings_scheduled: records[0].meetings_scheduled,
      meetings_completed: records[0].meetings_completed,
      contracts_generated: records[0].contracts_generated,
      noshow: records[0].noshow,
      closing: records[0].closing,
      lead_time: records[0].lead_time,
    } : 'Nenhum registro')

    // Upsert no Supabase
    const { error: supabaseError, data: supabaseResult } = await supabase
      .from('performance_data')
      .upsert(records, {
        onConflict: 'user_id,date',
        ignoreDuplicates: false,
      })

    if (supabaseError) {
      console.error('❌ Erro ao salvar no Supabase:', supabaseError)
      return NextResponse.json(
        { 
          success: false,
          error: 'Erro ao salvar no Supabase', 
          details: supabaseError.message,
          recordsCount: 0,
        },
        { status: 200 } // Retornar 200 para não quebrar o frontend
      )
    }

    savedCount = records.length
    console.log(`✅ ${savedCount} registros salvos com sucesso no Supabase`)

    return NextResponse.json({
      success: true,
      message: 'Dados sincronizados com sucesso',
      recordsCount: savedCount,
    })
  } catch (error: any) {
    console.error('❌ Erro geral na sincronização:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Erro ao sincronizar dados', 
        details: error.message,
        recordsCount: savedCount,
        message: savedCount > 0 
          ? `Alguns dados foram salvos (${savedCount} registros), mas ocorreu um erro.`
          : 'Não foi possível sincronizar dados. A aplicação continua funcionando com dados salvos anteriormente.',
      },
      { status: 200 } // Retornar 200 para não quebrar o frontend
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

