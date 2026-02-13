# Growthstation Analytics Dashboard

Aplicação completa de análise de dados e KPIs para o Growthstation, com dashboard interativo, gráficos e métricas estratégicas.

## 🚀 Funcionalidades

- **Dashboard Completo**: Visualização de todos os KPIs de performance
- **Métricas em Tempo Real**: Sincronização automática com a API do Growthstation
- **Gráficos Interativos**: Visualizações com Recharts
- **Análise Individual**: Performance detalhada por SDR
- **Armazenamento Persistente**: Dados salvos no Supabase
- **Deploy Pronto**: Configurado para Vercel

## 📊 KPIs Monitorados

- **Ligações**: Número total de ligações realizadas
- **Reuniões Agendadas**: Quantidade de reuniões marcadas
- **Reuniões Realizadas**: Reuniões que foram efetivamente realizadas
- **Contratos Gerados**: Número de contratos criados
- **No-Show**: Taxa de faltas em reuniões
- **Fechamentos**: Número de fechamentos realizados
- **Lead Time**: Tempo médio entre contatos com o lead
- **Taxa de Conversão**: Percentual de conversão de leads

## 🛠️ Tecnologias

- **Next.js 14**: Framework React com App Router
- **TypeScript**: Tipagem estática
- **Tailwind CSS**: Estilização moderna
- **Recharts**: Gráficos e visualizações
- **Supabase**: Banco de dados e armazenamento
- **Axios**: Cliente HTTP para API

## 📦 Instalação

1. Clone o repositório:
```bash
git clone <seu-repositorio>
cd growthstation-analytics
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente. Crie um arquivo `.env.local`:
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://iqmdzdeqdtniiwxrrxyh.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlxbWR6ZGVxZHRuaWl3eHJyeHloIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAwNTMzNTIsImV4cCI6MjA4NTYyOTM1Mn0.LQliMSCNHCYfiLBL4ggVZS5JbkrtaRuV3uwo72Z9Tmg

# Growthstation API
GROWTHSTATION_API_KEY=8bc7f25d967d79bd55d8e0acabdb8e2bd9391120
GROWTHSTATION_API_URL=https://growthstation.app/api/v1
```

**Nota**: Você pode usar as mesmas credenciais do Supabase em múltiplos projetos. As tabelas são isoladas por nome, então não há conflito se os nomes forem diferentes. Veja [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) para mais detalhes.

4. Configure o Supabase:
   - Crie uma conta no [Supabase](https://supabase.com)
   - Crie um novo projeto
   - Execute o script SQL em `supabase/schema.sql` no SQL Editor do Supabase

5. Execute o projeto em desenvolvimento:
```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000)

## 🗄️ Configuração do Supabase

1. Acesse o [Supabase Dashboard](https://app.supabase.com)
2. Crie um novo projeto
3. Vá em **SQL Editor**
4. Cole o conteúdo do arquivo `supabase/schema.sql`
5. Execute o script
6. Copie a URL do projeto e a chave anônima (anon key) para o `.env.local`

## 🚀 Deploy no Vercel

1. Faça push do código para o GitHub:
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <seu-repositorio-github>
git push -u origin main
```

2. Acesse o [Vercel](https://vercel.com) e faça login com GitHub

3. Clique em **Add New Project**

4. Importe seu repositório

5. Configure as variáveis de ambiente:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `GROWTHSTATION_API_KEY`
   - `GROWTHSTATION_API_URL` (opcional)

6. Clique em **Deploy**

## 📝 Estrutura do Projeto

```
growthstation-analytics/
├── app/
│   ├── api/
│   │   └── sync/
│   │       └── route.ts      # Endpoint para sincronização
│   ├── layout.tsx            # Layout principal
│   ├── page.tsx              # Página inicial
│   └── globals.css           # Estilos globais
├── components/
│   ├── Dashboard.tsx         # Componente principal do dashboard
│   ├── KPICards.tsx          # Cards de KPIs
│   ├── PerformanceChart.tsx  # Gráfico de performance
│   ├── IndividualPerformance.tsx # Tabela de performance individual
│   ├── LeadTimeAnalysis.tsx  # Análise de lead time
│   └── ConversionFunnel.tsx  # Funil de conversão
├── lib/
│   ├── supabase.ts           # Cliente Supabase
│   ├── growthstation-api.ts  # Cliente API Growthstation
│   └── data-processor.ts     # Processamento de dados
├── supabase/
│   └── schema.sql            # Schema do banco de dados
└── package.json
```

## 🔄 Sincronização de Dados

A aplicação sincroniza dados automaticamente:
- Ao carregar a página (se não houver dados recentes)
- A cada 5 minutos automaticamente
- Manualmente através do botão "Sincronizar Agora"

Você também pode chamar o endpoint `/api/sync` via POST para sincronizar programaticamente.

## 📈 Gráficos e Visualizações

- **Evolução de Performance**: Gráfico de linha mostrando ligações, reuniões e contratos ao longo do tempo
- **Funil de Conversão**: Visualização do funil de vendas
- **Análise de Lead Time**: Gráfico de barras com lead time por SDR
- **Performance Individual**: Tabela detalhada com métricas por pessoa

## 🔐 Segurança

- A API key do Growthstation está configurada como variável de ambiente
- O Supabase usa Row Level Security (RLS) - ajuste as políticas conforme necessário
- Nunca commite arquivos `.env` ou `.env.local`

## 📞 Suporte

Para dúvidas ou problemas:
1. Verifique se todas as variáveis de ambiente estão configuradas
2. Confirme que o schema do Supabase foi executado corretamente
3. Verifique os logs do console do navegador e do servidor

## 📄 Licença

Este projeto é privado e de uso interno.

