import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials not found. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Tipos para as tabelas do Supabase
export interface PerformanceData {
  id?: string
  user_id?: string
  user_name?: string
  date: string
  daily_activities: number
  on_time: number
  leads_started: number
  leads_finished: number
  conversion_rate: number
  earnings: number
  calls: number
  meetings_scheduled: number
  meetings_completed: number
  contracts_generated: number
  noshow: number
  closing: number
  lead_time: number // em horas
  created_at?: string
  updated_at?: string
}

export interface AggregatedMetrics {
  id?: string
  date: string
  total_calls: number
  total_meetings_scheduled: number
  total_meetings_completed: number
  total_contracts: number
  total_noshow: number
  total_closing: number
  avg_lead_time: number
  created_at?: string
}

