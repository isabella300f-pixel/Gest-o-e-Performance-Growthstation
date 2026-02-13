/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    GROWTHSTATION_API_KEY: process.env.GROWTHSTATION_API_KEY,
    GROWTHSTATION_API_URL: process.env.GROWTHSTATION_API_URL || 'https://growthstation.app/api/v1',
  },
}

module.exports = nextConfig

