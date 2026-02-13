import { NextRequest, NextResponse } from 'next/server'
import axios from 'axios'

const API_URL = process.env.GROWTHSTATION_API_URL || 'https://growthstation.app/api/v1'
const API_KEY = process.env.GROWTHSTATION_API_KEY || '8bc7f25d967d79bd55d8e0acabdb8e2bd9391120'

// API Route para proxy da API do Growthstation (resolve CORS)
export async function GET(request: NextRequest) {
  try {
    console.log('Growthstation API Proxy: GET /api/growthstation/performance')
    
    const searchParams = request.nextUrl.searchParams
    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')

    const params: Record<string, any> = {
      apiKey: API_KEY,
    }

    if (dateFrom) params.dateFrom = dateFrom
    if (dateTo) params.dateTo = dateTo

    console.log('Calling Growthstation API:', `${API_URL}/performance`, params)

    const response = await axios.get(`${API_URL}/performance`, {
      params,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 30000, // 30 segundos
    })

    console.log('Growthstation API Response:', response.status)

    return NextResponse.json(response.data, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    })
  } catch (error: any) {
    console.error('Growthstation API Proxy Error:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      url: error.config?.url,
    })
    
    return NextResponse.json(
      {
        error: 'Erro ao buscar dados da API',
        message: error.response?.data?.message || error.message,
        details: error.response?.data,
        status: error.response?.status,
      },
      {
        status: error.response?.status || 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      }
    )
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}

