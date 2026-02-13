'use client'

import { useMemo } from 'react'
import { TrendingUp, TrendingDown, AlertCircle, CheckCircle, Target, Zap } from 'lucide-react'

interface StrategicInsightsProps {
  conversionRate: number
  avgLeadTime: number
  meetingsCompleted: number
  meetingsScheduled: number
  contracts: number
  closing: number
  noshow: number
  onTime: number
}

export default function StrategicInsights({
  conversionRate,
  avgLeadTime,
  meetingsCompleted,
  meetingsScheduled,
  contracts,
  closing,
  noshow,
  onTime,
}: StrategicInsightsProps) {
  const insights = useMemo(() => {
    const insightsList = []

    // Taxa de Conversão
    if (conversionRate >= 10) {
      insightsList.push({
        type: 'success',
        icon: CheckCircle,
        title: 'Excelente Taxa de Conversão',
        description: `Taxa de ${conversionRate.toFixed(2)}% está acima da média do mercado (8-10%)`,
        impact: 'Alto',
      })
    } else if (conversionRate < 5) {
      insightsList.push({
        type: 'warning',
        icon: AlertCircle,
        title: 'Taxa de Conversão Baixa',
        description: `Taxa de ${conversionRate.toFixed(2)}% está abaixo do ideal. Considere melhorar qualificação de leads.`,
        impact: 'Médio',
      })
    }

    // Taxa de Comparecimento
    const attendanceRate = meetingsScheduled > 0 ? (meetingsCompleted / meetingsScheduled) * 100 : 0
    if (attendanceRate < 70) {
      insightsList.push({
        type: 'warning',
        icon: AlertCircle,
        title: 'Taxa de Comparecimento Baixa',
        description: `Apenas ${attendanceRate.toFixed(1)}% das reuniões agendadas foram realizadas. No-show de ${noshow}.`,
        impact: 'Alto',
      })
    } else if (attendanceRate >= 85) {
      insightsList.push({
        type: 'success',
        icon: CheckCircle,
        title: 'Alta Taxa de Comparecimento',
        description: `${attendanceRate.toFixed(1)}% de comparecimento indica boa qualificação de leads.`,
        impact: 'Médio',
      })
    }

    // Taxa de Fechamento
    const closingRate = contracts > 0 ? (closing / contracts) * 100 : 0
    if (closingRate >= 80) {
      insightsList.push({
        type: 'success',
        icon: Target,
        title: 'Excelente Taxa de Fechamento',
        description: `${closingRate.toFixed(1)}% dos contratos foram fechados. Processo de vendas eficiente.`,
        impact: 'Alto',
      })
    } else if (closingRate < 50) {
      insightsList.push({
        type: 'warning',
        icon: AlertCircle,
        title: 'Oportunidade de Melhoria no Fechamento',
        description: `Apenas ${closingRate.toFixed(1)}% dos contratos foram fechados. Revise o processo de negociação.`,
        impact: 'Alto',
      })
    }

    // Lead Time
    if (avgLeadTime > 48) {
      insightsList.push({
        type: 'warning',
        icon: AlertCircle,
        title: 'Lead Time Elevado',
        description: `Tempo médio de ${avgLeadTime.toFixed(1)}h entre contatos pode impactar conversão.`,
        impact: 'Médio',
      })
    } else if (avgLeadTime <= 24) {
      insightsList.push({
        type: 'success',
        icon: Zap,
        title: 'Lead Time Otimizado',
        description: `Tempo médio de ${avgLeadTime.toFixed(1)}h indica resposta rápida aos leads.`,
        impact: 'Médio',
      })
    }

    // On Time
    if (onTime >= 95) {
      insightsList.push({
        type: 'success',
        icon: CheckCircle,
        title: 'Alta Pontualidade',
        description: `${onTime.toFixed(1)}% de atividades no prazo demonstra boa organização.`,
        impact: 'Médio',
      })
    }

    return insightsList
  }, [conversionRate, avgLeadTime, meetingsCompleted, meetingsScheduled, contracts, closing, noshow, onTime])

  if (insights.length === 0) {
    return null
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
          <Target className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Insights Estratégicos</h3>
          <p className="text-sm text-gray-600">Análise automática de performance e oportunidades</p>
        </div>
      </div>

      <div className="space-y-4">
        {insights.map((insight, index) => {
          const Icon = insight.icon
          const colorClasses = {
            success: 'bg-green-50 border-green-200 text-green-800',
            warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
            error: 'bg-red-50 border-red-200 text-red-800',
          }
          const iconColors = {
            success: 'text-green-600',
            warning: 'text-yellow-600',
            error: 'text-red-600',
          }

          return (
            <div
              key={index}
              className={`p-4 rounded-lg border-l-4 ${colorClasses[insight.type as keyof typeof colorClasses]}`}
            >
              <div className="flex items-start gap-3">
                <Icon className={`w-5 h-5 mt-0.5 ${iconColors[insight.type as keyof typeof iconColors]}`} />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-semibold">{insight.title}</h4>
                    <span className="text-xs px-2 py-1 bg-white/50 rounded-full font-medium">
                      Impacto: {insight.impact}
                    </span>
                  </div>
                  <p className="text-sm opacity-90">{insight.description}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

