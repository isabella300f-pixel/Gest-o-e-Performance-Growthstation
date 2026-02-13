'use client'

import { useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { TrendingUp, Clock, Target, Zap } from 'lucide-react'

interface EfficiencyMetricsProps {
  meetingsScheduled: number
  meetingsCompleted: number
  contracts: number
  closing: number
  calls: number
  avgLeadTime: number
  conversionRate: number
}

export default function EfficiencyMetrics({
  meetingsScheduled,
  meetingsCompleted,
  contracts,
  closing,
  calls,
  avgLeadTime,
  conversionRate,
}: EfficiencyMetricsProps) {
  const metrics = useMemo(() => {
    const attendanceRate = meetingsScheduled > 0 ? (meetingsCompleted / meetingsScheduled) * 100 : 0
    const meetingToContractRate = meetingsCompleted > 0 ? (contracts / meetingsCompleted) * 100 : 0
    const contractToCloseRate = contracts > 0 ? (closing / contracts) * 100 : 0
    const callToMeetingRate = calls > 0 ? (meetingsScheduled / calls) * 100 : 0

    return {
      attendanceRate,
      meetingToContractRate,
      contractToCloseRate,
      callToMeetingRate,
    }
  }, [meetingsScheduled, meetingsCompleted, contracts, closing, calls])

  const chartData = [
    {
      name: 'Comparecimento',
      value: metrics.attendanceRate,
      target: 80,
      color: '#3b82f6',
    },
    {
      name: 'Reunião → Contrato',
      value: metrics.meetingToContractRate,
      target: 30,
      color: '#10b981',
    },
    {
      name: 'Contrato → Fechamento',
      value: metrics.contractToCloseRate,
      target: 70,
      color: '#f59e0b',
    },
    {
      name: 'Ligação → Reunião',
      value: metrics.callToMeetingRate,
      target: 15,
      color: '#8b5cf6',
    },
  ]

  const efficiencyScore = useMemo(() => {
    const scores = [
      metrics.attendanceRate >= 80 ? 25 : (metrics.attendanceRate / 80) * 25,
      metrics.meetingToContractRate >= 30 ? 25 : (metrics.meetingToContractRate / 30) * 25,
      metrics.contractToCloseRate >= 70 ? 25 : (metrics.contractToCloseRate / 70) * 25,
      metrics.callToMeetingRate >= 15 ? 25 : (metrics.callToMeetingRate / 15) * 25,
    ]
    return scores.reduce((sum, score) => sum + Math.min(score, 25), 0)
  }, [metrics])

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
          <Zap className="w-5 h-5 text-purple-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Métricas de Eficiência</h3>
          <p className="text-sm text-gray-600">Análise de conversão entre etapas do funil</p>
        </div>
      </div>

      {/* Score de Eficiência */}
      <div className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-100">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 mb-1">Score de Eficiência Geral</p>
            <p className="text-3xl font-bold text-gray-900">{efficiencyScore.toFixed(0)}/100</p>
          </div>
          <div className="w-24 h-24 relative">
            <svg className="transform -rotate-90 w-24 h-24">
              <circle
                cx="48"
                cy="48"
                r="40"
                stroke="#e5e7eb"
                strokeWidth="8"
                fill="none"
              />
              <circle
                cx="48"
                cy="48"
                r="40"
                stroke={efficiencyScore >= 75 ? '#10b981' : efficiencyScore >= 50 ? '#f59e0b' : '#ef4444'}
                strokeWidth="8"
                fill="none"
                strokeDasharray={`${(efficiencyScore / 100) * 251.2} 251.2`}
                strokeLinecap="round"
                className="transition-all duration-500"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-lg font-semibold text-gray-900">{efficiencyScore.toFixed(0)}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Gráfico de Barras */}
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 12 }} />
          <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 12 }} />
          <Tooltip
            formatter={(value: number) => `${value.toFixed(1)}%`}
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
            }}
          />
          <Bar dataKey="value" radius={[0, 8, 8, 0]}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
          <Bar dataKey="target" radius={[0, 8, 8, 0]} fill="#e5e7eb" fillOpacity={0.3} name="Meta" />
        </BarChart>
      </ResponsiveContainer>

      {/* Métricas Detalhadas */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        {chartData.map((metric, index) => (
          <div key={index} className="p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-600 mb-1">{metric.name}</p>
            <p className="text-lg font-semibold text-gray-900">{metric.value.toFixed(1)}%</p>
            <p className="text-xs text-gray-500 mt-1">Meta: {metric.target}%</p>
            <div className="mt-2 h-1 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min((metric.value / metric.target) * 100, 100)}%`,
                  backgroundColor: metric.value >= metric.target ? '#10b981' : '#f59e0b',
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

