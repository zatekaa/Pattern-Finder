// Главный файл базы данных - объединяет все активы

// Сервис для работы с базой данных активов
class AssetService {
    constructor() {
        this.databases = {
            crypto: window.cryptoDatabase || [],
            stocks: window.stocksDatabase || [],
            forex: window.forexDatabase || [],
            indices: window.indicesDatabase || [],
            etf: window.etfDatabase || [],
            commodities: window.commoditiesDatabase || []
        };
        this.initialized = false;
    }

    // Инициализация сервиса
    initialize() {
        if (this.initialized) return;
        
        // Обновляем базы данных на случай если они загрузились после создания сервиса
        this.databases = {
            crypto: window.cryptoDatabase || [],
            stocks: window.stocksDatabase || [],
            forex: window.forexDatabase || [],
            indices: window.indicesDatabase || [],
            etf: window.etfDatabase || [],
            commodities: window.commoditiesDatabase || []
        };
        
        this.initialized = true;
        console.log('✅ AssetService initialized with', this.getStats().total, 'assets');
    }

    // Получить все активы
    getAllAssets() {
        const allAssets = [];
        
        for (const [type, database] of Object.entries(this.databases)) {
            database.forEach(asset => {
                allAssets.push({
                    ...asset,
                    type: type
                });
            });
        }
        
        return allAssets;
    }

    // Поиск актива по символу
    findAsset(symbol) {
        if (!symbol) return null;
        
        const upperSymbol = symbol.toUpperCase().trim();
        
        // Поиск в каждой базе данных
        for (const [type, database] of Object.entries(this.databases)) {
            const found = database.find(asset => 
                asset.symbol.toUpperCase() === upperSymbol
            );
            
            if (found) {
                return {
                    ...found,
                    type: type
                };
            }
        }
        
        return null;
    }

    // Поиск активов по запросу (для автодополнения)
    searchAssets(query, limit = 10) {
        if (!query || query.length < 1) return [];
        
        const upperQuery = query.toUpperCase().trim();
        const results = [];
        
        for (const [type, database] of Object.entries(this.databases)) {
            database.forEach(asset => {
                const symbolMatch = asset.symbol.toUpperCase().includes(upperQuery);
                const nameMatch = asset.name.toUpperCase().includes(upperQuery);
                
                if (symbolMatch || nameMatch) {
                    results.push({
                        ...asset,
                        type: type,
                        relevance: symbolMatch ? 2 : 1 // Приоритет для совпадения по символу
                    });
                }
            });
        }
        
        // Сортировка по релевантности и ограничение результатов
        return results
            .sort((a, b) => b.relevance - a.relevance)
            .slice(0, limit);
    }

    // Получить количество активов по типам
    getStats() {
        const stats = {};
        let total = 0;
        
        for (const [type, database] of Object.entries(this.databases)) {
            stats[type] = database.length;
            total += database.length;
        }
        
        stats.total = total;
        return stats;
    }

    // Получить активы по типу
    getAssetsByType(type) {
        return this.databases[type] || [];
    }

    // Проверить существование актива
    assetExists(symbol) {
        return this.findAsset(symbol) !== null;
    }
}

// Создаем глобальный экземпляр сервиса
window.AssetService = new AssetService();

// Выводим статистику в консоль
console.log('📊 Asset Database loaded:', window.AssetService.getStats());
