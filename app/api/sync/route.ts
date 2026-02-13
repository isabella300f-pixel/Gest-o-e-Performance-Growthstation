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

export async function GET() {
  return NextResponse.json({ message: 'Use POST to sync data' })
}

