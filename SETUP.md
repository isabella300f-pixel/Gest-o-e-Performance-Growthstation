# Guia de Configuração - Growthstation Analytics

## Passo a Passo Completo

### 1. Configuração do Supabase

1. **Criar conta no Supabase**
   - Acesse [https://supabase.com](https://supabase.com)
   - Crie uma conta gratuita
   - Crie um novo projeto

2. **Configurar o banco de dados**
   - No dashboard do Supabase, vá em **SQL Editor**
   - Clique em **New Query**
   - Cole o conteúdo completo do arquivo `supabase/schema.sql`
   - Clique em **Run** para executar

3. **Obter credenciais**
   - Vá em **Settings** > **API**
   - Copie a **URL** do projeto (Project URL)
   - Copie a **anon/public key** (anon key)

### 2. Configuração Local

1. **Instalar dependências**
```bash
npm install
```

2. **Criar arquivo de variáveis de ambiente**
   - Crie um arquivo `.env.local` na raiz do projeto
   - Adicione as seguintes variáveis:

```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon-aqui
GROWTHSTATION_API_KEY=8bc7f25d967d79bd55d8e0acabdb8e2bd9391120
GROWTHSTATION_API_URL=https://growthstation.app/api/v1
```

3. **Executar em desenvolvimento**
```bash
npm run dev
```

### 3. Deploy no Vercel

1. **Preparar repositório Git**
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <seu-repositorio>
git push -u origin main
```

2. **Configurar no Vercel**
   - Acesse [https://vercel.com](https://vercel.com)
   - Faça login com GitHub
   - Clique em **Add New Project**
   - Importe seu repositório
   - Configure as variáveis de ambiente:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - `GROWTHSTATION_API_KEY`
     - `GROWTHSTATION_API_URL` (opcional, já tem valor padrão)
   - Clique em **Deploy**

3. **Verificar deploy**
   - Após o deploy, acesse a URL fornecida pelo Vercel
   - Verifique se os dados estão sendo carregados

### 4. Configuração de Sincronização Automática

A aplicação sincroniza dados automaticamente:
- Ao carregar a página pela primeira vez
- A cada 5 minutos (configurável no código)
- Manualmente através do botão "Sincronizar Agora"

Para sincronização programática, você pode usar:
```bash
curl -X POST https://sua-app.vercel.app/api/sync
```

### 5. Verificação de Funcionamento

1. **Verificar conexão com Supabase**
   - Abra o console do navegador (F12)
   - Verifique se não há erros de conexão

2. **Verificar sincronização**
   - Clique em "Sincronizar Agora"
   - Verifique se os dados aparecem no dashboard

3. **Verificar gráficos**
   - Todos os gráficos devem estar renderizando
   - Os dados devem estar atualizados

## Troubleshooting

### Erro: "Supabase credentials not found"
- Verifique se as variáveis de ambiente estão configuradas corretamente
- No Vercel, verifique se as variáveis foram adicionadas

### Erro: "API Error"
- Verifique se a API key do Growthstation está correta
- Verifique se a URL da API está correta
- Verifique os logs do servidor para mais detalhes

### Dados não aparecem
- Verifique se o schema do Supabase foi executado corretamente
- Verifique se há dados na tabela `performance_data`
- Verifique os filtros de data no dashboard

### Gráficos não renderizam
- Verifique se há dados no período selecionado
- Verifique o console do navegador para erros
- Verifique se o Recharts está instalado corretamente

## Próximos Passos

1. **Personalizar KPIs**: Ajuste os KPIs conforme necessário
2. **Adicionar mais gráficos**: Crie novos componentes de visualização
3. **Configurar alertas**: Adicione notificações para métricas importantes
4. **Exportar dados**: Adicione funcionalidade de exportação (CSV, PDF)

