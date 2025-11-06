// Vercel Serverless Function для Finnhub API
export default async function handler(req, res) {
  // Устанавливаем заголовки для CORS и JSON
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { endpoint, params } = req.body || {};
    
    if (!endpoint) {
      return res.status(400).json({ error: 'Endpoint is required' });
    }

    const API_KEY = process.env.FINNHUB_API_KEY;
    
    if (!API_KEY) {
      console.error('FINNHUB_API_KEY not configured');
      return res.status(500).json({ error: 'Finnhub API key not configured' });
    }

    const baseUrl = 'https://finnhub.io/api/v1';
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const url = new URL(cleanEndpoint, baseUrl);
    
    url.searchParams.append('token', API_KEY);
    
    if (params) {
      Object.keys(params).forEach(key => {
        url.searchParams.append(key, params[key]);
      });
    }

    const response = await fetch(url.toString());
    
    // Проверяем тип контента ответа
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      console.error('Finnhub returned non-JSON:', text.substring(0, 200));
      return res.status(500).json({ 
        error: 'Finnhub returned invalid response',
        details: text.substring(0, 200)
      });
    }
    
    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ 
        error: data.error || 'Finnhub API error',
        details: data
      });
    }

    return res.status(200).json(data);
    
  } catch (error) {
    console.error('Finnhub function error:', error);
    return res.status(500).json({ 
      error: error.message || 'Internal server error',
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}
