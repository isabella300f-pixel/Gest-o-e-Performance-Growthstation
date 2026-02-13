# 🚀 Quick Start - Growthstation Analytics

## Setup Rápido (5 minutos)

### 1. Instalar Dependências
```bash
npm install
```

### 2. Configurar Supabase
1. Crie conta em [supabase.com](https://supabase.com)
2. Crie um novo projeto
3. No SQL Editor, execute o conteúdo de `supabase/schema.sql`
4. Copie a URL e a anon key do projeto

### 3. Criar `.env.local`
```env
NEXT_PUBLIC_SUPABASE_URL=sua-url-aqui
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-aqui
GROWTHSTATION_API_KEY=8bc7f25d967d79bd55d8e0acabdb8e2bd9391120
```

### 4. Rodar Localmente
```bash
npm run dev
```

Acesse: http://localhost:3000

## Deploy no Vercel (10 minutos)

### 1. Push para GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <seu-repo>
git push -u origin main
```

### 2. Deploy no Vercel
1. Acesse [vercel.com](https://vercel.com)
2. Importe o repositório
3. Adicione as variáveis de ambiente
4. Deploy!

## ✅ Pronto!

Sua aplicação está rodando com:
- ✅ Dashboard completo de KPIs
- ✅ Gráficos interativos
- ✅ Sincronização automática
- ✅ Performance individual
- ✅ Análise de Lead Time
- ✅ Funil de conversão

## 📚 Documentação Completa

- [README.md](./README.md) - Documentação completa
- [SETUP.md](./SETUP.md) - Guia detalhado de setup
- [DEPLOY.md](./DEPLOY.md) - Guia de deploy

