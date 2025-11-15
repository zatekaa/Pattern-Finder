/**
 * 🔐 Vercel Serverless Function для загрузки данных
 */

const DataLoader = require('../backend/data-loader');

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

  try {
    const { symbol, fromDate, toDate, interval = '1d' } = req.query;

    if (!symbol || !fromDate || !toDate) {
      return res.status(400).json({
        error: 'Missing required parameters: symbol, fromDate, toDate'
      });
    }

    console.log(`📊 /api/data запрос: ${symbol}, ${fromDate} - ${toDate}, ${interval}`);

    // Создаем DataLoader
    const dataLoader = new DataLoader();
    const data = await dataLoader.loadData(symbol, fromDate, toDate, interval);

    res.status(200).json(data);
  } catch (error) {
    console.error(`❌ Ошибка /api/data: ${error.message}`);
    res.status(500).json({
      error: error.message
    });
  }
};
