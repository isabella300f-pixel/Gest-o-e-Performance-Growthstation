'use client'

import { useMemo } from 'react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { PerformanceData } from '@/lib/supabase'
import { format } from 'date-fns'

interface TrendAnalysisProps {
  data: PerformanceData[]
}

export default function TrendAnalysis({ data }: TrendAnalysisProps) {
  const chartData = useMemo(() => {
    const grouped = data.reduce((acc, item) => {
      const date = item.date
      if (!acc[date]) {
        acc[date] = {
          date,
          calls: 0,
          meetings: 0,
          contracts: 0,
          closing: 0,
          conversionRate: 0,
          count: 0,
        }
      }
      acc[date].calls += item.calls || 0
      acc[date].meetings += item.meetings_completed || 0
      acc[date].contracts += item.contracts_generated || 0
      acc[date].closing += item.closing || 0
      acc[date].conversionRate += item.conversion_rate || 0
      acc[date].count += 1
      return acc
    }, {} as Record<string, any>)

    return Object.values(grouped)
      .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map((item: any) => ({
        ...item,
        dateFormatted: format(new Date(item.date), 'dd/MM'),
        avgConversionRate: item.count > 0 ? item.conversionRate / item.count : 0,
      }))
  }, [data])

  // Calcular tendências
  const trends = useMemo(() => {
    if (chartData.length < 2) return null

    const firstHalf = chartData.slice(0, Math.floor(chartData.length / 2))
    const secondHalf = chartData.slice(Math.floor(chartData.length / 2))

    const avgFirst = {
      calls: firstHalf.reduce((sum: number, item: any) => sum + item.calls, 0) / firstHalf.length,
      meetings: firstHalf.reduce((sum: number, item: any) => sum + item.meetings, 0) / firstHalf.length,
      contracts: firstHalf.reduce((sum: number, item: any) => sum + item.contracts, 0) / firstHalf.length,
    }

    const avgSecond = {
      calls: secondHalf.reduce((sum: number, item: any) => sum + item.calls, 0) / secondHalf.length,
      meetings: secondHalf.reduce((sum: number, item: any) => sum + item.meetings, 0) / secondHalf.length,
      contracts: secondHalf.reduce((sum: number, item: any) => sum + item.contracts, 0) / secondHalf.length,
    }

    return {
      calls: ((avgSecond.calls - avgFirst.calls) / avgFirst.calls) * 100,
      meetings: ((avgSecond.meetings - avgFirst.meetings) / avgFirst.meetings) * 100,
      contracts: ((avgSecond.contracts - avgFirst.contracts) / avgFirst.contracts) * 100,
    }
  }, [chartData])

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Análise de Tendências</h3>
          <p className="text-sm text-gray-600 mt-1">Evolução temporal das principais métricas</p>
        </div>
        {trends && (
          <div className="flex items-center gap-4 text-sm">
            <div className="text-center">
              <div className={`font-semibold ${trends.calls >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {trends.calls >= 0 ? '+' : ''}{trends.calls.toFixed(1)}%
              </div>
              <div className="text-gray-500 text-xs">Ligações</div>
            </div>
            <div className="text-center">
              <div className={`font-semibold ${trends.meetings >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {trends.meetings >= 0 ? '+' : ''}{trends.meetings.toFixed(1)}%
              </div>
              <div className="text-gray-500 text-xs">Reuniões</div>
            </div>
            <div className="text-center">
              <div className={`font-semibold ${trends.contracts >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {trends.contracts >= 0 ? '+' : ''}{trends.contracts.toFixed(1)}%
              </div>
              <div className="text-gray-500 text-xs">Contratos</div>
            </div>
          </div>
        )}
      </div>

      <ResponsiveContainer width="100%" height={350}>
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="colorCalls" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1} />
            </linearGradient>
            <linearGradient id="colorMeetings" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0.1} />
            </linearGradient>
            <linearGradient id="colorContracts" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f97316" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#f97316" stopOpacity={0.1} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="dateFormatted"
            tick={{ fontSize: 12, fill: '#6b7280' }}
            stroke="#e5e7eb"
          />
          <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} stroke="#e5e7eb" />
          <Tooltip
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            }}
          />
          <Legend />
          <Area
            type="monotone"
            dataKey="calls"
            stroke="#3b82f6"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorCalls)"
            name="Ligações"
          />
          <Area
            type="monotone"
            dataKey="meetings"
            stroke="#10b981"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorMeetings)"
            name="Reuniões"
          />
          <Area
            type="monotone"
            dataKey="contracts"
            stroke="#f97316"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorContracts)"
            name="Contratos"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

