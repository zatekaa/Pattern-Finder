// API Client для работы с Netlify Functions
// Этот модуль заменяет прямые вызовы к внешним API на вызовы к нашим serverless функциям

class APIClient {
    constructor() {
        // Определяем базовый URL для API
        // Автоматически определяем порт из текущего URL
        const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        this.baseURL = isLocal
            ? `http://localhost:${window.location.port || 9999}/.netlify/functions`
            : '/.netlify/functions';
    }

    /**
     * Универсальный метод для вызова Netlify Functions
     */
    async callFunction(functionName, endpoint, params = {}) {
        try {
            const response = await fetch(`${this.baseURL}/${functionName}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ endpoint, params })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || `HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error(`Error calling ${functionName}:`, error);
            throw error;
        }
    }

    /**
     * Binance API
     */
    async binance(endpoint, params = {}) {
        return this.callFunction('binance', endpoint, params);
    }

    /**
     * CoinMarketCap API
     */
    async coinmarketcap(endpoint, params = {}) {
        return this.callFunction('coinmarketcap', endpoint, params);
    }

    /**
     * Polygon API
     */
    async polygon(endpoint, params = {}) {
        return this.callFunction('polygon', endpoint, params);
    }

    /**
     * Finnhub API
     */
    async finnhub(endpoint, params = {}) {
        return this.callFunction('finnhub', endpoint, params);
    }

    /**
     * TwelveData API
     */
    async twelvedata(endpoint, params = {}) {
        return this.callFunction('twelvedata', endpoint, params);
    }

    /**
     * AlphaVantage API
     */
    async alphavantage(params = {}) {
        return this.callFunction('alphavantage', '', params);
    }

    /**
     * Yahoo Finance API
     */
    async yahoo(endpoint, params = {}) {
        return this.callFunction('yahoo', endpoint, params);
    }

    /**
     * Получить цену с Binance (прямой вызов без функции, т.к. Binance разрешает CORS)
     */
    async getBinancePrice(symbol) {
        try {
            const response = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${symbol}`);
            if (!response.ok) throw new Error('Failed to fetch price');
            return await response.json();
        } catch (error) {
            console.error('Error fetching Binance price:', error);
            throw error;
        }
    }

    /**
     * Получить исторические данные с Binance
     */
    async getBinanceKlines(symbol, interval, limit = 1000) {
        return this.binance('/api/v3/klines', {
            symbol: symbol,
            interval: interval,
            limit: limit
        });
    }

    /**
     * Получить данные с Yahoo Finance
     */
    async getYahooData(symbol, period1, period2, interval = '1d') {
        const endpoint = `/v8/finance/chart/${symbol}`;
        return this.yahoo(endpoint, {
            period1: period1,
            period2: period2,
            interval: interval
        });
    }

    /**
     * Получить данные с TwelveData
     */
    async getTwelveDataTimeSeries(symbol, interval = '1day', outputsize = 5000) {
        return this.twelvedata('/time_series', {
            symbol: symbol,
            interval: interval,
            outputsize: outputsize
        });
    }

    /**
     * Получить данные с Polygon
     */
    async getPolygonAggregates(ticker, multiplier, timespan, from, to) {
        const endpoint = `/v2/aggs/ticker/${ticker}/range/${multiplier}/${timespan}/${from}/${to}`;
        return this.polygon(endpoint, { adjusted: 'true', sort: 'asc', limit: 50000 });
    }

    /**
     * Получить данные с AlphaVantage
     */
    async getAlphaVantageDaily(symbol, outputsize = 'full') {
        return this.alphavantage({
            function: 'TIME_SERIES_DAILY',
            symbol: symbol,
            outputsize: outputsize
        });
    }

    /**
     * Получить данные с Finnhub
     */
    async getFinnhubCandles(symbol, resolution, from, to) {
        return this.finnhub('/stock/candle', {
            symbol: symbol,
            resolution: resolution,
            from: from,
            to: to
        });
    }
}

// Создаем глобальный экземпляр
if (typeof window !== 'undefined') {
    window.apiClient = new APIClient();
}

// Экспорт для модулей
if (typeof module !== 'undefined' && module.exports) {
    module.exports = APIClient;
}
