const fetch = require('node-fetch');

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const { params } = JSON.parse(event.body || '{}');
    
    if (!params) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Parameters are required' })
      };
    }

    const API_KEY = process.env.ALPHA_VANTAGE_API_KEY;
    
    if (!API_KEY) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'AlphaVantage API key not configured' })
      };
    }

    const url = new URL('https://www.alphavantage.co/query');
    
    // Добавляем API ключ в параметры
    url.searchParams.append('apikey', API_KEY);
    
    Object.keys(params).forEach(key => {
      url.searchParams.append(key, params[key]);
    });

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        statusCode: response.status,
        headers,
        body: JSON.stringify({ error: data['Error Message'] || 'AlphaVantage API error' })
      };
    }

    // Проверка на ошибки в ответе API
    if (data['Error Message']) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: data['Error Message'] })
      };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(data)
    };

  } catch (error) {
    console.error('AlphaVantage function error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message })
    };
  }
};
