// Vercel Serverless Function для Alpha Vantage API
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

    const API_KEY = process.env.ALPHA_VANTAGE_API_KEY;
    
    if (!API_KEY) {
      return res.status(500).json({ error: 'Alpha Vantage API key not configured' });
    }

    const baseUrl = 'https://www.alphavantage.co/query';
    const url = new URL(baseUrl);
    
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
        error: data.error || 'Alpha Vantage API error',
        details: data
      });
    }

    // Check for API error messages
    if (data['Error Message'] || data['Note']) {
      return res.status(400).json({ 
        error: data['Error Message'] || data['Note']
      });
    }

    return res.status(200).json(data);
    
  } catch (error) {
    console.error('Alpha Vantage function error:', error);
    return res.status(500).json({ error: error.message });
  }
}
