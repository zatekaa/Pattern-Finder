// 🛡️ Система обработки ошибок с retry логикой

class ErrorHandler {
    constructor() {
        this.errorLog = [];
        this.maxLogSize = 100;
    }

    /**
     * Выполнить fetch с retry логикой
     * @param {string} url - URL для запроса
     * @param {object} options - Опции fetch
     * @param {number} maxRetries - Максимум попыток
     * @returns {Promise<Response>}
     */
    async fetchWithRetry(url, options = {}, maxRetries = CONFIG.RETRY.MAX_RETRIES) {
        let lastError;
        let delay = CONFIG.RETRY.INITIAL_DELAY;

        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                console.log(`🔄 Попытка ${attempt}/${maxRetries}: ${url}`);

                // Добавляем таймаут к запросу
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), CONFIG.TIMEOUTS.API_REQUEST);

                const response = await fetch(url, {
                    ...options,
                    signal: controller.signal
                });

                clearTimeout(timeoutId);

                // Проверяем статус ответа
                if (response.ok) {
                    console.log(`✅ Успешный запрос: ${url}`);
                    return response;
                }

                // Если 429 (Too Many Requests) - увеличиваем задержку
                if (response.status === 429) {
                    const retryAfter = response.headers.get('Retry-After');
                    delay = retryAfter ? parseInt(retryAfter) * 1000 : delay * 2;
                    console.warn(`⚠️ Rate limit (429), ждем ${delay}ms`);
                }

                // Если 404 - не пытаемся повторно
                if (response.status === 404) {
                    throw new Error(`Ресурс не найден: ${url}`);
                }

                // Если 401/403 - проблема с авторизацией
                if (response.status === 401 || response.status === 403) {
                    throw new Error(`Ошибка авторизации (${response.status}): проверьте API ключ`);
                }

                lastError = new Error(`HTTP ${response.status}: ${response.statusText}`);

            } catch (error) {
                lastError = error;

                // Если это AbortError (таймаут)
                if (error.name === 'AbortError') {
                    console.warn(`⏱️ Таймаут запроса: ${url}`);
                    lastError = new Error(`Таймаут запроса (${CONFIG.TIMEOUTS.API_REQUEST}ms)`);
                }

                // Если это сетевая ошибка
                if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
                    console.warn(`🌐 Сетевая ошибка: ${url}`);
                    lastError = new Error('Проблема с интернет соединением');
                }

                this.logError({
                    url,
                    attempt,
                    error: lastError.message,
                    timestamp: new Date().toISOString()
                });
            }

            // Если это не последняя попытка - ждем перед следующей
            if (attempt < maxRetries) {
                console.log(`⏳ Ожидание ${delay}ms перед следующей попыткой...`);
                await this.delay(delay);
                
                // Экспоненциальный рост задержки
                delay = Math.min(delay * CONFIG.RETRY.BACKOFF_MULTIPLIER, CONFIG.RETRY.MAX_DELAY);
            }
        }

        // Все попытки исчерпаны
        const finalError = new Error(
            `Не удалось выполнить запрос после ${maxRetries} попыток: ${lastError.message}`
        );
        this.logError({
            url,
            error: finalError.message,
            timestamp: new Date().toISOString(),
            final: true
        });

        throw finalError;
    }

    /**
     * Задержка выполнения
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Обработка ошибок API
     */
    handleApiError(error, apiName) {
        console.error(`❌ Ошибка ${apiName}:`, error);

        let userMessage = 'Произошла ошибка при получении данных';

        if (error.message.includes('Таймаут')) {
            userMessage = `⏱️ ${apiName}: Превышено время ожидания. Попробуйте позже.`;
        } else if (error.message.includes('интернет')) {
            userMessage = `🌐 Проблема с интернет соединением. Проверьте подключение.`;
        } else if (error.message.includes('авторизации')) {
            userMessage = `🔐 ${apiName}: Проблема с авторизацией API.`;
        } else if (error.message.includes('не найден')) {
            userMessage = `🔍 Актив не найден в ${apiName}.`;
        } else if (error.message.includes('Rate limit')) {
            userMessage = `⚠️ ${apiName}: Превышен лимит запросов. Подождите минуту.`;
        }

        return {
            success: false,
            error: error.message,
            userMessage: userMessage,
            apiName: apiName
        };
    }

    /**
     * Логирование ошибок
     */
    logError(errorInfo) {
        this.errorLog.push(errorInfo);

        // Ограничиваем размер лога
        if (this.errorLog.length > this.maxLogSize) {
            this.errorLog.shift();
        }

        // В production можно отправлять на сервер
        if (errorInfo.final) {
            console.error('🚨 Критическая ошибка:', errorInfo);
        }
    }

    /**
     * Получить лог ошибок
     */
    getErrorLog() {
        return this.errorLog;
    }

    /**
     * Очистить лог ошибок
     */
    clearErrorLog() {
        this.errorLog = [];
    }

    /**
     * Получить статистику ошибок
     */
    getErrorStats() {
        const stats = {
            total: this.errorLog.length,
            byUrl: {},
            recent: this.errorLog.slice(-10)
        };

        this.errorLog.forEach(log => {
            if (log.url) {
                stats.byUrl[log.url] = (stats.byUrl[log.url] || 0) + 1;
            }
        });

        return stats;
    }

    /**
     * Показать понятное сообщение пользователю
     */
    showUserError(error, context = '') {
        const message = this.getUserFriendlyMessage(error, context);
        
        // Можно заменить на более красивое уведомление
        alert(message);
        
        return message;
    }

    /**
     * Получить понятное сообщение для пользователя
     */
    getUserFriendlyMessage(error, context) {
        let message = '❌ Произошла ошибка';

        if (context) {
            message += ` при ${context}`;
        }

        if (error.message.includes('Таймаут')) {
            message += '\n\n⏱️ Превышено время ожидания.\nПопробуйте:\n• Обновить страницу\n• Проверить интернет соединение';
        } else if (error.message.includes('интернет') || error.message.includes('Failed to fetch')) {
            message += '\n\n🌐 Проблема с интернет соединением.\nПроверьте подключение к сети.';
        } else if (error.message.includes('не найден')) {
            message += '\n\n🔍 Актив не найден.\nПопробуйте:\n• Проверить правильность символа\n• Выбрать другой актив\n• Использовать другой таймфрейм';
        } else if (error.message.includes('Недостаточно данных')) {
            message += '\n\n📊 Недостаточно данных для анализа.\nПопробуйте:\n• Уменьшить длину периода\n• Выбрать другой таймфрейм\n• Выбрать более популярный актив';
        } else if (error.message.includes('Rate limit')) {
            message += '\n\n⚠️ Превышен лимит запросов к API.\nПодождите 1-2 минуты и попробуйте снова.';
        } else {
            message += `\n\n${error.message}`;
        }

        return message;
    }

    /**
     * Обработка ошибок с fallback
     */
    async tryWithFallback(primaryFn, fallbackFn, context) {
        try {
            return await primaryFn();
        } catch (primaryError) {
            console.warn(`⚠️ Основной метод не сработал (${context}), пробуем fallback...`);
            
            try {
                return await fallbackFn();
            } catch (fallbackError) {
                console.error(`❌ Fallback тоже не сработал (${context})`);
                throw new Error(`Не удалось ${context}: ${primaryError.message}`);
            }
        }
    }
}

// Создаем глобальный экземпляр
const errorHandler = new ErrorHandler();

// Делаем доступным глобально
if (typeof window !== 'undefined') {
    window.errorHandler = errorHandler;
    
    // Глобальный обработчик необработанных ошибок
    window.addEventListener('unhandledrejection', (event) => {
        console.error('🚨 Необработанная ошибка Promise:', event.reason);
        errorHandler.logError({
            type: 'unhandledRejection',
            error: event.reason?.message || String(event.reason),
            timestamp: new Date().toISOString()
        });
    });
}

// Экспорт
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ErrorHandler;
}
