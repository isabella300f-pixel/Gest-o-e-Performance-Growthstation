'use client'

import { useEffect, useState } from 'react'
import Dashboard from '@/components/Dashboard'
import { supabase } from '@/lib/supabase'

export default function Home() {
  const [syncing, setSyncing] = useState(false)
  const [syncError, setSyncError] = useState<string | null>(null)
  const [lastSync, setLastSync] = useState<Date | null>(null)
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle')

  useEffect(() => {
    // Carregar última data de sincronização do Supabase
    loadLastSync()
    
    // Sincronizar em background ao carregar (sem bloquear UI)
    syncInBackground()
    
    // Sincronizar a cada 10 minutos em background
    const interval = setInterval(syncInBackground, 10 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  const loadLastSync = async () => {
    try {
      // Buscar a data mais recente dos dados salvos
      const { data, error } = await supabase
        .from('performance_data')
        .select('updated_at')
        .order('updated_at', { ascending: false })
        .limit(1)
      
      if (!error && data && data.length > 0) {
        setLastSync(new Date(data[0].updated_at))
      }
    } catch (err) {
      console.error('Erro ao carregar última sincronização:', err)
    }
  }

  const syncInBackground = async () => {
    // Não bloquear a UI - sincronização em background
    setSyncing(true)
    setSyncStatus('syncing')
    setSyncError(null)

    try {
      console.log('🔄 Iniciando sincronização em background...')
      
      // Usar a rota POST /api/sync que já processa e salva no Supabase
      const response = await fetch('/api/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `Erro ${response.status}: ${response.statusText}`)
      }

      const result = await response.json()
      console.log('✅ Sincronização concluída:', result)
      
      setSyncStatus('success')
      setLastSync(new Date())
      setSyncError(null)
      
      // Atualizar dados do Dashboard após 2 segundos (dar tempo para o Supabase processar)
      setTimeout(() => {
        console.log('🔄 Disparando evento de refresh do Dashboard...')
        window.dispatchEvent(new Event('supabase:refresh'))
      }, 2000)
      
    } catch (err: any) {
      console.error('❌ Erro na sincronização:', err)
      setSyncStatus('error')
      setSyncError(err.message || 'Erro ao sincronizar dados')
      
      // Não mostrar erro crítico - a aplicação continua funcionando com dados do Supabase
      console.warn('⚠️ Sincronização falhou, mas a aplicação continua com dados do Supabase')
    } finally {
      setSyncing(false)
      // Resetar status após 3 segundos
      setTimeout(() => {
        if (syncStatus === 'success' || syncStatus === 'error') {
          setSyncStatus('idle')
        }
      }, 3000)
    }
  }

  const handleManualSync = async () => {
    await syncInBackground()
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
                    <div className={`w-2 h-2 rounded-full ${
                      syncStatus === 'syncing' ? 'bg-yellow-500 animate-pulse' :
                      syncStatus === 'success' ? 'bg-green-500' :
                      syncStatus === 'error' ? 'bg-red-500' :
                      'bg-green-500'
                    }`}></div>
                    <span>
                      {syncStatus === 'syncing' && 'Sincronizando...'}
                      {syncStatus === 'success' && `Atualizado: ${lastSync.toLocaleTimeString('pt-BR')}`}
                      {syncStatus === 'error' && 'Erro na sincronização'}
                      {syncStatus === 'idle' && `Última atualização: ${lastSync.toLocaleTimeString('pt-BR')}`}
                    </span>
                  </div>
                )}
              </div>
              <button
                onClick={handleManualSync}
                disabled={syncing}
                className={`px-5 py-2.5 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-lg hover:from-primary-700 hover:to-primary-800 disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-md transition-all duration-200 flex items-center gap-2 ${
                  syncStatus === 'success' ? 'bg-green-600' : ''
                }`}
              >
                {syncing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Sincronizando...</span>
                  </>
                ) : syncStatus === 'success' ? (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Sincronizado</span>
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
        {syncError && syncStatus === 'error' && (
          <div className="mb-6 p-4 bg-yellow-50 border-l-4 border-yellow-500 text-yellow-800 rounded-r-lg shadow-sm">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <div>
                <span className="font-medium">Aviso de sincronização:</span>
                <span className="ml-2">{syncError}</span>
                <p className="text-sm mt-1 text-yellow-700">
                  A aplicação está funcionando com dados salvos anteriormente. Os dados serão atualizados quando a sincronização for bem-sucedida.
                </p>
              </div>
            </div>
          </div>
        )}

        <Dashboard />
      </div>
    </main>
  )
}

