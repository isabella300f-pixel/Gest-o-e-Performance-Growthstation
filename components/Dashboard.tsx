'use client'

import { useEffect, useState } from 'react'
import { supabase, PerformanceData } from '@/lib/supabase'
import KPICards from './KPICards'
import PerformanceChart from './PerformanceChart'
import IndividualPerformance from './IndividualPerformance'
import LeadTimeAnalysis from './LeadTimeAnalysis'
import ConversionFunnel from './ConversionFunnel'
import StrategicInsights from './StrategicInsights'
import TrendAnalysis from './TrendAnalysis'
import EfficiencyMetrics from './EfficiencyMetrics'
import PerformanceComparison from './PerformanceComparison'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

export default function Dashboard() {
  const [data, setData] = useState<PerformanceData[]>([])
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0],
  })

  useEffect(() => {
    loadData()
    
    // Escutar evento de refresh do Supabase
    const handleRefresh = () => {
      console.log('🔄 Recarregando dados após sincronização...')
      loadData()
    }
    
    window.addEventListener('supabase:refresh', handleRefresh)
    return () => window.removeEventListener('supabase:refresh', handleRefresh)
  }, [dateRange])

  const loadData = async () => {
    try {
      setLoading(true)
      console.log('📊 Carregando dados do Supabase...', { start: dateRange.start, end: dateRange.end })
      
      const { data: performanceData, error } = await supabase
        .from('performance_data')
        .select('*')
        .gte('date', dateRange.start)
        .lte('date', dateRange.end)
        .order('date', { ascending: false })

      if (error) {
        console.error('❌ Erro ao buscar do Supabase:', error)
        throw error
      }
      
      console.log(`✅ ${performanceData?.length || 0} registros carregados do Supabase`)
      setData(performanceData || [])
      
      // Se não houver dados no período, buscar dados mais recentes disponíveis
      if (!performanceData || performanceData.length === 0) {
        console.warn('⚠️ Nenhum dado no período selecionado. Buscando dados mais recentes...')
        const { data: recentData } = await supabase
          .from('performance_data')
          .select('*')
          .order('date', { ascending: false })
          .limit(100)
        
        if (recentData && recentData.length > 0) {
          console.log(`✅ Usando ${recentData.length} registros mais recentes disponíveis`)
          setData(recentData)
        }
      }
    } catch (error: any) {
      console.error('❌ Erro ao carregar dados:', error)
      // Tentar buscar dados sem filtro de data como fallback
      try {
        const { data: fallbackData } = await supabase
          .from('performance_data')
          .select('*')
          .order('date', { ascending: false })
          .limit(100)
        
        if (fallbackData && fallbackData.length > 0) {
          console.log(`✅ Usando ${fallbackData.length} registros como fallback`)
          setData(fallbackData)
        }
      } catch (fallbackError) {
        console.error('❌ Erro no fallback:', fallbackError)
      }
    } finally {
      setLoading(false)
    }
  }

  // Calcular métricas agregadas
  const aggregated = data.reduce(
    (acc, item) => ({
      calls: acc.calls + (item.calls || 0),
      meetingsScheduled: acc.meetingsScheduled + (item.meetings_scheduled || 0),
      meetingsCompleted: acc.meetingsCompleted + (item.meetings_completed || 0),
      contracts: acc.contracts + (item.contracts_generated || 0),
      noshow: acc.noshow + (item.noshow || 0),
      closing: acc.closing + (item.closing || 0),
      leadTime: acc.leadTime + (item.lead_time || 0),
      conversionRate: acc.conversionRate + (item.conversion_rate || 0),
      onTime: acc.onTime + (item.on_time || 0),
      count: acc.count + 1,
    }),
    {
      calls: 0,
      meetingsScheduled: 0,
      meetingsCompleted: 0,
      contracts: 0,
      noshow: 0,
      closing: 0,
      leadTime: 0,
      conversionRate: 0,
      onTime: 0,
      count: 0,
    }
  )

  const avgLeadTime = aggregated.count > 0 ? aggregated.leadTime / aggregated.count : 0
  const avgConversionRate = aggregated.count > 0 ? aggregated.conversionRate / aggregated.count : 0
  const avgOnTime = aggregated.count > 0 ? aggregated.onTime / aggregated.count : 0

  // Agrupar por usuário para performance individual
  const byUser = data.reduce((acc, item) => {
    const userId = item.user_id || 'unknown'
    if (!acc[userId]) {
      acc[userId] = {
        userName: item.user_name || 'Unknown',
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
        },
      }
    }
    acc[userId].metrics.calls += item.calls || 0
    acc[userId].metrics.meetingsScheduled += item.meetings_scheduled || 0
    acc[userId].metrics.meetingsCompleted += item.meetings_completed || 0
    acc[userId].metrics.contracts += item.contracts_generated || 0
    acc[userId].metrics.noshow += item.noshow || 0
    acc[userId].metrics.closing += item.closing || 0
    acc[userId].metrics.leadTime += item.lead_time || 0
    acc[userId].metrics.conversionRate += item.conversion_rate || 0
    acc[userId].metrics.onTime += item.on_time || 0
    return acc
  }, {} as Record<string, any>)

  const individualData = Object.entries(byUser).map(([userId, value]: [string, any]) => ({
    userId,
    ...value,
  }))

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-gray-500">Carregando dados...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Filtro de Data - Melhorado */}
      <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <label className="text-sm font-semibold text-gray-700">Período de Análise:</label>
            </div>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              className="border border-gray-300 rounded-lg px-4 py-2 text-sm font-medium focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
            <span className="text-gray-400 font-medium">até</span>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              className="border border-gray-300 rounded-lg px-4 py-2 text-sm font-medium focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          <div className="text-sm text-gray-600">
            <span className="font-medium">{data.length}</span> registros encontrados
          </div>
        </div>
      </div>

      {/* KPIs Principais */}
      <KPICards
        calls={aggregated.calls}
        meetingsScheduled={aggregated.meetingsScheduled}
        meetingsCompleted={aggregated.meetingsCompleted}
        contracts={aggregated.contracts}
        noshow={aggregated.noshow}
        closing={aggregated.closing}
        avgLeadTime={avgLeadTime}
        conversionRate={avgConversionRate}
        onTime={avgOnTime}
      />

      {/* Insights Estratégicos */}
      <StrategicInsights
        conversionRate={avgConversionRate}
        avgLeadTime={avgLeadTime}
        meetingsCompleted={aggregated.meetingsCompleted}
        meetingsScheduled={aggregated.meetingsScheduled}
        contracts={aggregated.contracts}
        closing={aggregated.closing}
        noshow={aggregated.noshow}
        onTime={avgOnTime}
      />

      {/* Análise de Tendências */}
      <TrendAnalysis data={data} />

      {/* Gráficos de Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PerformanceChart data={data} />
        <ConversionFunnel
          meetingsScheduled={aggregated.meetingsScheduled}
          meetingsCompleted={aggregated.meetingsCompleted}
          contracts={aggregated.contracts}
          closing={aggregated.closing}
        />
      </div>

      {/* Métricas de Eficiência */}
      <EfficiencyMetrics
        meetingsScheduled={aggregated.meetingsScheduled}
        meetingsCompleted={aggregated.meetingsCompleted}
        contracts={aggregated.contracts}
        closing={aggregated.closing}
        calls={aggregated.calls}
        avgLeadTime={avgLeadTime}
        conversionRate={avgConversionRate}
      />

      {/* Comparação de Performance */}
      <PerformanceComparison data={data} />

      {/* Análise de Lead Time */}
      <LeadTimeAnalysis data={data} />

      {/* Performance Individual */}
      <IndividualPerformance data={individualData} />
    </div>
  )
}

