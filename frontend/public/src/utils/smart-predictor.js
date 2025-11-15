/**
 * 🧠 УМНЫЙ ПРЕДИКТОР - Статистический анализ тренда
 * 
 * Анализирует исторические данные и генерирует реалистичный прогноз
 * на основе:
 * - Moving Average (скользящее среднее)
 * - Volatility (волатильность)
 * - Momentum (импульс)
 * - Mean Reversion (возврат к среднему)
 */

class SmartPredictor {
    constructor() {
        this.config = {
            // Параметры анализа
            lookbackPeriod: 20,        // Анализируем последние 20 свечей
            volatilityWindow: 10,       // Окно для расчета волатильности
            momentumWindow: 5,          // Окно для расчета импульса
            
            // Параметры прогноза
            meanReversionStrength: 0.3, // Сила возврата к среднему (0-1)
            maxDailyChange: 0.03,       // Максимальное дневное изменение ±3%
            trendContinuationProb: 0.6  // Вероятность продолжения тренда
        };
    }

    /**
     * Главный метод: генерирует умный прогноз
     * @param {Array} historicalData - Исторические данные (минимум 20 свечей)
     * @param {Number} forecastLength - Количество свечей для прогноза
     * @returns {Array} - Прогнозные данные
     */
    generateSmartForecast(historicalData, forecastLength) {
        if (!historicalData || historicalData.length < 20) {
            console.warn('⚠️ Недостаточно данных для умного прогноза');
            return this._generateFallbackForecast(historicalData, forecastLength);
        }

        console.log('🧠 Генерация умного прогноза...');
        
        // Шаг 1: Анализируем текущий тренд
        const analysis = this._analyzeTrend(historicalData);
        console.log('📊 Анализ тренда:', analysis);

        // Шаг 2: Генерируем прогноз на основе анализа
        const forecast = this._generateForecast(historicalData, forecastLength, analysis);
        
        console.log(`✅ Прогноз сгенерирован: ${forecast.length} свечей`);
        return forecast;
    }

    /**
     * Анализирует тренд на основе исторических данных
     */
    _analyzeTrend(data) {
        const recentData = data.slice(-this.config.lookbackPeriod);
        
        // 1. Moving Average (простое скользящее среднее)
        const ma = this._calculateMA(recentData);
        
        // 2. Volatility (стандартное отклонение)
        const volatility = this._calculateVolatility(recentData);
        
        // 3. Momentum (импульс движения)
        const momentum = this._calculateMomentum(recentData);
        
        // 4. Trend Direction (направление тренда)
        const trendDirection = this._detectTrendDirection(recentData, ma);
        
        // 5. Trend Strength (сила тренда)
        const trendStrength = this._calculateTrendStrength(recentData, ma);

        return {
            movingAverage: ma,
            volatility: volatility,
            momentum: momentum,
            direction: trendDirection,  // 'up', 'down', 'sideways'
            strength: trendStrength,    // 0-1
            lastPrice: recentData[recentData.length - 1].Close
        };
    }

    /**
     * Генерирует прогноз на основе анализа
     */
    _generateForecast(historicalData, length, analysis) {
        const forecast = [];
        const lastCandle = historicalData[historicalData.length - 1];
        let currentPrice = lastCandle.Close;
        
        // Определяем целевую цену с учетом mean reversion
        const targetPrice = this._calculateTargetPrice(currentPrice, analysis);
        const priceChange = targetPrice - currentPrice;
        const stepChange = priceChange / length;

        for (let i = 0; i < length; i++) {
            const progress = (i + 1) / length;
            
            // Базовое движение к целевой цене
            let expectedPrice = currentPrice + stepChange;
            
            // Добавляем реалистичную волатильность
            const noise = this._generateNoise(analysis.volatility);
            expectedPrice = expectedPrice * (1 + noise);
            
            // Ограничиваем максимальное изменение за свечу
            const maxChange = currentPrice * this.config.maxDailyChange;
            expectedPrice = Math.max(
                currentPrice - maxChange,
                Math.min(currentPrice + maxChange, expectedPrice)
            );

            // Генерируем OHLC для свечи
            const candle = this._generateRealisticCandle(
                currentPrice,
                expectedPrice,
                analysis.volatility
            );

            // Добавляем дату
            const baseDate = new Date(lastCandle.Date);
            baseDate.setDate(baseDate.getDate() + i + 1);
            candle.Date = baseDate.toISOString();

            forecast.push(candle);
            currentPrice = candle.Close;
        }

        return forecast;
    }

