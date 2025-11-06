// Vercel Serverless Function для безопасной авторизации
// Пароли хранятся в переменных окружения Vercel, а не в коде!

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');

  // Handle OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      message: 'Method not allowed' 
    });
  }

  try {
    const { username, password } = req.body;
    
    // Получаем учетные данные из переменных окружения Vercel
    const VALID_USERNAME = process.env.APP_USERNAME || 'trader';
    const VALID_PASSWORD = process.env.APP_PASSWORD || 'Murod777';
    
    // Проверяем учетные данные
    if (username === VALID_USERNAME && password === VALID_PASSWORD) {
      // Генерируем токен
      const token = Buffer.from(`${username}:${Date.now()}`).toString('base64');
      
      return res.status(200).json({ 
        success: true, 
        token: token,
        message: 'Authentication successful' 
      });
    } else {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }
    
  } catch (error) {
    console.error('Auth function error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
}
