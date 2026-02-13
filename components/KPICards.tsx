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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
      {kpis.map((kpi, index) => {
        const Icon = kpi.icon
        return (
          <div
            key={index}
            className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:shadow-lg transition-all duration-200 group"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                  {kpi.title}
                </p>
                <p className="text-3xl font-bold text-gray-900 mb-1">{kpi.value}</p>
                {kpi.trend && (
                  <div className="flex items-center gap-1 mt-2">
                    <span className="text-xs font-medium text-gray-600">{kpi.trend}</span>
                    <span className="text-xs text-gray-400">• Taxa</span>
                  </div>
                )}
              </div>
              <div className={`${kpi.color} p-3 rounded-xl shadow-sm group-hover:scale-110 transition-transform duration-200`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="pt-4 border-t border-gray-100">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500">Métrica estratégica</span>
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

