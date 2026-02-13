'use client'

import { useEffect, useState } from 'react'
import Dashboard from '@/components/Dashboard'
import { supabase } from '@/lib/supabase'
import { growthstationAPI } from '@/lib/growthstation-api'
import { processPerformanceData } from '@/lib/data-processor'
import { PerformanceData } from '@/lib/supabase'

export default function Home() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastSync, setLastSync] = useState<Date | null>(null)

  useEffect(() => {
    syncData()
    // Sincronizar a cada 5 minutos
    const interval = setInterval(syncData, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  const syncData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Buscar dados da API do Growthstation
      const performanceData = await growthstationAPI.getPerformanceData()
      
      if (!performanceData || !performanceData.data || performanceData.data.length === 0) {
        throw new Error('Nenhum dado retornado da API')
      }

      // Processar e salvar no Supabase
      const processed = processPerformanceData(performanceData.data)

      // Salvar dados individuais
      for (const item of processed.individual) {
        const performanceRecord: Omit<PerformanceData, 'id' | 'created_at' | 'updated_at'> = {
          user_id: item.userId,
          user_name: item.userName,
          date: new Date().toISOString().split('T')[0],
          daily_activities: item.metrics.dailyActivities,
          on_time: item.metrics.onTime,
          leads_started: 0, // Será preenchido quando disponível na API
          leads_finished: 0,
          conversion_rate: item.metrics.conversionRate,
          earnings: 0,
          calls: item.metrics.calls,
          meetings_scheduled: item.metrics.meetingsScheduled,
          meetings_completed: item.metrics.meetingsCompleted,
          contracts_generated: item.metrics.contractsGenerated,
          noshow: item.metrics.noshow,
          closing: item.metrics.closing,
          lead_time: item.metrics.leadTime,
        }

        // Upsert no Supabase
        const { error: dbError } = await supabase
          .from('performance_data')
          .upsert(performanceRecord, {
            onConflict: 'user_id,date',
            ignoreDuplicates: false,
          })

        if (dbError) {
          console.error('Error saving to Supabase:', dbError)
        }
      }

      setLastSync(new Date())
    } catch (err: any) {
      console.error('Sync error:', err)
      setError(err.message || 'Erro ao sincronizar dados')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Growthstation Analytics Dashboard
            </h1>
            <p className="text-gray-600 mt-1">
              Análise completa de performance e KPIs estratégicos
            </p>
          </div>
          <div className="text-right">
            {lastSync && (
              <p className="text-sm text-gray-500">
                Última sincronização: {lastSync.toLocaleTimeString('pt-BR')}
              </p>
            )}
            <button
              onClick={syncData}
              disabled={loading}
              className="mt-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Sincronizando...' : 'Sincronizar Agora'}
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        <Dashboard />
      </div>
    </main>
  )
}

