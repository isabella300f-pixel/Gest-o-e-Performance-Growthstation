'use client'

import { Phone, Calendar, CheckCircle, FileText, XCircle, Target, Clock, TrendingUp } from 'lucide-react'

interface KPICardsProps {
  calls: number
  meetingsScheduled: number
  meetingsCompleted: number
  contracts: number
  noshow: number
  closing: number
  avgLeadTime: number
  conversionRate: number
  onTime: number
}

export default function KPICards({
  calls,
  meetingsScheduled,
  meetingsCompleted,
  contracts,
  noshow,
  closing,
  avgLeadTime,
  conversionRate,
  onTime,
}: KPICardsProps) {
  const kpis = [
    {
      title: 'Ligações',
      value: calls.toLocaleString('pt-BR'),
      icon: Phone,
      color: 'bg-blue-500',
      trend: null,
    },
    {
      title: 'Reuniões Agendadas',
      value: meetingsScheduled.toLocaleString('pt-BR'),
      icon: Calendar,
      color: 'bg-purple-500',
      trend: null,
    },
    {
      title: 'Reuniões Realizadas',
      value: meetingsCompleted.toLocaleString('pt-BR'),
      icon: CheckCircle,
      color: 'bg-green-500',
      trend: meetingsScheduled > 0 ? ((meetingsCompleted / meetingsScheduled) * 100).toFixed(1) + '%' : '0%',
    },
    {
      title: 'Contratos Gerados',
      value: contracts.toLocaleString('pt-BR'),
      icon: FileText,
      color: 'bg-orange-500',
      trend: null,
    },
    {
      title: 'No-Show',
      value: noshow.toLocaleString('pt-BR'),
      icon: XCircle,
      color: 'bg-red-500',
      trend: meetingsScheduled > 0 ? ((noshow / meetingsScheduled) * 100).toFixed(1) + '%' : '0%',
    },
    {
      title: 'Fechamentos',
      value: closing.toLocaleString('pt-BR'),
      icon: Target,
      color: 'bg-emerald-500',
      trend: contracts > 0 ? ((closing / contracts) * 100).toFixed(1) + '%' : '0%',
    },
    {
      title: 'Lead Time Médio',
      value: `${avgLeadTime.toFixed(1)}h`,
      icon: Clock,
      color: 'bg-indigo-500',
      trend: null,
    },
    {
      title: 'Taxa de Conversão',
      value: `${conversionRate.toFixed(2)}%`,
      icon: TrendingUp,
      color: 'bg-yellow-500',
      trend: null,
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {kpis.map((kpi, index) => {
        const Icon = kpi.icon
        return (
          <div
            key={index}
            className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{kpi.title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{kpi.value}</p>
                {kpi.trend && (
                  <p className="text-xs text-gray-500 mt-1">{kpi.trend}</p>
                )}
              </div>
              <div className={`${kpi.color} p-3 rounded-lg`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

