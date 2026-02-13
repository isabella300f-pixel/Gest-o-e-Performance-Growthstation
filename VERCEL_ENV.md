# 🔧 Variáveis de Ambiente para Vercel

## Variáveis Obrigatórias

Configure estas variáveis no Vercel (Settings > Environment Variables):

### 1. NEXT_PUBLIC_SUPABASE_URL
```
https://iqmdzdeqdtniiwxrrxyh.supabase.co
```

### 2. NEXT_PUBLIC_SUPABASE_ANON_KEY
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlxbWR6ZGVxZHRuaWl3eHJyeHloIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAwNTMzNTIsImV4cCI6MjA4NTYyOTM1Mn0.LQliMSCNHCYfiLBL4ggVZS5JbkrtaRuV3uwo72Z9Tmg
```

### 3. GROWTHSTATION_API_KEY
```
8bc7f25d967d79bd55d8e0acabdb8e2bd9391120
```

### 4. GROWTHSTATION_API_URL (Opcional)
```
https://growthstation.app/api/v1
```
*Esta já é o valor padrão, mas você pode definir explicitamente*

## 📋 Como Adicionar no Vercel

1. Acesse seu projeto no Vercel
2. Vá em **Settings** > **Environment Variables**
3. Clique em **Add New**
4. Adicione cada variável:
   - **Key**: Nome da variável (ex: `NEXT_PUBLIC_SUPABASE_URL`)
   - **Value**: Valor da variável
   - **Environments**: Selecione:
     - ✅ Production
     - ✅ Preview
     - ✅ Development
5. Clique em **Save**
6. Repita para cada variável
7. **Importante**: Após adicionar, faça um novo deploy!

## ✅ Verificação

Após o deploy, verifique:
- A aplicação carrega sem erros
- Os dados aparecem no dashboard
- A sincronização funciona

## 🔒 Segurança

- ✅ As variáveis `NEXT_PUBLIC_*` são expostas no cliente (isso é necessário para o Supabase funcionar)
- ✅ A `ANON_KEY` tem permissões limitadas (definidas pelas políticas RLS)
- ✅ A `GROWTHSTATION_API_KEY` deve ser mantida segura (não commitar no Git)

## 📝 Nota sobre Tabelas

Se você já usa essas credenciais em outro projeto:
- ✅ **Pode usar as mesmas credenciais** - As tabelas são isoladas por nome
- ✅ Este projeto usa: `performance_data` e `aggregated_metrics`
- ✅ Se seu outro projeto usa nomes diferentes, não há conflito
- ⚠️ Se usar os mesmos nomes, os dados serão compartilhados

