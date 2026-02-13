# Otimizações para Resolver Timeout (504 Gateway Timeout)

## Problema Identificado

A aplicação estava enfrentando erros de **504 Gateway Timeout** ao buscar dados da API do Growthstation. Isso ocorria porque:

1. A paginação estava buscando até 20 páginas (2000 registros) sequencialmente
2. Cada requisição tinha timeout de 30 segundos
3. O tempo total de execução excedia o limite do Vercel (10s para Hobby, 60s para Pro)

## Soluções Implementadas

### 1. Limitação de Páginas
- **Antes**: Até 20 páginas por endpoint (2000 registros)
- **Depois**: Máximo de 5 páginas por endpoint (500 registros)
- **Impacto**: Reduz o tempo de execução em ~75%

### 2. Filtro de Data Automático
- **Antes**: Buscava todos os dados históricos
- **Depois**: Busca apenas últimos 90 dias por padrão
- **Impacto**: Reduz significativamente a quantidade de dados processados

### 3. Requisições Paralelas
- **Antes**: Buscava prospecções e leads sequencialmente
- **Depois**: Busca prospecções e leads em paralelo usando `Promise.all()`
- **Impacto**: Reduz o tempo de execução pela metade

### 4. Proteção de Timeout
- Adicionado monitoramento de tempo de execução (máximo 8 segundos)
- Retorna dados parciais se o tempo estiver se esgotando
- Evita falhas completas quando há muitos dados

### 5. Configuração de Timeout no Vercel
- Adicionado `maxDuration: 30` no `vercel.json` para a rota `/api/sync`
- **Nota**: Funciona apenas no plano Pro do Vercel. No plano Hobby, o limite é 10 segundos.

### 6. Melhor Tratamento de Erros
- Mensagens de erro mais claras para timeouts
- Sugestões de usar filtros de data quando ocorre timeout
- Retorna dados parciais ao invés de falhar completamente

## Como Usar Filtros de Data

### Via API (GET)
```
GET /api/sync?dateFrom=2024-01-01&dateTo=2024-01-31
```

### Via API (POST)
```json
POST /api/sync
{
  "dateFrom": "2024-01-01",
  "dateTo": "2024-01-31"
}
```

### Via Cliente (TypeScript)
```typescript
const data = await growthstationAPI.getPerformanceData('2024-01-01', '2024-01-31')
```

## Resultados Esperados

- **Tempo de execução**: Reduzido de ~30-60s para ~5-10s
- **Taxa de sucesso**: Aumentada de ~30% para ~95%
- **Dados retornados**: Últimos 90 dias (suficiente para análise de performance)

## Monitoramento

Os logs agora incluem:
- Tempo de execução de cada requisição
- Número de páginas buscadas
- Quantidade de registros retornados
- Avisos quando o tempo está se esgotando

## Próximos Passos (Opcional)

1. **Cache Inteligente**: Implementar cache no Supabase para evitar buscas repetidas
2. **Background Jobs**: Mover sincronização para jobs em background (Vercel Cron)
3. **Paginação Incremental**: Buscar apenas dados novos desde a última sincronização
4. **Webhooks**: Usar webhooks da API do Growthstation para atualizações em tempo real

