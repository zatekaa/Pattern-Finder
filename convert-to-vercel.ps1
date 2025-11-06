# Скрипт для конвертации Netlify Functions в Vercel Functions

$functions = @('twelvedata', 'polygon', 'finnhub', 'yahoo', 'alphavantage', 'binance', 'coinmarketcap')

foreach ($func in $functions) {
    $netlifyPath = "backend\functions\$func.js"
    $vercelPath = "api\$func.js"
    
    if (Test-Path $netlifyPath) {
        $content = Get-Content $netlifyPath -Raw
        
        # Конвертируем из Netlify формата в Vercel формат
        $content = $content -replace "const fetch = require\('node-fetch'\);", ""
        $content = $content -replace "exports\.handler = async \(event, context\) =>", "export default async function handler(req, res)"
        $content = $content -replace "event\.httpMethod", "req.method"
        $content = $content -replace "event\.body", "req.body"
        $content = $content -replace "return \{ statusCode: (\d+), headers, body: (.*?) \};", "return res.status(`$1).json(`$2);"
        $content = $content -replace "return \{ statusCode: (\d+), headers, body: '' \};", "return res.status(`$1).end();"
        $content = $content -replace "JSON\.parse\(event\.body \|\| '\{\}'\)", "req.body"
        $content = $content -replace "JSON\.stringify\((.*?)\)", "`$1"
        
        # Добавляем CORS headers для Vercel
        $vercelContent = @"
// Vercel Serverless Function
export default async function handler(req, res) {
  // CORS headers
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

    // Остальной код из Netlify функции будет здесь
    // Нужно вручную адаптировать каждую функцию
  } catch (error) {
    console.error('Function error:', error);
    return res.status(500).json({ error: error.message });
  }
}
"@
        
        Write-Host "✅ Создан шаблон для $func" -ForegroundColor Green
    }
}

Write-Host "`n⚠️ ВНИМАНИЕ: Нужно вручную доработать каждую функцию!" -ForegroundColor Yellow
