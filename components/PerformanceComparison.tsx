'use client'

import { useMemo } from 'react'
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Legend } from 'recharts'
import { PerformanceData } from '@/lib/supabase'

interface PerformanceComparisonProps {
  data: PerformanceData[]
}

export default function PerformanceComparison({ data }: PerformanceComparisonProps) {
  const comparisonData = useMemo(() => {
    const byUser = data.reduce((acc, item) => {
      const userId = item.user_id || 'unknown'
      if (!acc[userId]) {
        acc[userId] = {
          userName: item.user_name || 'Unknown',
          calls: 0,
          meetings: 0,
          contracts: 0,
          closing: 0,
          conversionRate: 0,
          onTime: 0,
          count: 0,
        }
      }
      acc[userId].calls += item.calls || 0
      acc[userId].meetings += item.meetings_completed || 0
      acc[userId].contracts += item.contracts_generated || 0
      acc[userId].closing += item.closing || 0
      acc[userId].conversionRate += item.conversion_rate || 0
      acc[userId].onTime += item.on_time || 0
      acc[userId].count += 1
      return acc
    }, {} as Record<string, any>)

    // Calcular médias para normalização
    const users = Object.values(byUser)
    const maxValues = {
      calls: Math.max(...users.map((u: any) => u.calls), 1),
      meetings: Math.max(...users.map((u: any) => u.meetings), 1),
      contracts: Math.max(...users.map((u: any) => u.contracts), 1),
      closing: Math.max(...users.map((u: any) => u.closing), 1),
      conversionRate: Math.max(...users.map((u: any) => (u.conversionRate / u.count) || 0), 1),
      onTime: Math.max(...users.map((u: any) => (u.onTime / u.count) || 0), 1),
    }

    return users.slice(0, 3).map((user: any) => ({
      user: user.userName.split(' ')[0], // Primeiro nome
      calls: ((user.calls / maxValues.calls) * 100).toFixed(0),
      meetings: ((user.meetings / maxValues.meetings) * 100).toFixed(0),
      contracts: ((user.contracts / maxValues.contracts) * 100).toFixed(0),
      closing: ((user.closing / maxValues.closing) * 100).toFixed(0),
      conversionRate: (((user.conversionRate / user.count) / maxValues.conversionRate) * 100).toFixed(0),
      onTime: (((user.onTime / user.count) / maxValues.onTime) * 100).toFixed(0),
    }))
  }, [data])

  if (comparisonData.length === 0) {
    return null
  }

  const colors = ['#3b82f6', '#10b981', '#f59e0b']

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
          <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Comparação de Performance</h3>
          <p className="text-sm text-gray-600">Análise comparativa entre os principais SDRs</p>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={400}>
        <RadarChart data={comparisonData}>
          <PolarGrid stroke="#e5e7eb" />
          <PolarAngleAxis
            dataKey="user"
            tick={{ fontSize: 12, fill: '#6b7280' }}
          />
          <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 10 }} />
          {comparisonData.map((item, index) => (
            <Radar
              key={index}
              name={item.user}
              dataKey="calls"
              stroke={colors[index]}
              fill={colors[index]}
              fillOpacity={0.3}
              strokeWidth={2}
            />
          ))}
          <Legend />
        </RadarChart>
      </ResponsiveContainer>

      <div className="mt-4 grid grid-cols-3 gap-4 text-center">
        {comparisonData.map((item, index) => (
          <div key={index} className="p-3 bg-gray-50 rounded-lg">
            <div
              className="w-3 h-3 rounded-full mx-auto mb-2"
              style={{ backgroundColor: colors[index] }}
            />
            <p className="text-sm font-medium text-gray-900">{item.user}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

