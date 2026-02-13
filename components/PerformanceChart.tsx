'use client'

import { useMemo } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { PerformanceData } from '@/lib/supabase'
import { format } from 'date-fns'

interface PerformanceChartProps {
  data: PerformanceData[]
}

export default function PerformanceChart({ data }: PerformanceChartProps) {
  const chartData = useMemo(() => {
    const grouped = data.reduce((acc, item) => {
      const date = item.date
      if (!acc[date]) {
        acc[date] = {
          date,
          calls: 0,
          meetings: 0,
          contracts: 0,
        }
      }
      acc[date].calls += item.calls || 0
      acc[date].meetings += item.meetings_completed || 0
      acc[date].contracts += item.contracts_generated || 0
      return acc
    }, {} as Record<string, any>)

    return Object.values(grouped)
      .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map((item: any) => ({
        ...item,
        dateFormatted: format(new Date(item.date), 'dd/MM'),
      }))
  }, [data])

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Evolução de Performance
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="dateFormatted"
            tick={{ fontSize: 12 }}
          />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
            }}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="calls"
            stroke="#3b82f6"
            strokeWidth={2}
            name="Ligações"
            dot={{ r: 4 }}
          />
          <Line
            type="monotone"
            dataKey="meetings"
            stroke="#10b981"
            strokeWidth={2}
            name="Reuniões"
            dot={{ r: 4 }}
          />
          <Line
            type="monotone"
            dataKey="contracts"
            stroke="#f97316"
            strokeWidth={2}
            name="Contratos"
            dot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

