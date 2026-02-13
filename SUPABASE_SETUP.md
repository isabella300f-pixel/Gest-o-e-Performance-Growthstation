# 🔐 Configuração do Supabase - Variáveis de Ambiente

## ✅ Pode usar as mesmas credenciais?

**SIM!** Você pode usar as mesmas variáveis do Supabase (`NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY`) em múltiplos projetos.

## 📊 Como funciona?

### Cenário 1: Mesmo Projeto Supabase, Tabelas Diferentes
Se você usar as mesmas credenciais e criar tabelas com **nomes diferentes**, não há conflito:
- ✅ Projeto A usa: `users`, `products`
- ✅ Projeto B usa: `performance_data`, `aggregated_metrics`
- ✅ **Sem conflito!** Cada projeto acessa apenas suas próprias tabelas

### Cenário 2: Mesmo Projeto Supabase, Mesmas Tabelas
Se os nomes das tabelas forem **iguais**, os dados serão **compartilhados**:
- ⚠️ Projeto A e B usam: `performance_data`
- ⚠️ Ambos verão os mesmos dados
- ⚠️ Pode ser útil para compartilhar dados entre projetos

## 🎯 Recomendação para este Projeto

Este projeto cria as seguintes tabelas:
- `performance_data` - Dados de performance individual
- `aggregated_metrics` - Métricas agregadas diárias

**Se você já tem essas tabelas em outro projeto:**
- Opção 1: **Compartilhar dados** - Use os mesmos nomes (dados serão compartilhados)
- Opção 2: **Isolar dados** - Renomeie as tabelas com prefixo (ex: `gs_analytics_performance_data`)

## 🔧 Variáveis para o Vercel

Use estas variáveis no Vercel:

```
NEXT_PUBLIC_SUPABASE_URL=https://iqmdzdeqdtniiwxrrxyh.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlxbWR6ZGVxZHRuaWl3eHJyeHloIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAwNTMzNTIsImV4cCI6MjA4NTYyOTM1Mn0.LQliMSCNHCYfiLBL4ggVZS5JbkrtaRuV3uwo72Z9Tmg
GROWTHSTATION_API_KEY=8bc7f25d967d79bd55d8e0acabdb8e2bd9391120
GROWTHSTATION_API_URL=https://growthstation.app/api/v1
```

## 📝 Nota sobre Service Role Key

A `SUPABASE_SERVICE_ROLE_KEY` que você mencionou é para operações administrativas (bypassa RLS). Para este projeto, usamos apenas a `ANON_KEY`, que é mais segura para aplicações client-side.

## 🚀 Próximos Passos

1. Execute o schema SQL no Supabase (se ainda não executou)
2. Configure as variáveis no Vercel
3. Deploy!

Se quiser isolar completamente os dados, posso ajustar o schema para usar prefixos nas tabelas.

