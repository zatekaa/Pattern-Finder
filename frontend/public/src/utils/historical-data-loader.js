// 📊 Загрузчик исторических данных с 2000 года
// Работает через прокси-сервер на порту 9999 (БЕЗ Python сервиса)

class HistoricalDataLoader {
    constructor() {
        this.proxyURL = 'http://localhost:9999/api';
        this.cache = new Map();
        this.cacheTimeout = 15 * 60 * 1000; // 15 минут
    }

    /**
     * Загружает исторические данные актива с 2000 года
     * @param {string} symbol - символ актива (BTC, AAPL, EURUSD)
     * @param {string} interval - таймфрейм (1d, 1h, 5m)
     * @returns {Promise<Array>} - массив свечей OHLCV
     */
    async loadHistoricalData(symbol, interval = '1d') {
        const cacheKey = `${symbol}_${interval}`;
        
        // Проверяем кэш
        const cached = this.getFromCache(cacheKey);
        if (cached) {
            console.log(`✅ Данные ${symbol} загружены из кэша`);
            return cached;
        }

        console.log(`📥 Загрузка исторических данных ${symbol} (${interval})...`);
        
        try {
            // Определяем тип актива
            const assetType = this.detectAssetType(symbol);
            
            let data = null;
            
            // Загружаем данные в зависимости от типа актива
            switch (assetType) {
                case 'CRYPTO':
                    data = await this.loadCryptoData(symbol, interval);
                    break;
                case 'STOCK':
                    data = await this.loadStockData(symbol, interval);
                    break;
                case 'FOREX':
                    data = await this.loadForexData(symbol, interval);
                    break;
                case 'INDEX':
                    data = await this.loadIndexData(symbol, interval);
                    break;
                default:
                    throw new Error(`Неизвестный тип актива: ${symbol}`);
            }
            
            if (!data || data.length === 0) {
                throw new Error(`Не удалось загрузить данные для ${symbol}`);
            }
            
            // Сортируем по дате
            data.sort((a, b) => new Date(a.Date) - new Date(b.Date));
            
            // Сохраняем в кэш
            this.setToCache(cacheKey, data);
            
            console.log(`✅ Загружено ${data.length.toLocaleString()} свечей для ${symbol}`);
            console.log(`📅 Период: ${data[0].Date} - ${data[data.length - 1].Date}`);
            
            return data;
            
        } catch (error) {
            console.error(`❌ Ошибка загрузки данных ${symbol}:`, error);
            throw error;
        }
    }

