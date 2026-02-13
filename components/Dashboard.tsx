'use client'

import { useEffect, useState } from 'react'
import { supabase, PerformanceData } from '@/lib/supabase'
import KPICards from './KPICards'
import PerformanceChart from './PerformanceChart'
import IndividualPerformance from './IndividualPerformance'
import LeadTimeAnalysis from './LeadTimeAnalysis'
import ConversionFunnel from './ConversionFunnel'
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
  }, [dateRange])

  const loadData = async () => {
    try {
      setLoading(true)
      const { data: performanceData, error } = await supabase
        .from('performance_data')
        .select('*')
        .gte('date', dateRange.start)
        .lte('date', dateRange.end)
        .order('date', { ascending: false })

      if (error) throw error
      setData(performanceData || [])
    } catch (error: any) {
      console.error('Error loading data:', error)
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
      {/* Filtro de Data */}
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-gray-700">Período:</label>
          <input
            type="date"
            value={dateRange.start}
            onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm"
          />
          <span className="text-gray-500">até</span>
          <input
            type="date"
            value={dateRange.end}
            onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm"
          />
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

      {/* Análise de Lead Time */}
      <LeadTimeAnalysis data={data} />

      {/* Performance Individual */}
      <IndividualPerformance data={individualData} />
    </div>
  )
}

