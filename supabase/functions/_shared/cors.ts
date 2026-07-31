const siteUrl = Deno.env.get('SITE_URL');
const allowedOrigins = [
  siteUrl,
  'http://localhost:5173',
  'http://localhost:4173',
  'http://localhost:3000',
].filter(Boolean) as string[];

export const corsHeaders = {
  'Access-Control-Allow-Origin': allowedOrigins[0] || 'http://localhost:5173',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
};