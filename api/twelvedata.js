// Vercel Serverless Function для Twelve Data API
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

    const API_KEY = process.env.TWELVE_DATA_API_KEY;
    
    if (!API_KEY) {
      return res.status(500).json({ error: 'TwelveData API key not configured' });
    }

    const baseUrl = 'https://api.twelvedata.com';
    const url = new URL(endpoint, baseUrl);
    
    url.searchParams.append('apikey', API_KEY);
    
    if (params) {
      Object.keys(params).forEach(key => {
        url.searchParams.append(key, params[key]);
      });
    }

    const response = await fetch(url.toString());
    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ 
        error: data.message || 'TwelveData API error',
        details: data
      });
    }

    return res.status(200).json(data);
    
  } catch (error) {
    console.error('TwelveData function error:', error);
    return res.status(500).json({ error: error.message });
  }
}
