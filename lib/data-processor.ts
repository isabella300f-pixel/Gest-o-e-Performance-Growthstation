import { PerformanceData, AggregatedMetrics } from './supabase'
import { GrowthstationPerformance } from './growthstation-api'

export interface ProcessedMetrics {
  calls: number
  meetingsScheduled: number
  meetingsCompleted: number
  contractsGenerated: number
  noshow: number
  closing: number
  leadTime: number // em horas
  conversionRate: number
  onTime: number
  dailyActivities: number
}

export interface IndividualPerformance {
  userId: string
  userName: string
  metrics: ProcessedMetrics
  trend?: {
    calls: number
    meetings: number
    contracts: number
  }
}

export interface DashboardData {
  individual: IndividualPerformance[]
  aggregated: ProcessedMetrics
  timeSeries: {
    date: string
    calls: number
    meetings: number
    contracts: number
    conversionRate: number
  }[]
}

export function processPerformanceData(
  growthstationData: GrowthstationPerformance[],
  additionalData?: {
    calls?: Record<string, number>
    meetings?: Record<string, { scheduled: number; completed: number }>
    contracts?: Record<string, number>
    noshow?: Record<string, number>
    closing?: Record<string, number>
    leadTime?: Record<string, number>
  }
): DashboardData {
  const individual: IndividualPerformance[] = []
  let totalCalls = 0
  let totalMeetingsScheduled = 0
  let totalMeetingsCompleted = 0
  let totalContracts = 0
  let totalNoshow = 0
  let totalClosing = 0
  let totalLeadTime = 0
  let totalConversionRate = 0
  let totalOnTime = 0
  let totalDailyActivities = 0
  let count = 0

  growthstationData.forEach((item) => {
    if (item.nome === 'Média Por SDR' || item.nome === 'Total') {
      return // Skip aggregated rows
    }

    // Usar userId da API se disponível, senão gerar a partir do nome
    const userId = item.userId || item.nome.toLowerCase().replace(/\s+/g, '_')
    
    // Buscar dados adicionais usando o userId (pode ser ID real ou nome normalizado)
    const userIdForData = item.userId || userId
    const calls = additionalData?.calls?.[userIdForData] ?? additionalData?.calls?.[userId] ?? 0
    const meetings = additionalData?.meetings?.[userIdForData] ?? additionalData?.meetings?.[userId] ?? { scheduled: 0, completed: 0 }
    const contracts = additionalData?.contracts?.[userIdForData] ?? additionalData?.contracts?.[userId] ?? 0
    const noshow = additionalData?.noshow?.[userIdForData] ?? additionalData?.noshow?.[userId] ?? 0
    const closing = additionalData?.closing?.[userIdForData] ?? additionalData?.closing?.[userId] ?? 0
    const leadTime = additionalData?.leadTime?.[userIdForData] ?? additionalData?.leadTime?.[userId] ?? 0

    const metrics: ProcessedMetrics = {
      calls,
      meetingsScheduled: meetings.scheduled,
      meetingsCompleted: meetings.completed,
      contractsGenerated: contracts,
      noshow,
      closing,
      leadTime,
      conversionRate: item.taxa_conversao,
      onTime: item.on_time,
      dailyActivities: item.atividades_diarias,
    }

    individual.push({
      userId,
      userName: item.nome,
      metrics,
    })

    totalCalls += calls
    totalMeetingsScheduled += meetings.scheduled
    totalMeetingsCompleted += meetings.completed
    totalContracts += contracts
    totalNoshow += noshow
    totalClosing += closing
    totalLeadTime += leadTime
    totalConversionRate += item.taxa_conversao
    totalOnTime += item.on_time
    totalDailyActivities += item.atividades_diarias
    count++
  })

  const aggregated: ProcessedMetrics = {
    calls: totalCalls,
    meetingsScheduled: totalMeetingsScheduled,
    meetingsCompleted: totalMeetingsCompleted,
    contractsGenerated: totalContracts,
    noshow: totalNoshow,
    closing: totalClosing,
    leadTime: count > 0 ? totalLeadTime / count : 0,
    conversionRate: count > 0 ? totalConversionRate / count : 0,
    onTime: count > 0 ? totalOnTime / count : 0,
    dailyActivities: totalDailyActivities,
  }

  return {
    individual,
    aggregated,
    timeSeries: [], // Será preenchido com dados históricos do Supabase
  }
}

export function calculateLeadTime(contacts: Array<{ date: string }>): number {
  if (contacts.length < 2) return 0

  const sorted = contacts.sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  )

  let totalHours = 0
  for (let i = 1; i < sorted.length; i++) {
    const diff = new Date(sorted[i].date).getTime() - new Date(sorted[i - 1].date).getTime()
    totalHours += diff / (1000 * 60 * 60) // Converter para horas
  }

  return totalHours / (sorted.length - 1) // Média em horas
}

