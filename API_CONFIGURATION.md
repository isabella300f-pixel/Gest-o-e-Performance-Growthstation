# ⚙️ Configuração da API do Growthstation

## Problema Atual

A API do Growthstation está retornando 404, indicando que o endpoint não existe ou a URL está incorreta.

## Informações Necessárias

Para corrigir o problema, preciso das seguintes informações:

### 1. URL Base da API
- Qual é a URL base correta da API?
- Exemplo: `https://growthstation.app/api/v1` ou `https://api.growthstation.app/v1`

### 2. Endpoint de Performance
- Qual é o endpoint correto para buscar dados de performance?
- Exemplo: `/performance`, `/api/performance`, `/v1/dashboard/performance`

### 3. Método de Autenticação
- Como fazer a autenticação?
  - Query parameter: `?apiKey=...`
  - Header: `Authorization: Bearer ...` ou `X-API-Key: ...`
  - Outro método?

### 4. Formato da Resposta
- Qual é o formato da resposta da API?
- Exemplo de resposta JSON esperada

## Como Obter Essas Informações

1. **Documentação da API**: Verifique a documentação do Growthstation
2. **Network Tab**: Abra o DevTools → Network → Faça uma requisição no painel do Growthstation e veja a URL/headers
3. **Suporte**: Entre em contato com o suporte do Growthstation

## Solução Temporária

A aplicação agora:
- ✅ Não quebra quando a API não responde
- ✅ Usa dados do Supabase como fallback
- ✅ Mostra mensagens de erro claras
- ✅ Continua funcionando com dados já salvos

## Próximos Passos

1. Obter as informações corretas da API
2. Atualizar o código com a URL/endpoint correto
3. Testar a integração
4. Deploy da correção

## Teste Manual

Você pode testar a API diretamente:

```bash
# Teste 1: URL atual
curl "https://growthstation.app/api/v1/performance?apiKey=8bc7f25d967d79bd55d8e0acabdb8e2bd9391120"

# Teste 2: Verificar se a URL base está correta
curl "https://growthstation.app/api/v1/"

# Teste 3: Verificar outros endpoints possíveis
curl "https://growthstation.app/api/performance?apiKey=..."
```

Me envie os resultados desses testes ou as informações da documentação da API!

