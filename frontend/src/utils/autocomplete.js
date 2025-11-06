// 🔍 Система автодополнения для поиска активов

class AutocompleteManager {
    constructor() {
        this.allAssets = [];
        this.initialized = false;
        this.searchIndex = new Map();
    }

    /**
     * Инициализация - загрузка всех активов
     */
    async initialize() {
        if (this.initialized) return;

        try {
            // Получаем все активы из базы данных
            const cryptoAssets = window.CRYPTO_DATABASE || [];
            const stockAssets = window.STOCKS_DATABASE || [];
            const forexAssets = window.FOREX_DATABASE || [];
            const indicesAssets = window.INDICES_DATABASE || [];
            const etfAssets = window.ETF_DATABASE || [];

            // Объединяем и форматируем
            this.allAssets = [
                ...cryptoAssets.map(a => ({ ...a, type: 'Криптовалюта', icon: '₿' })),
                ...stockAssets.map(a => ({ ...a, type: 'Акция', icon: '📈' })),
                ...forexAssets.map(a => ({ ...a, type: 'Форекс', icon: '💱' })),
                ...indicesAssets.map(a => ({ ...a, type: 'Индекс', icon: '📊' })),
                ...etfAssets.map(a => ({ ...a, type: 'ETF', icon: '🏦' }))
            ];

            // Создаем поисковый индекс для быстрого поиска
            this.buildSearchIndex();

            this.initialized = true;
            console.log(`✅ Автодополнение инициализировано: ${this.allAssets.length} активов`);
        } catch (error) {
            console.error('❌ Ошибка инициализации автодополнения:', error);
        }
    }

    /**
     * Построение поискового индекса
     */
    buildSearchIndex() {
        this.allAssets.forEach((asset, index) => {
            // Индексируем по символу
            const symbol = asset.symbol.toLowerCase();
            if (!this.searchIndex.has(symbol)) {
                this.searchIndex.set(symbol, []);
            }
            this.searchIndex.get(symbol).push(index);

            // Индексируем по названию
            if (asset.name) {
                const name = asset.name.toLowerCase();
                const words = name.split(/\s+/);
                words.forEach(word => {
                    if (word.length > 2) {
                        if (!this.searchIndex.has(word)) {
                            this.searchIndex.set(word, []);
                        }
                        this.searchIndex.get(word).push(index);
                    }
                });
            }
        });
    }

    /**
     * Поиск активов по запросу
     * @param {string} query - Поисковый запрос
     * @param {number} limit - Максимум результатов
     * @returns {Array} - Массив найденных активов
     */
    search(query, limit = CONFIG.AUTOCOMPLETE.MAX_RESULTS) {
        if (!query || query.length < CONFIG.AUTOCOMPLETE.MIN_CHARS) {
            return [];
        }

        const searchQuery = query.toLowerCase().trim();
        const results = [];
        const seen = new Set();

        // 1. Точное совпадение символа (высший приоритет)
        this.allAssets.forEach((asset, index) => {
            if (asset.symbol.toLowerCase() === searchQuery) {
                results.push({ ...asset, score: 1000 });
                seen.add(index);
            }
        });

        // 2. Символ начинается с запроса
        this.allAssets.forEach((asset, index) => {
            if (!seen.has(index) && asset.symbol.toLowerCase().startsWith(searchQuery)) {
                results.push({ ...asset, score: 500 });
                seen.add(index);
            }
        });

        // 3. Символ содержит запрос
        this.allAssets.forEach((asset, index) => {
            if (!seen.has(index) && asset.symbol.toLowerCase().includes(searchQuery)) {
                results.push({ ...asset, score: 300 });
                seen.add(index);
            }
        });

        // 4. Название начинается с запроса
        this.allAssets.forEach((asset, index) => {
            if (!seen.has(index) && asset.name && 
                asset.name.toLowerCase().startsWith(searchQuery)) {
                results.push({ ...asset, score: 200 });
                seen.add(index);
            }
        });

        // 5. Название содержит запрос
        this.allAssets.forEach((asset, index) => {
            if (!seen.has(index) && asset.name && 
                asset.name.toLowerCase().includes(searchQuery)) {
                results.push({ ...asset, score: 100 });
                seen.add(index);
            }
        });

        // Сортируем по релевантности и ограничиваем количество
        return results
            .sort((a, b) => b.score - a.score)
            .slice(0, limit);
    }

    /**
     * Получить популярные активы
     */
    getPopularAssets(limit = 10) {
        const popular = [
            'BTC', 'ETH', 'BNB', 'SOL', 'XRP', // Крипта
            'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', // Акции
            'EURUSD', 'GBPUSD', 'USDJPY', // Форекс
            '^GSPC', '^DJI', '^IXIC' // Индексы
        ];

        return this.allAssets
            .filter(asset => popular.includes(asset.symbol))
            .slice(0, limit);
    }

    /**
     * Получить активы по типу
     */
    getAssetsByType(type, limit = 10) {
        return this.allAssets
            .filter(asset => asset.type === type)
            .slice(0, limit);
    }

    /**
     * Форматирование результата для отображения
     */
    formatResult(asset) {
        return {
            symbol: asset.symbol,
            name: asset.name || asset.symbol,
            type: asset.type,
            icon: asset.icon,
            displayText: `${asset.icon} ${asset.symbol} - ${asset.name || asset.symbol}`,
            subtitle: asset.type
        };
    }

    /**
     * Получить все активы
     */
    getAllAssets() {
        return this.allAssets;
    }

    /**
     * Получить количество активов
     */
    getAssetCount() {
        return this.allAssets.length;
    }
}

// Создаем глобальный экземпляр
const autocompleteManager = new AutocompleteManager();

// Делаем доступным глобально
if (typeof window !== 'undefined') {
    window.autocompleteManager = autocompleteManager;
}

// Экспорт
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AutocompleteManager;
}
