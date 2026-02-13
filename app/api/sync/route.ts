import { NextResponse } from 'next/server'
import { growthstationAPIServer } from '@/lib/growthstation-api-server'
import { supabase } from '@/lib/supabase'
import { processPerformanceData } from '@/lib/data-processor'

export async function POST(request: Request) {
  try {
    // Buscar dados da API do Growthstation (server-side)
    const performanceData = await growthstationAPIServer.getPerformanceData()

    // Processar dados
    const processed = processPerformanceData(performanceData.data || [])

    // Salvar no Supabase
    const today = new Date().toISOString().split('T')[0]
    const records = processed.individual.map((item) => ({
      user_id: item.userId,
      user_name: item.userName,
      date: today,
      daily_activities: item.metrics.dailyActivities,
      on_time: item.metrics.onTime,
      leads_started: 0,
      leads_finished: 0,
      conversion_rate: item.metrics.conversionRate,
      earnings: 0,
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

    console.log('GET /api/sync - Environment check:', {
      hasApiUrl: !!apiUrl,
      hasApiKey: !!apiKey,
      apiUrl: apiUrl?.substring(0, 50),
    })

    // Buscar dados da API do Growthstation (server-side)
    const performanceData = await growthstationAPIServer.getPerformanceData()

    // Se não houver dados, retornar estrutura vazia ao invés de erro
    if (!performanceData || !performanceData.data) {
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

    return NextResponse.json(performanceData, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    })
  } catch (error: any) {
    console.error('Sync GET error:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      url: error.config?.url,
    })
    
    // Se for 404, significa que o endpoint não existe
    if (error.response?.status === 404) {
      return NextResponse.json(
        { 
          error: 'Endpoint da API não encontrado',
          details: 'O endpoint /performance não existe na API do Growthstation',
          suggestion: 'Verifique a documentação da API ou a URL base',
          data: [], // Retornar array vazio para não quebrar a aplicação
        },
        { 
          status: 200, // Retornar 200 com dados vazios ao invés de erro
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
          },
        }
      )
    }
    
    // Retornar erro mais detalhado para outros casos
    return NextResponse.json(
      { 
        error: 'Erro ao buscar dados da API',
        details: error.message,
        status: error.response?.status,
        data: [], // Retornar array vazio para não quebrar a aplicação
      },
      { 
        status: 200, // Retornar 200 com dados vazios ao invés de erro
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      }
    )
  }
}

