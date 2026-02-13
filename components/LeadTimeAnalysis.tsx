'use client'

import { useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { PerformanceData } from '@/lib/supabase'

interface LeadTimeAnalysisProps {
  data: PerformanceData[]
}

export default function LeadTimeAnalysis({ data }: LeadTimeAnalysisProps) {
  const chartData = useMemo(() => {
    const byUser = data.reduce((acc, item) => {
      const userName = item.user_name || 'Unknown'
      if (!acc[userName]) {
        acc[userName] = {
          userName,
          leadTime: 0,
          count: 0,
        }
      }
      if (item.lead_time) {
        acc[userName].leadTime += item.lead_time
        acc[userName].count += 1
      }
      return acc
    }, {} as Record<string, { userName: string; leadTime: number; count: number }>)

    return Object.values(byUser)
      .map((item) => ({
        userName: item.userName,
        leadTime: item.count > 0 ? item.leadTime / item.count : 0,
      }))
      .sort((a, b) => b.leadTime - a.leadTime)
  }, [data])

  const avgLeadTime = useMemo(() => {
    const total = data.reduce((sum, item) => sum + (item.lead_time || 0), 0)
    const count = data.filter((item) => item.lead_time).length
    return count > 0 ? total / count : 0
  }, [data])

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Análise de Lead Time
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          Tempo médio entre contatos com o lead (em horas)
        </p>
      </div>
      <div className="mb-4 p-4 bg-blue-50 rounded-lg">
        <p className="text-sm text-gray-700">
          <span className="font-semibold">Lead Time Médio Geral:</span>{' '}
          <span className="text-blue-600 font-bold">{avgLeadTime.toFixed(1)} horas</span>
        </p>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="userName"
            angle={-45}
            textAnchor="end"
            height={100}
            tick={{ fontSize: 12 }}
          />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
            }}
            formatter={(value: number) => `${value.toFixed(1)}h`}
          />
          <Legend />
          <Bar
            dataKey="leadTime"
            fill="#3b82f6"
            name="Lead Time (horas)"
            radius={[8, 8, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

