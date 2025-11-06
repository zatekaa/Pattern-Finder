// Vercel Serverless Function для Yahoo Finance API
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { endpoint, params } = req.body || {};
    
    if (!endpoint) {
      return res.status(400).json({ error: 'Endpoint is required' });
    }

    const baseUrl = 'https://query1.finance.yahoo.com';
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const url = new URL(cleanEndpoint, baseUrl);
    
    if (params) {
      Object.keys(params).forEach(key => {
        url.searchParams.append(key, params[key]);
      });
    }

    const response = await fetch(url.toString());
    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ 
        error: data.error || 'Yahoo Finance API error',
        details: data
      });
    }

    return res.status(200).json(data);
    
  } catch (error) {
    console.error('Yahoo function error:', error);
    return res.status(500).json({ error: error.message });
  }
}
