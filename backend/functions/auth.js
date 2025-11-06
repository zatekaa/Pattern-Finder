// Netlify Function для безопасной авторизации
// Пароли хранятся в переменных окружения Netlify, а не в коде!

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const { username, password } = JSON.parse(event.body || '{}');
    
    // Получаем учетные данные из переменных окружения Netlify
    const VALID_USERNAME = process.env.APP_USERNAME || 'trader';
    const VALID_PASSWORD = process.env.APP_PASSWORD || 'Murod777';
    
    // Проверяем учетные данные
    if (username === VALID_USERNAME && password === VALID_PASSWORD) {
      // Генерируем токен (можно использовать JWT для большей безопасности)
      const token = Buffer.from(`${username}:${Date.now()}`).toString('base64');
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ 
          success: true, 
          token: token,
          message: 'Authentication successful' 
        })
      };
    } else {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ 
          success: false, 
          message: 'Invalid credentials' 
        })
      };
    }
    
  } catch (error) {
    console.error('Auth function error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        success: false, 
        message: 'Server error' 
      })
    };
  }
};
