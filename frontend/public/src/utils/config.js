// ⚠️ ВАЖНО: Этот файл содержит конфигурацию API
// В production эти ключи должны быть на backend сервере!

const CONFIG = {
    // API Endpoints
    API_ENDPOINTS: {
        binance: 'https://api.binance.com',
        binanceTicker: 'https://api.binance.com/api/v3/ticker/price',
        coingecko: 'https://api.coingecko.com/api/v3',
        yahoo: 'https://query1.finance.yahoo.com',
        coinmarketcap: 'https://pro-api.coinmarketcap.com',
        alphavantage: 'https://www.alphavantage.co',
        twelvedata: 'https://api.twelvedata.com',
        polygon: 'https://api.polygon.io',
        finnhub: 'https://finnhub.io/api/v1'
    },

    // ⚠️ API Keys теперь хранятся на сервере (Netlify Environment Variables)
    // Все запросы проходят через Netlify Functions
    // Используйте window.apiClient для вызовов API
    API_KEYS: {
        // Ключи удалены из frontend кода для безопасности
        // Настройте их в Netlify Dashboard: Site settings > Environment variables
    },

    // Настройки кэширования
    CACHE: {
        // Исторические данные кэшируются на 15 минут
        HISTORICAL_DATA_TTL: 15 * 60 * 1000,
        
        // Текущие цены кэшируются на 1 минуту
        REALTIME_PRICE_TTL: 60 * 1000,
        
        // Информация об активах кэшируется на 1 час
        ASSET_INFO_TTL: 60 * 60 * 1000,
        
        // Результаты поиска кэшируются на 5 минут
        SEARCH_RESULTS_TTL: 5 * 60 * 1000
    },

    // Настройки retry для API запросов
    RETRY: {
        MAX_RETRIES: 3,
        INITIAL_DELAY: 1000, // 1 секунда
        MAX_DELAY: 5000, // 5 секунд
        BACKOFF_MULTIPLIER: 2 // Экспоненциальный рост задержки
    },

    // Таймауты для запросов
    TIMEOUTS: {
        API_REQUEST: 10000, // 10 секунд
        ANALYSIS: 30000 // 30 секунд для анализа
    },

    // Лимиты
    LIMITS: {
        MAX_PERIOD_LENGTH: 300,
        MIN_PERIOD_LENGTH: 1,
        MAX_SEARCH_RESULTS: 10,
        MAX_SIMILAR_PATTERNS: 6
    },

    // Настройки автодополнения
    AUTOCOMPLETE: {
        MIN_CHARS: 1, // Минимум символов для начала поиска
        DEBOUNCE_DELAY: 300, // Задержка перед поиском (мс)
        MAX_RESULTS: 10 // Максимум результатов
    }
};

// Делаем доступным глобально
if (typeof window !== 'undefined') {
    window.CONFIG = CONFIG;
}

// Экспорт конфигурации
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}
