/**
 * 🔐 Vercel Serverless Function для авторизации
 */

module.exports = async (req, res) => {
  // Разрешаем CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  // Handle OPTIONS request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Только POST запросы
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { username, password } = req.body;

    // Получаем логин и пароль из environment variables
    const validUsername = process.env.APP_USERNAME || 'trader';
    const validPassword = process.env.APP_PASSWORD || 'Murod777';

    console.log(`🔐 Попытка входа: ${username}`);

    if (username === validUsername && password === validPassword) {
      console.log('✅ Авторизация успешна');
      return res.status(200).json({
        success: true,
        message: 'Авторизация успешна',
        token: Buffer.from(`${username}:${Date.now()}`).toString('base64')
      });
    } else {
      console.log('❌ Неверный логин или пароль');
      return res.status(401).json({
        success: false,
        message: 'Неверное имя пользователя или пароль'
      });
    }
  } catch (error) {
    console.error('❌ Ошибка авторизации:', error);
    return res.status(500).json({
      success: false,
      message: 'Ошибка сервера'
    });
  }
};
