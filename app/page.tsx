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
      let performanceData
      try {
        console.log('🔄 Buscando dados da API...')
        performanceData = await growthstationAPI.getPerformanceData()
        console.log('📊 Dados recebidos:', {
          hasData: !!performanceData,
          hasDataArray: !!performanceData?.data,
          dataLength: performanceData?.data?.length || 0,
        })
      } catch (apiError: any) {
        console.error('❌ Erro ao buscar da API:', {
          message: apiError.message,
          stack: apiError.stack,
        })
        // Continuar - vamos usar dados do Supabase como fallback
        performanceData = null
      }
      
      // Se não houver dados da API, usar dados já salvos no Supabase
      if (!performanceData || !performanceData.data || performanceData.data.length === 0) {
        console.warn('⚠️ Nenhum dado retornado da API - usando dados do Supabase como fallback', {
          performanceData,
          hasData: !!performanceData,
          dataLength: performanceData?.data?.length || 0,
        })
        
        // Buscar dados mais recentes do Supabase
        const { data: supabaseData, error: supabaseError } = await supabase
          .from('performance_data')
          .select('*')
          .order('date', { ascending: false })
          .limit(100)
        
        if (supabaseError) {
          console.error('Erro ao buscar do Supabase:', supabaseError)
          setError('Não foi possível buscar dados. A API não está disponível e não há dados salvos. Verifique se a variável GROWTHSTATION_API_URL está configurada como https://api.gsengage.com/api/v1 no Vercel.')
        } else if (supabaseData && supabaseData.length > 0) {
          setError(null) // Limpar erro se houver dados do Supabase
          console.log(`✅ Usando ${supabaseData.length} registros do Supabase`)
        } else {
          setError('API não retornou dados e não há dados salvos. Verifique: 1) Se GROWTHSTATION_API_URL está como https://api.gsengage.com/api/v1 no Vercel, 2) Se a API key está correta, 3) Se há prospecções e leads na plataforma.')
        }
        
        setLastSync(new Date())
        return
      }

      console.log(`✅ API retornou ${performanceData.data.length} registros de performance`)

      // Processar e salvar no Supabase
      const processed = processPerformanceData(performanceData.data)
      
      console.log(`Processando ${processed.individual.length} registros individuais`)

      // Salvar dados individuais
      let savedCount = 0
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
        } else {
          savedCount++
        }
      }

      console.log(`✅ ${savedCount} registros salvos no Supabase`)
      setError(null) // Limpar qualquer erro anterior
      setLastSync(new Date())
    } catch (err: any) {
      console.error('Sync error:', err)
      
      // Tentar buscar dados do Supabase como fallback
      try {
        const { data: supabaseData } = await supabase
          .from('performance_data')
          .select('*')
          .order('date', { ascending: false })
          .limit(100)
        
        if (supabaseData && supabaseData.length > 0) {
          setError(null) // Limpar erro se houver dados do Supabase
          console.log(`Usando ${supabaseData.length} registros do Supabase como fallback`)
          setLastSync(new Date())
          return
        }
      } catch (supabaseError) {
        console.error('Erro ao buscar do Supabase:', supabaseError)
      }
      
      // Se for erro de API, mostrar mensagem mais amigável
      if (err.message?.includes('404') || err.message?.includes('not found')) {
        setError('Endpoint da API não encontrado. Usando dados salvos anteriormente, se disponíveis.')
      } else if (err.message?.includes('500')) {
        setError('Erro no servidor ao buscar dados. Usando dados salvos anteriormente, se disponíveis.')
      } else {
        setError(err.message || 'Erro ao sincronizar dados. Verificando dados salvos...')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header Profissional */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">GS</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Dashboard de Performance Estratégica
                </h1>
                <p className="text-sm text-gray-600 mt-0.5">
                  Análise Executiva • Growthstation Engage
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                {lastSync && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span>Última atualização: {lastSync.toLocaleTimeString('pt-BR')}</span>
                  </div>
                )}
              </div>
              <button
                onClick={syncData}
                disabled={loading}
                className="px-5 py-2.5 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-lg hover:from-primary-700 hover:to-primary-800 disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-md transition-all duration-200 flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Sincronizando...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <span>Sincronizar</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-r-lg shadow-sm">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">Erro ao sincronizar:</span>
              <span>{error}</span>
            </div>
          </div>
        )}

        <Dashboard />
      </div>
    </main>
  )
}

