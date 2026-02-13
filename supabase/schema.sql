-- Tabela para armazenar dados de performance
CREATE TABLE IF NOT EXISTS performance_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  user_name TEXT,
  date DATE NOT NULL,
  daily_activities INTEGER DEFAULT 0,
  on_time DECIMAL(5, 2) DEFAULT 0,
  leads_started INTEGER DEFAULT 0,
  leads_finished INTEGER DEFAULT 0,
  conversion_rate DECIMAL(5, 2) DEFAULT 0,
  earnings INTEGER DEFAULT 0,
  calls INTEGER DEFAULT 0,
  meetings_scheduled INTEGER DEFAULT 0,
  meetings_completed INTEGER DEFAULT 0,
  contracts_generated INTEGER DEFAULT 0,
  noshow INTEGER DEFAULT 0,
  closing INTEGER DEFAULT 0,
  lead_time DECIMAL(10, 2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_performance_data_date ON performance_data(date);
CREATE INDEX IF NOT EXISTS idx_performance_data_user_id ON performance_data(user_id);
CREATE INDEX IF NOT EXISTS idx_performance_data_user_date ON performance_data(user_id, date);

-- Tabela para métricas agregadas diárias
CREATE TABLE IF NOT EXISTS aggregated_metrics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL UNIQUE,
  total_calls INTEGER DEFAULT 0,
  total_meetings_scheduled INTEGER DEFAULT 0,
  total_meetings_completed INTEGER DEFAULT 0,
  total_contracts INTEGER DEFAULT 0,
  total_noshow INTEGER DEFAULT 0,
  total_closing INTEGER DEFAULT 0,
  avg_lead_time DECIMAL(10, 2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_aggregated_metrics_date ON aggregated_metrics(date);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para atualizar updated_at
CREATE TRIGGER update_performance_data_updated_at
  BEFORE UPDATE ON performance_data
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_aggregated_metrics_updated_at
  BEFORE UPDATE ON aggregated_metrics
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- RLS (Row Level Security) - desabilitado por padrão, pode ser habilitado se necessário
ALTER TABLE performance_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE aggregated_metrics ENABLE ROW LEVEL SECURITY;

-- Política para permitir todas as operações (ajuste conforme necessário)
CREATE POLICY "Allow all operations on performance_data"
  ON performance_data
  FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all operations on aggregated_metrics"
  ON aggregated_metrics
  FOR ALL
  USING (true)
  WITH CHECK (true);