    /**
     * Загружает данные криптовалюты
     */
    async loadCryptoData(symbol, interval) {
        // 🚀 ПРИОРИТЕТ: EOD API (платный, максимальная история)
        try {
            console.log(`💎 Загрузка ${symbol} через EOD API (платный)...`);
            
            const eodSymbol = symbol.replace('/', '-') + '.CC'; // .CC для криптовалют
            const eodInterval = this.convertToEODInterval(interval);
            
            // Для BTC начинаем с 2010 года (когда появился первый обмен)
            const startDate = symbol.toUpperCase().includes('BTC') ? '2010-01-01' : '2015-01-01';
            console.log(`📅 Период загрузки: с ${startDate} по сегодня`);
            
            const response = await fetch(`${this.proxyURL}/eodhistoricaldata`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    endpoint: `/intraday/${eodSymbol}`,
                    params: {
                        interval: eodInterval,
                        from: startDate
                    }
                })
            });
            
            if (response.ok) {
                const data = await response.json();
                if (data && data.length > 0) {
                    console.log(`✅ EOD API: загружено ${data.length} свечей`);
                    return data.map(d => ({
                        Date: d.datetime || d.Date,
                        Open: parseFloat(d.open || d.Open),
                        High: parseFloat(d.high || d.High),
                        Low: parseFloat(d.low || d.Low),
                        Close: parseFloat(d.close || d.Close),
                        Volume: parseFloat(d.volume || d.Volume || 0)
                    }));
                }
            }
            
            console.warn(`⚠️ EOD API не вернул данные для ${symbol}, пробуем Binance...`);
        } catch (eodError) {
            console.warn(`⚠️ EOD API ошибка для ${symbol}:`, eodError.message);
        }
        
        // Fallback: Binance (бесплатно, прямой запрос)
        try {
            console.log(`🔄 Fallback: Загрузка ${symbol} через Binance (прямой запрос)...`);
            
            const binanceSymbol = symbol.replace('/', '') + 'USDT';
            const binanceInterval = this.convertToBinanceInterval(interval);
            
            // Binance дает максимум 1000 свечей за запрос
            // Для BTC получаем историю с 2010 года
            const allData = [];
            let endTime = Date.now();
            const startYear = symbol.toUpperCase().includes('BTC') ? '2010-01-01' : '2017-01-01';
            const startTime = new Date(startYear).getTime();
            
            console.log(`📅 Загрузка с ${startYear} по сегодня...`);
            
            while (endTime > startTime && allData.length < 50000) {
                // Прямой запрос к Binance API (без прокси)
                const url = `https://api.binance.com/api/v3/klines?symbol=${binanceSymbol}&interval=${binanceInterval}&endTime=${endTime}&limit=1000`;
                const response = await fetch(url);
                
                if (!response.ok) break;
                
                const klines = await response.json();
                if (!klines || klines.length === 0) break;
                
                // Конвертируем в стандартный формат
                const converted = klines.map(k => ({
                    Date: new Date(k[0]).toISOString(),
                    Open: parseFloat(k[1]),
                    High: parseFloat(k[2]),
                    Low: parseFloat(k[3]),
                    Close: parseFloat(k[4]),
                    Volume: parseFloat(k[5])
                }));
                
                allData.unshift(...converted);
                endTime = klines[0][0] - 1;
                
                // Задержка чтобы не превысить лимит API
                await this.sleep(100);
            }
            
            if (allData.length > 0) {
                return allData;
            }
        } catch (error) {
            console.warn(`Binance failed for ${symbol}:`, error.message);
        }
        
        // Fallback: пробуем другие API
        throw new Error(`Не удалось загрузить данные для ${symbol} через доступные API`);
    }

    /**
     * Загружает данные акций
     */
    async loadStockData(symbol, interval) {
        // 🚀 ПРИОРИТЕТ: EOD API (платный)
        try {
            console.log(`💎 Загрузка ${symbol} через EOD API (платный)...`);
            
            const eodSymbol = symbol + '.US'; // .US для американских акций
            const eodInterval = this.convertToEODInterval(interval);
            
            const response = await fetch(`${this.proxyURL}/eodhistoricaldata`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    endpoint: `/intraday/${eodSymbol}`,
                    params: {
                        interval: eodInterval,
                        from: '2000-01-01'
                    }
                })
            });
            
            if (response.ok) {
                const data = await response.json();
                if (data && data.length > 0) {
                    console.log(`✅ EOD API: загружено ${data.length} свечей`);
                    return data.map(d => ({
                        Date: d.datetime || d.Date,
                        Open: parseFloat(d.open || d.Open),
                        High: parseFloat(d.high || d.High),
                        Low: parseFloat(d.low || d.Low),
                        Close: parseFloat(d.close || d.Close),
                        Volume: parseFloat(d.volume || d.Volume || 0)
                    }));
                }
            }
            
            console.warn(`⚠️ EOD API не вернул данные для ${symbol}, пробуем Yahoo Finance...`);
        } catch (eodError) {
            console.warn(`⚠️ EOD API ошибка для ${symbol}:`, eodError.message);
        }
        
        // Fallback: Yahoo Finance (бесплатно)
        try {
            console.log(`🔄 Fallback: Загрузка ${symbol} через Yahoo Finance...`);
            
            // Yahoo Finance дает хорошую историю с 2000 года
            const period1 = Math.floor(new Date('2000-01-01').getTime() / 1000);
            const period2 = Math.floor(Date.now() / 1000);
            const yahooInterval = this.convertToYahooInterval(interval);
            
            const response = await fetch(`${this.proxyURL}/yahoo`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    endpoint: `/v8/finance/chart/${symbol}`,
                    params: {
                        period1: period1,
                        period2: period2,
                        interval: yahooInterval,
                        includePrePost: false
                    }
                })
            });
            
            if (!response.ok) {
                throw new Error(`Yahoo Finance API error: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (!data.chart || !data.chart.result || !data.chart.result[0]) {
                throw new Error('Invalid Yahoo Finance response');
            }
            
            const result = data.chart.result[0];
            const timestamps = result.timestamp;
            const quotes = result.indicators.quote[0];
            
            const converted = timestamps.map((ts, i) => ({
                Date: new Date(ts * 1000).toISOString(),
                Open: quotes.open[i] || 0,
                High: quotes.high[i] || 0,
                Low: quotes.low[i] || 0,
                Close: quotes.close[i] || 0,
                Volume: quotes.volume[i] || 0
            })).filter(c => c.Close > 0);
            
            return converted;
            
        } catch (error) {
            console.error(`Yahoo Finance failed for ${symbol}:`, error.message);
            throw error;
        }
    }

    /**
     * Загружает данные форекс
     */
    async loadForexData(symbol, interval) {
        // 🚀 ПРИОРИТЕТ: EOD API (платный)
        try {
            console.log(`💎 Загрузка ${symbol} через EOD API (платный)...`);
            
            const eodSymbol = symbol + '.FOREX'; // .FOREX для валютных пар
            const eodInterval = this.convertToEODInterval(interval);
            
            const response = await fetch(`${this.proxyURL}/eodhistoricaldata`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    endpoint: `/intraday/${eodSymbol}`,
                    params: {
                        interval: eodInterval,
                        from: '2000-01-01'
                    }
                })
            });
            
            if (response.ok) {
                const data = await response.json();
                if (data && data.length > 0) {
                    console.log(`✅ EOD API: загружено ${data.length} свечей`);
                    return data.map(d => ({
                        Date: d.datetime || d.Date,
                        Open: parseFloat(d.open || d.Open),
                        High: parseFloat(d.high || d.High),
                        Low: parseFloat(d.low || d.Low),
                        Close: parseFloat(d.close || d.Close),
                        Volume: parseFloat(d.volume || d.Volume || 0)
                    }));
                }
            }
            
            console.warn(`⚠️ EOD API не вернул данные для ${symbol}, пробуем Alpha Vantage...`);
        } catch (eodError) {
            console.warn(`⚠️ EOD API ошибка для ${symbol}:`, eodError.message);
        }
        
        // Fallback: Alpha Vantage (бесплатно)
        try {
            console.log(`🔄 Fallback: Загрузка ${symbol} через Alpha Vantage...`);
            
            // Alpha Vantage для форекс
            const fromCurrency = symbol.substring(0, 3);
            const toCurrency = symbol.substring(3, 6);
            
            const response = await fetch(`${this.proxyURL}/alphavantage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    endpoint: '',
                    params: {
                        function: 'FX_DAILY',
                        from_symbol: fromCurrency,
                        to_symbol: toCurrency,
                        outputsize: 'full'
                    }
                })
            });
            
            if (!response.ok) {
                throw new Error(`Alpha Vantage API error: ${response.status}`);
            }
            
            const data = await response.json();
            const timeSeries = data['Time Series FX (Daily)'];
            
            if (!timeSeries) {
                throw new Error('No forex data available');
            }
            
            const converted = Object.entries(timeSeries).map(([date, values]) => ({
                Date: new Date(date).toISOString(),
                Open: parseFloat(values['1. open']),
                High: parseFloat(values['2. high']),
                Low: parseFloat(values['3. low']),
                Close: parseFloat(values['4. close']),
                Volume: 1000000
            }));
            
            return converted;
            
        } catch (error) {
            console.error(`Alpha Vantage failed for ${symbol}:`, error.message);
            throw error;
        }
    }

    /**
     * Загружает данные индексов
     */
    async loadIndexData(symbol, interval) {
        // Индексы загружаем как акции через Yahoo
        return await this.loadStockData(symbol, interval);
    }

    /**
     * Определяет тип актива по символу
     */
    detectAssetType(symbol) {
        const cryptoSymbols = ['BTC', 'ETH', 'BNB', 'SOL', 'XRP', 'ADA', 'DOGE', 'MATIC', 'DOT', 'AVAX'];
        const indexSymbols = ['^GSPC', '^DJI', '^IXIC', '^RUT', '^VIX'];
        
        // Криптовалюта
        if (cryptoSymbols.some(c => symbol.toUpperCase().includes(c))) {
            return 'CRYPTO';
        }
        
        // Индекс
        if (symbol.startsWith('^') || indexSymbols.includes(symbol)) {
            return 'INDEX';
        }
        
        // Форекс (6 символов: EURUSD, GBPUSD)
        if (symbol.length === 6 && /^[A-Z]{6}$/.test(symbol)) {
            return 'FOREX';
        }
        
        // По умолчанию - акция
        return 'STOCK';
    }

    /**
     * Конвертирует интервал в формат Binance
     */
    convertToBinanceInterval(interval) {
        const map = {
            '1m': '1m', '5m': '5m', '15m': '15m', '30m': '30m',
            '1h': '1h', '4h': '4h', '1d': '1d', '1w': '1w'
        };
        return map[interval] || '1d';
    }

    /**
     * Конвертирует интервал в формат EOD API
     */
    convertToEODInterval(interval) {
        const map = {
            '1m': '1m', '5m': '5m', '15m': '15m', '30m': '30m',
            '1h': '1h', '4h': '4h', '1d': '1d'
        };
        return map[interval] || '5m';
    }

    /**
     * Конвертирует интервал в формат Yahoo Finance
     */
    convertToYahooInterval(interval) {
        const map = {
            '1m': '1m', '5m': '5m', '15m': '15m', '30m': '30m',
            '1h': '1h', '1d': '1d', '1wk': '1wk', '1mo': '1mo'
        };
        return map[interval] || '1d';
    }

    /**
     * Кэширование
     */
    getFromCache(key) {
        const cached = this.cache.get(key);
        if (!cached) return null;
        
        const age = Date.now() - cached.timestamp;
        if (age > this.cacheTimeout) {
            this.cache.delete(key);
            return null;
        }
        
        return cached.data;
    }

    setToCache(key, data) {
        this.cache.set(key, {
            data: data,
            timestamp: Date.now()
        });
    }

    /**
     * Задержка
     */
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Экспорт
if (typeof window !== 'undefined') {
    window.HistoricalDataLoader = HistoricalDataLoader;
}
