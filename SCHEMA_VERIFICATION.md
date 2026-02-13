# Verificação do Schema do Supabase

## ✅ Comparação: Schema vs Dados Salvos

### Tabela `performance_data`

| Campo no Schema | Tipo | Campo no Código | Status |
|----------------|------|----------------|--------|
| `user_id` | TEXT NOT NULL | `user_id` | ✅ Alinhado |
| `user_name` | TEXT | `user_name` | ✅ Alinhado |
| `date` | DATE NOT NULL | `date` | ✅ Alinhado |
| `daily_activities` | INTEGER | `daily_activities` | ✅ Alinhado |
| `on_time` | DECIMAL(5,2) | `on_time` | ✅ Alinhado |
| `leads_started` | INTEGER | `leads_started` | ✅ Alinhado |
| `leads_finished` | INTEGER | `leads_finished` | ✅ Alinhado |
| `conversion_rate` | DECIMAL(5,2) | `conversion_rate` | ✅ Alinhado |
| `earnings` | INTEGER | `earnings` | ✅ Alinhado |
| `calls` | INTEGER | `calls` | ✅ Alinhado |
| `meetings_scheduled` | INTEGER | `meetings_scheduled` | ✅ Alinhado |
| `meetings_completed` | INTEGER | `meetings_completed` | ✅ Alinhado |
| `contracts_generated` | INTEGER | `contracts_generated` | ✅ Alinhado |
| `noshow` | INTEGER | `noshow` | ✅ Alinhado |
| `closing` | INTEGER | `closing` | ✅ Alinhado |
| `lead_time` | DECIMAL(10,2) | `lead_time` | ✅ Alinhado |
| `created_at` | TIMESTAMP | Auto | ✅ Alinhado |
| `updated_at` | TIMESTAMP | Auto | ✅ Alinhado |

## 📊 Estrutura da API vs Schema

### Dados da API (GS Engage)
A API retorna dados brutos:
- **Prospecções**: `id`, `lead`, `responsible`, `routine`, `status`, `lostReason`, `startDate`, `endDate`, `meeting`, etc.
- **Leads**: `id`, `firstName`, `lastName`, `emails`, `phones`, `companyName`, etc.

### Processamento
O código processa os dados brutos da API e calcula métricas agregadas:
- Agrupa por `responsible` (usuário responsável)
- Calcula métricas: calls, meetings, contracts, noshow, closing, lead time
- Agrega por dia

### Schema do Supabase
O schema armazena as **métricas processadas**, não os dados brutos da API. Isso está **correto** porque:
1. ✅ Economiza espaço (não precisa salvar todos os detalhes de cada prospecção)
2. ✅ Facilita consultas e relatórios
3. ✅ Mantém histórico de performance diária
4. ✅ Permite análise temporal

## 🔍 Verificações Adicionais

### Tipos de Dados
- ✅ `INTEGER` para contadores (calls, meetings, etc.)
- ✅ `DECIMAL(5,2)` para percentuais (conversion_rate, on_time)
- ✅ `DECIMAL(10,2)` para lead_time (pode ser grande em horas)
- ✅ `TEXT` para user_id e user_name (flexível)
- ✅ `DATE` para data (formato ISO)

### Constraints
- ✅ `UNIQUE(user_id, date)` - evita duplicatas
- ✅ `NOT NULL` nos campos obrigatórios
- ✅ `DEFAULT 0` para valores numéricos

### Índices
- ✅ `idx_performance_data_date` - consultas por data
- ✅ `idx_performance_data_user_id` - consultas por usuário
- ✅ `idx_performance_data_user_date` - consultas combinadas

## ✅ Conclusão

**O schema está 100% alinhado com os dados que o código salva!**

Não há necessidade de alterações. O schema foi projetado corretamente para armazenar métricas agregadas de performance, que é exatamente o que o código calcula e salva.

## 📝 Nota Importante

O schema não armazena os dados brutos da API (prospecções, leads individuais), mas sim as **métricas calculadas**. Se no futuro você precisar armazenar dados brutos, seria necessário criar tabelas adicionais como:
- `prospections_raw` - para armazenar prospecções completas
- `leads_raw` - para armazenar leads completos
- `activities_raw` - para armazenar atividades individuais

Mas para o dashboard de performance atual, o schema está perfeito! ✅

