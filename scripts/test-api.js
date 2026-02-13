/**
 * Script de teste para verificar a conexão com a API do Growthstation
 * Execute com: node scripts/test-api.js
 */

const axios = require('axios');

const API_URL = process.env.GROWTHSTATION_API_URL || 'https://growthstation.app/api/v1';
const API_KEY = process.env.GROWTHSTATION_API_KEY || '8bc7f25d967d79bd55d8e0acabdb8e2bd9391120';

async function testAPI() {
  console.log('🧪 Testando conexão com API do Growthstation...\n');
  console.log(`URL: ${API_URL}`);
  console.log(`API Key: ${API_KEY.substring(0, 10)}...\n`);

  try {
    // Teste 1: Performance Data
    console.log('📊 Testando endpoint de Performance...');
    const performanceResponse = await axios.get(`${API_URL}/performance`, {
      params: { apiKey: API_KEY },
      headers: { 'Content-Type': 'application/json' },
    });
    console.log('✅ Performance endpoint funcionando!');
    console.log(`   Dados recebidos: ${JSON.stringify(performanceResponse.data).substring(0, 100)}...\n`);

    // Teste 2: Verificar rate limit headers
    console.log('⏱️  Verificando Rate Limit...');
    const headers = performanceResponse.headers;
    if (headers['x-ratelimit-limit']) {
      console.log(`   Limite: ${headers['x-ratelimit-limit']}`);
      console.log(`   Restantes: ${headers['x-ratelimit-remaining']}`);
      console.log(`   Reset em: ${headers['x-ratelimit-reset']} segundos\n`);
    }

    console.log('✅ Todos os testes passaram!');
  } catch (error) {
    console.error('❌ Erro ao testar API:');
    if (error.response) {
      console.error(`   Status: ${error.response.status}`);
      console.error(`   Mensagem: ${JSON.stringify(error.response.data)}`);
    } else {
      console.error(`   Erro: ${error.message}`);
    }
    process.exit(1);
  }
}

testAPI();

