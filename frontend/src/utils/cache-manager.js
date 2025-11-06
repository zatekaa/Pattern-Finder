// 💾 Система кэширования для оптимизации API запросов

class CacheManager {
    constructor() {
        this.memoryCache = new Map();
        this.storageAvailable = this.checkLocalStorage();
        this.stats = {
            hits: 0,
            misses: 0,
            sets: 0
        };
    }

    /**
     * Проверка доступности localStorage
     */
    checkLocalStorage() {
        try {
            const test = '__cache_test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (e) {
            console.warn('localStorage недоступен, используется только память');
            return false;
        }
    }

    /**
     * Генерация ключа кэша
     */
    generateKey(prefix, params) {
        const paramsStr = typeof params === 'object' 
            ? JSON.stringify(params) 
            : String(params);
        return `${prefix}_${paramsStr}`;
    }

    /**
     * Получить данные из кэша
     * @param {string} key - Ключ кэша
     * @param {number} maxAge - Максимальный возраст в миллисекундах
     * @returns {any|null} - Данные или null если не найдено/устарело
     */
    get(key, maxAge = CONFIG.CACHE.HISTORICAL_DATA_TTL) {
        // Сначала проверяем память
        const memoryItem = this.memoryCache.get(key);
        if (memoryItem && this.isValid(memoryItem, maxAge)) {
            this.stats.hits++;
            console.log(`✅ Cache HIT (memory): ${key}`);
            return memoryItem.data;
        }

        // Затем проверяем localStorage
        if (this.storageAvailable) {
            try {
                const storageItem = localStorage.getItem(key);
                if (storageItem) {
                    const parsed = JSON.parse(storageItem);
                    if (this.isValid(parsed, maxAge)) {
                        // Копируем в память для быстрого доступа
                        this.memoryCache.set(key, parsed);
                        this.stats.hits++;
                        console.log(`✅ Cache HIT (storage): ${key}`);
                        return parsed.data;
                    } else {
                        // Удаляем устаревшие данные
                        localStorage.removeItem(key);
                    }
                }
            } catch (e) {
                console.warn('Ошибка чтения из localStorage:', e);
            }
        }

        this.stats.misses++;
        console.log(`❌ Cache MISS: ${key}`);
        return null;
    }

    /**
     * Сохранить данные в кэш
     * @param {string} key - Ключ кэша
     * @param {any} data - Данные для сохранения
     * @param {boolean} persistent - Сохранять в localStorage
     */
    set(key, data, persistent = true) {
        const item = {
            data: data,
            timestamp: Date.now()
        };

        // Сохраняем в память
        this.memoryCache.set(key, item);

        // Сохраняем в localStorage если доступен
        if (persistent && this.storageAvailable) {
            try {
                localStorage.setItem(key, JSON.stringify(item));
            } catch (e) {
                // localStorage может быть переполнен
                if (e.name === 'QuotaExceededError') {
                    console.warn('localStorage переполнен, очищаем старые данные');
                    this.clearOldEntries();
                    try {
                        localStorage.setItem(key, JSON.stringify(item));
                    } catch (e2) {
                        console.error('Не удалось сохранить в localStorage:', e2);
                    }
                }
            }
        }

        this.stats.sets++;
        console.log(`💾 Cache SET: ${key}`);
    }

    /**
     * Проверка валидности кэша
     */
    isValid(item, maxAge) {
        if (!item || !item.timestamp) return false;
        const age = Date.now() - item.timestamp;
        return age < maxAge;
    }

    /**
     * Удалить конкретный ключ
     */
    delete(key) {
        this.memoryCache.delete(key);
        if (this.storageAvailable) {
            localStorage.removeItem(key);
        }
        console.log(`🗑️ Cache DELETE: ${key}`);
    }

    /**
     * Очистить весь кэш
     */
    clear() {
        this.memoryCache.clear();
        if (this.storageAvailable) {
            // Удаляем только наши ключи
            const keys = Object.keys(localStorage);
            keys.forEach(key => {
                if (key.startsWith('asset_') || 
                    key.startsWith('price_') || 
                    key.startsWith('search_')) {
                    localStorage.removeItem(key);
                }
            });
        }
        console.log('🗑️ Cache полностью очищен');
    }

    /**
     * Очистить старые записи из localStorage
     */
    clearOldEntries() {
        if (!this.storageAvailable) return;

        const now = Date.now();
        const keys = Object.keys(localStorage);
        let cleared = 0;

        keys.forEach(key => {
            try {
                const item = JSON.parse(localStorage.getItem(key));
                if (item && item.timestamp) {
                    const age = now - item.timestamp;
                    // Удаляем записи старше 1 часа
                    if (age > 60 * 60 * 1000) {
                        localStorage.removeItem(key);
                        cleared++;
                    }
                }
            } catch (e) {
                // Не наш ключ или поврежденные данные
            }
        });

        console.log(`🗑️ Очищено старых записей: ${cleared}`);
    }

    /**
     * Получить статистику кэша
     */
    getStats() {
        const hitRate = this.stats.hits + this.stats.misses > 0
            ? (this.stats.hits / (this.stats.hits + this.stats.misses) * 100).toFixed(2)
            : 0;

        return {
            ...this.stats,
            hitRate: `${hitRate}%`,
            memorySize: this.memoryCache.size,
            storageSize: this.storageAvailable ? Object.keys(localStorage).length : 0
        };
    }

    /**
     * Вывести статистику в консоль
     */
    printStats() {
        const stats = this.getStats();
        console.log('📊 Статистика кэша:', stats);
    }

    /**
     * Получить размер кэша в localStorage
     */
    getStorageSize() {
        if (!this.storageAvailable) return 0;

        let size = 0;
        for (let key in localStorage) {
            if (localStorage.hasOwnProperty(key)) {
                size += localStorage[key].length + key.length;
            }
        }
        return (size / 1024).toFixed(2); // KB
    }
}

// Создаем глобальный экземпляр
const cacheManager = new CacheManager();

// Делаем доступным глобально
if (typeof window !== 'undefined') {
    window.cacheManager = cacheManager;
}

// Периодическая очистка старых записей (каждые 30 минут)
setInterval(() => {
    cacheManager.clearOldEntries();
}, 30 * 60 * 1000);

// Экспорт
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CacheManager;
}
