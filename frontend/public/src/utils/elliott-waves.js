// 🌊 Elliott Wave Analysis - Волновой анализ
// Детекция волн Эллиотта для улучшения точности прогнозов

class ElliottWaveAnalyzer {
    constructor() {
        // Типы волн
        this.WAVE_TYPES = {
            IMPULSE: 'impulse',      // Импульсные волны (1,3,5)
            CORRECTIVE: 'corrective' // Коррекционные волны (2,4,A,B,C)
        };
        
        // Веса для разных волн
        this.WAVE_WEIGHTS = {
            1: 1.0,  // Начало импульса
            2: 0.8,  // Коррекция
            3: 1.5,  // Самая сильная волна
            4: 0.7,  // Коррекция
            5: 1.2,  // Завершение импульса
            'A': 0.6, // Начало коррекции
            'B': 0.5, // Промежуточная
            'C': 0.8  // Завершение коррекции
        };
    }

    /**
     * Анализирует паттерн и определяет волновую структуру
     */
    analyzeWaves(pattern) {
        if (!pattern || pattern.length < 5) {
            return {
                detected: false,
                currentWave: null,
                waveWeight: 1.0,
                confidence: 0
            };
        }

        try {
            // Находим экстремумы (пики и впадины)
            const extrema = this.findExtrema(pattern);
            
            if (extrema.length < 5) {
                return {
                    detected: false,
                    currentWave: null,
                    waveWeight: 1.0,
                    confidence: 0
                };
            }

            // Пытаемся определить импульсную последовательность (1-2-3-4-5)
            const impulseWaves = this.detectImpulseWaves(extrema, pattern);
            
            if (impulseWaves.detected) {
                return {
                    detected: true,
                    type: this.WAVE_TYPES.IMPULSE,
                    currentWave: impulseWaves.currentWave,
                    waveWeight: this.WAVE_WEIGHTS[impulseWaves.currentWave] || 1.0,
                    confidence: impulseWaves.confidence,
                    direction: impulseWaves.direction,
                    description: this.getWaveDescription(impulseWaves.currentWave)
                };
            }

            // Пытаемся определить коррекционную последовательность (A-B-C)
            const correctiveWaves = this.detectCorrectiveWaves(extrema, pattern);
            
            if (correctiveWaves.detected) {
                return {
                    detected: true,
                    type: this.WAVE_TYPES.CORRECTIVE,
                    currentWave: correctiveWaves.currentWave,
                    waveWeight: this.WAVE_WEIGHTS[correctiveWaves.currentWave] || 1.0,
                    confidence: correctiveWaves.confidence,
                    direction: correctiveWaves.direction,
                    description: this.getWaveDescription(correctiveWaves.currentWave)
                };
            }

            return {
                detected: false,
                currentWave: null,
                waveWeight: 1.0,
                confidence: 0
            };

        } catch (error) {
            console.error('Elliott Wave analysis error:', error);
            return {
                detected: false,
                currentWave: null,
                waveWeight: 1.0,
                confidence: 0
            };
        }
    }

    /**
     * Находит экстремумы (пики и впадины)
     */
    findExtrema(pattern) {
        const extrema = [];
        
        for (let i = 1; i < pattern.length - 1; i++) {
            const prev = pattern[i - 1].Close;
            const curr = pattern[i].Close;
            const next = pattern[i + 1].Close;
            
            // Пик (локальный максимум)
            if (curr > prev && curr > next) {
                extrema.push({
                    index: i,
                    price: curr,
                    type: 'peak'
                });
            }
            
            // Впадина (локальный минимум)
            if (curr < prev && curr < next) {
                extrema.push({
                    index: i,
                    price: curr,
                    type: 'trough'
                });
            }
        }
        
        return extrema;
    }

    /**
     * Детекция импульсных волн (1-2-3-4-5)
     */
    detectImpulseWaves(extrema, pattern) {
        if (extrema.length < 5) {
            return { detected: false };
        }

        // Проверяем восходящий импульс
        const upImpulse = this.checkImpulsePattern(extrema, 'up');
        if (upImpulse.detected) {
            return {
                detected: true,
                currentWave: upImpulse.currentWave,
                confidence: upImpulse.confidence,
                direction: 'up'
            };
        }

        // Проверяем нисходящий импульс
        const downImpulse = this.checkImpulsePattern(extrema, 'down');
        if (downImpulse.detected) {
            return {
                detected: true,
                currentWave: downImpulse.currentWave,
                confidence: downImpulse.confidence,
                direction: 'down'
            };
        }

        return { detected: false };
    }

