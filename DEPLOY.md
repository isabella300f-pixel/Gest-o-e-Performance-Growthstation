# Guia de Deploy - Vercel

## Deploy Automático via GitHub

### 1. Preparar o Repositório

```bash
# Inicializar Git (se ainda não foi feito)
git init

# Adicionar todos os arquivos
git add .

# Fazer commit inicial
git commit -m "Initial commit: Growthstation Analytics Dashboard"

# Adicionar remote do GitHub
git remote add origin https://github.com/seu-usuario/growthstation-analytics.git

# Fazer push
git push -u origin main
```

### 2. Conectar no Vercel

1. Acesse [https://vercel.com](https://vercel.com)
2. Faça login com sua conta GitHub
3. Clique em **Add New Project**
4. Selecione o repositório `growthstation-analytics`
5. Clique em **Import**

### 3. Configurar Variáveis de Ambiente

No Vercel, configure as seguintes variáveis:

| Variável | Valor | Onde encontrar |
|----------|-------|----------------|
| `NEXT_PUBLIC_SUPABASE_URL` | URL do projeto Supabase | Supabase Dashboard > Settings > API > Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Chave anônima do Supabase | Supabase Dashboard > Settings > API > anon/public key |
| `GROWTHSTATION_API_KEY` | `8bc7f25d967d79bd55d8e0acabdb8e2bd9391120` | Já fornecido |
| `GROWTHSTATION_API_URL` | `https://growthstation.app/api/v1` | Opcional (já tem padrão) |

**Como adicionar:**
1. Na página do projeto no Vercel, vá em **Settings**
2. Clique em **Environment Variables**
3. Adicione cada variável uma por uma
4. Selecione os ambientes (Production, Preview, Development)
5. Clique em **Save**

### 4. Deploy

1. Clique em **Deploy**
2. Aguarde o build completar (geralmente 2-3 minutos)
3. Após o sucesso, você receberá uma URL (ex: `growthstation-analytics.vercel.app`)

### 5. Verificar Deploy

1. Acesse a URL fornecida pelo Vercel
2. Verifique se a aplicação carrega corretamente
3. Teste a sincronização de dados
4. Verifique se os gráficos estão renderizando

## Deploy Manual (via CLI)

### 1. Instalar Vercel CLI

```bash
npm i -g vercel
```

### 2. Fazer Login

```bash
vercel login
```

### 3. Deploy

```bash
# Deploy para preview
vercel

# Deploy para produção
vercel --prod
```

### 4. Configurar Variáveis via CLI

```bash
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add GROWTHSTATION_API_KEY
vercel env add GROWTHSTATION_API_URL
```

## Configurações Avançadas

### Domínio Customizado

1. No Vercel, vá em **Settings** > **Domains**
2. Adicione seu domínio customizado
3. Configure os DNS conforme instruções

### Variáveis de Ambiente por Ambiente

Você pode ter valores diferentes para Production, Preview e Development:

1. Vá em **Settings** > **Environment Variables**
2. Ao adicionar uma variável, selecione os ambientes desejados
3. Cada ambiente pode ter seu próprio valor

### Webhooks e Sincronização Automática

Para sincronizar dados automaticamente, você pode configurar:

1. **Cron Job no Vercel** (usando Vercel Cron):
   - Crie um arquivo `vercel.json` com configuração de cron
   - Configure para chamar `/api/sync` periodicamente

2. **Webhook externo**:
   - Configure um serviço como Zapier ou Make.com
   - Configure para chamar `https://sua-app.vercel.app/api/sync` periodicamente

## Monitoramento

### Logs

1. No Vercel, vá em **Deployments**
2. Clique em um deployment
3. Clique em **Functions** para ver logs das API routes
4. Use **Runtime Logs** para ver logs em tempo real

### Analytics

1. Vá em **Analytics** no dashboard do Vercel
2. Veja métricas de performance
3. Monitore erros e exceções

## Rollback

Se algo der errado:

1. Vá em **Deployments**
2. Encontre o deployment anterior que funcionava
3. Clique nos três pontos (...)
4. Selecione **Promote to Production**

## Troubleshooting de Deploy

### Build falha

- Verifique os logs de build no Vercel
- Verifique se todas as dependências estão no `package.json`
- Verifique se não há erros de TypeScript

### Variáveis de ambiente não funcionam

- Certifique-se de que as variáveis começam com `NEXT_PUBLIC_` se forem usadas no cliente
- Verifique se as variáveis foram adicionadas para o ambiente correto
- Faça um novo deploy após adicionar variáveis

### Erro 500 no deploy

- Verifique os logs de runtime
- Verifique se o Supabase está acessível
- Verifique se a API do Growthstation está respondendo

