// Vercel Serverless Function для Tiingo API
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

    const API_KEY = process.env.TIINGO_API_KEY || '8a05dc6d0382ba92b57e33a041c98263b78e740a';
    
    const baseUrl = 'https://api.tiingo.com';
    const url = new URL(endpoint, baseUrl);
    
    url.searchParams.append('token', API_KEY);
    
    if (params) {
      Object.keys(params).forEach(key => {
        url.searchParams.append(key, params[key]);
      });
    }

    const response = await fetch(url.toString());
    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ 
        error: data.error || 'Tiingo API error',
        details: data
      });
    }

    return res.status(200).json(data);
    
  } catch (error) {
    console.error('Tiingo function error:', error);
    return res.status(500).json({ error: error.message });
  }
}