    /**
     * Вычисляет целевую цену с учетом тренда и mean reversion
     */
    _calculateTargetPrice(currentPrice, analysis) {
        const { direction, strength, momentum, movingAverage } = analysis;
        
        // Базовое изменение на основе momentum
        let baseChange = momentum * strength;
        
        // Mean Reversion: притяжение к скользящему среднему
        const distanceFromMA = (currentPrice - movingAverage) / movingAverage;
        const reversionForce = -distanceFromMA * this.config.meanReversionStrength;
        
        // Комбинируем тренд и mean reversion
        const totalChange = baseChange + reversionForce;
        
        // Ограничиваем максимальное изменение
        const limitedChange = Math.max(-0.05, Math.min(0.05, totalChange)); // ±5% макс
        
        return currentPrice * (1 + limitedChange);
    }

    /**
     * Генерирует реалистичную свечу с OHLC
     */
    _generateRealisticCandle(openPrice, closePrice, volatility) {
        const isBullish = closePrice > openPrice;
        const bodySize = Math.abs(closePrice - openPrice);
        
        // Фитили пропорциональны волатильности
        const wickMultiplier = Math.max(0.5, volatility * 10); // Нормализуем волатильность
        const upperWick = bodySize * (0.1 + Math.random() * 0.2) * wickMultiplier;
        const lowerWick = bodySize * (0.1 + Math.random() * 0.2) * wickMultiplier;
        
        const high = Math.max(openPrice, closePrice) + upperWick;
        const low = Math.min(openPrice, closePrice) - lowerWick;

        return {
            Open: openPrice,
            High: high,
            Low: low,
            Close: closePrice,
            Volume: 0 // Можно добавить прогноз объема
        };
    }

    /**
     * Генерирует шум на основе волатильности
     */
    _generateNoise(volatility) {
        // Нормальное распределение (Box-Muller transform)
        const u1 = Math.random();
        const u2 = Math.random();
        const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
        
        // Масштабируем по волатильности
        return z * volatility * 0.5; // Уменьшаем влияние шума
    }

    /**
     * Вычисляет простое скользящее среднее
     */
    _calculateMA(data) {
        const sum = data.reduce((acc, candle) => acc + candle.Close, 0);
        return sum / data.length;
    }

    /**
     * Вычисляет волатильность (стандартное отклонение)
     */
    _calculateVolatility(data) {
        const prices = data.map(d => d.Close);
        const mean = prices.reduce((a, b) => a + b) / prices.length;
        const variance = prices.reduce((acc, price) => acc + Math.pow(price - mean, 2), 0) / prices.length;
        return Math.sqrt(variance) / mean; // Нормализованная волатильность
    }

    /**
     * Вычисляет momentum (импульс)
     */
    _calculateMomentum(data) {
        const recentData = data.slice(-this.config.momentumWindow);
        const firstPrice = recentData[0].Close;
        const lastPrice = recentData[recentData.length - 1].Close;
        return (lastPrice - firstPrice) / firstPrice;
    }

    /**
     * Определяет направление тренда
     */
    _detectTrendDirection(data, ma) {
        const lastPrice = data[data.length - 1].Close;
        const priceVsMA = (lastPrice - ma) / ma;
        
        if (priceVsMA > 0.02) return 'up';      // Цена выше MA на 2%+
        if (priceVsMA < -0.02) return 'down';   // Цена ниже MA на 2%+
        return 'sideways';
    }

    /**
     * Вычисляет силу тренда
     */
    _calculateTrendStrength(data, ma) {
        // Считаем сколько свечей выше/ниже MA
        const aboveMA = data.filter(d => d.Close > ma).length;
        const strength = Math.abs(aboveMA / data.length - 0.5) * 2; // 0-1
        return strength;
    }

    /**
     * Фоллбэк: простой прогноз если недостаточно данных
     */
    _generateFallbackForecast(historicalData, length) {
        console.warn('⚠️ Используем упрощенный прогноз');
        
        if (!historicalData || historicalData.length === 0) {
            return [];
        }

        const lastCandle = historicalData[historicalData.length - 1];
        const forecast = [];
        let currentPrice = lastCandle.Close;

        // Простое продолжение с минимальной волатильностью
        for (let i = 0; i < length; i++) {
            const noise = (Math.random() - 0.5) * 0.01; // ±0.5%
            const newPrice = currentPrice * (1 + noise);

            const baseDate = new Date(lastCandle.Date);
            baseDate.setDate(baseDate.getDate() + i + 1);

            forecast.push({
                Date: baseDate.toISOString(),
                Open: currentPrice,
                High: Math.max(currentPrice, newPrice) * 1.005,
                Low: Math.min(currentPrice, newPrice) * 0.995,
                Close: newPrice,
                Volume: 0
            });

            currentPrice = newPrice;
        }

        return forecast;
    }
}

// Экспорт для использования в других модулях
if (typeof window !== 'undefined') {
    window.SmartPredictor = SmartPredictor;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = SmartPredictor;
}