    /**
     * Проверяет импульсный паттерн
     */
    checkImpulsePattern(extrema, direction) {
        // Правила Эллиотта для импульса:
        // 1. Волна 3 не может быть самой короткой
        // 2. Волна 2 не может опуститься ниже начала волны 1
        // 3. Волна 4 не может войти в ценовой диапазон волны 1

        const isUp = direction === 'up';
        
        // Берем последние 5 экстремумов
        const last5 = extrema.slice(-5);
        
        if (last5.length < 5) {
            return { detected: false };
        }

        // Вычисляем длины волн
        const wave1 = Math.abs(last5[1].price - last5[0].price);
        const wave2 = Math.abs(last5[2].price - last5[1].price);
        const wave3 = Math.abs(last5[3].price - last5[2].price);
        const wave4 = Math.abs(last5[4].price - last5[3].price);

        // Проверяем правила
        const rule1 = wave3 >= wave1 && wave3 >= wave2; // Волна 3 не самая короткая
        const rule2 = isUp ? last5[2].price > last5[0].price : last5[2].price < last5[0].price;
        const rule3 = isUp ? last5[4].price > last5[1].price : last5[4].price < last5[1].price;

        const rulesMatched = [rule1, rule2, rule3].filter(r => r).length;
        const confidence = rulesMatched / 3;

        if (confidence >= 0.6) {
            // Определяем текущую волну
            const currentWave = this.determineCurrentWave(extrema, pattern);
            
            return {
                detected: true,
                currentWave: currentWave,
                confidence: confidence
            };
        }

        return { detected: false };
    }

    /**
     * Детекция коррекционных волн (A-B-C)
     */
    detectCorrectiveWaves(extrema, pattern) {
        if (extrema.length < 3) {
            return { detected: false };
        }

        const last3 = extrema.slice(-3);
        
        // Простая проверка: три волны с чередующимся направлением
        const isCorrection = 
            (last3[0].type !== last3[1].type) &&
            (last3[1].type !== last3[2].type);

        if (isCorrection) {
            const currentWave = this.determineCorrectiveWave(extrema, pattern);
            
            return {
                detected: true,
                currentWave: currentWave,
                confidence: 0.7,
                direction: last3[2].price > last3[0].price ? 'up' : 'down'
            };
        }

        return { detected: false };
    }

    /**
     * Определяет текущую волну в импульсе
     */
    determineCurrentWave(extrema, pattern) {
        const lastPrice = pattern[pattern.length - 1].Close;
        const lastExtremum = extrema[extrema.length - 1];
        
        // Если цена выше последнего экстремума - вероятно волна 3 или 5
        if (lastPrice > lastExtremum.price) {
            return extrema.length % 2 === 0 ? 3 : 5;
        } else {
            return extrema.length % 2 === 0 ? 2 : 4;
        }
    }

    /**
     * Определяет текущую волну в коррекции
     */
    determineCorrectiveWave(extrema, pattern) {
        const waveCount = extrema.length % 3;
        return ['A', 'B', 'C'][waveCount] || 'A';
    }

    /**
     * Возвращает описание волны
     */
    getWaveDescription(wave) {
        const descriptions = {
            1: 'Начало импульса - слабый сигнал',
            2: 'Коррекция волны 1 - осторожность',
            3: 'Самая сильная волна - СИЛЬНЫЙ СИГНАЛ!',
            4: 'Коррекция волны 3 - ожидание',
            5: 'Завершение импульса - скоро разворот',
            'A': 'Начало коррекции - слабый сигнал',
            'B': 'Промежуточная коррекция - нейтрально',
            'C': 'Завершение коррекции - возможен разворот'
        };
        
        return descriptions[wave] || 'Неопределенная волна';
    }
}

// Глобальный экземпляр
window.elliottWaveAnalyzer = new ElliottWaveAnalyzer();
console.log('✅ Elliott Wave Analyzer инициализирован');
