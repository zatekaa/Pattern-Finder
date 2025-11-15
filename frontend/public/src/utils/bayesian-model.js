// 🎲 Bayesian Probabilistic Model
// Вероятностная модель для улучшения точности прогнозов

class BayesianModel {
    constructor() {
        // Prior probabilities (начальные вероятности)
        this.priors = {
            bullish: 0.5,  // 50% вероятность роста
            bearish: 0.5   // 50% вероятность падения
        };
        
        // Likelihood (правдоподобие) для каждого фактора
        this.likelihoods = {
            highSimilarity: { bullish: 0.75, bearish: 0.25 },
            mediumSimilarity: { bullish: 0.55, bearish: 0.45 },
            lowSimilarity: { bullish: 0.40, bearish: 0.60 },
            
            upTrend: { bullish: 0.70, bearish: 0.30 },
            downTrend: { bullish: 0.30, bearish: 0.70 },
            sideways: { bullish: 0.50, bearish: 0.50 },
            
            highVolume: { bullish: 0.65, bearish: 0.35 },
            lowVolume: { bullish: 0.45, bearish: 0.55 },
            
            wave3: { bullish: 0.85, bearish: 0.15 },  // Волна 3 Эллиотта
            wave5: { bullish: 0.60, bearish: 0.40 },  // Волна 5
            waveA: { bullish: 0.35, bearish: 0.65 }   // Коррекция A
        };
    }

    /**
     * Вычисляет финальную вероятность используя теорему Байеса
     */
    calculateProbability(evidence) {
        let bullishProb = this.priors.bullish;
        let bearishProb = this.priors.bearish;
        
        console.log('🎲 Байесовский анализ:');
        console.log('  Начальные вероятности:', {
            bullish: (bullishProb * 100).toFixed(1) + '%',
            bearish: (bearishProb * 100).toFixed(1) + '%'
        });
        
        // Обновляем вероятности на основе каждого свидетельства
        for (const [factor, value] of Object.entries(evidence)) {
            const likelihood = this.getLikelihood(factor, value);
            
            if (likelihood) {
                // Теорема Байеса: P(H|E) = P(E|H) * P(H) / P(E)
                const pEvidence = 
                    likelihood.bullish * bullishProb + 
                    likelihood.bearish * bearishProb;
                
                const newBullishProb = (likelihood.bullish * bullishProb) / pEvidence;
                const newBearishProb = (likelihood.bearish * bearishProb) / pEvidence;
                
                console.log(`  ${factor}: ${value} →`, {
                    bullish: (newBullishProb * 100).toFixed(1) + '%',
                    bearish: (newBearishProb * 100).toFixed(1) + '%'
                });
                
                bullishProb = newBullishProb;
                bearishProb = newBearishProb;
            }
        }
        
        console.log('  Финальные вероятности:', {
            bullish: (bullishProb * 100).toFixed(1) + '%',
            bearish: (bearishProb * 100).toFixed(1) + '%'
        });
        
        return {
            bullish: bullishProb,
            bearish: bearishProb,
            prediction: bullishProb > bearishProb ? 'bullish' : 'bearish',
            confidence: Math.abs(bullishProb - bearishProb)
        };
    }

    /**
     * Получает правдоподобие для фактора
     */
    getLikelihood(factor, value) {
        // Схожесть паттерна
        if (factor === 'similarity') {
            if (value > 0.7) return this.likelihoods.highSimilarity;
            if (value > 0.4) return this.likelihoods.mediumSimilarity;
            return this.likelihoods.lowSimilarity;
        }
        
        // Тренд
        if (factor === 'trend') {
            if (value > 0.3) return this.likelihoods.upTrend;
            if (value < -0.3) return this.likelihoods.downTrend;
            return this.likelihoods.sideways;
        }
        
        // Объем
        if (factor === 'volume') {
            return value > 1.2 ? this.likelihoods.highVolume : this.likelihoods.lowVolume;
        }
        
        // Волны Эллиотта
        if (factor === 'elliottWave') {
            if (value === 3) return this.likelihoods.wave3;
            if (value === 5) return this.likelihoods.wave5;
            if (value === 'A') return this.likelihoods.waveA;
        }
        
        return null;
    }

    /**
     * Обновляет prior вероятности на основе исторических данных
     */
    updatePriors(historicalOutcomes) {
        if (!historicalOutcomes || historicalOutcomes.length === 0) return;
        
        const bullishCount = historicalOutcomes.filter(o => o === 'bullish').length;
        const bearishCount = historicalOutcomes.length - bullishCount;
        
        this.priors.bullish = bullishCount / historicalOutcomes.length;
        this.priors.bearish = bearishCount / historicalOutcomes.length;
        
        console.log('📊 Prior вероятности обновлены:', this.priors);
    }

    /**
     * Обновляет likelihood на основе обучения
     */
    updateLikelihoods(factor, value, outcome) {
        // Простое обновление (можно улучшить)
        const likelihood = this.getLikelihood(factor, value);
        
        if (likelihood) {
            const learningRate = 0.1;
            
            if (outcome === 'bullish') {
                likelihood.bullish += learningRate * (1 - likelihood.bullish);
                likelihood.bearish -= learningRate * likelihood.bearish;
            } else {
                likelihood.bearish += learningRate * (1 - likelihood.bearish);
                likelihood.bullish -= learningRate * likelihood.bullish;
            }
            
            // Нормализуем
            const sum = likelihood.bullish + likelihood.bearish;
            likelihood.bullish /= sum;
            likelihood.bearish /= sum;
        }
    }

    /**
     * Сохраняет обученную модель
     */
    saveModel() {
        try {
            localStorage.setItem('bayesian_model', JSON.stringify({
                priors: this.priors,
                likelihoods: this.likelihoods
            }));
            console.log('💾 Байесовская модель сохранена');
        } catch (error) {
            console.error('Ошибка сохранения модели:', error);
        }
    }

    /**
     * Загружает обученную модель
     */
    loadModel() {
        try {
            const saved = localStorage.getItem('bayesian_model');
            if (saved) {
                const model = JSON.parse(saved);
                this.priors = model.priors;
                this.likelihoods = model.likelihoods;
                console.log('📂 Байесовская модель загружена');
                return true;
            }
        } catch (error) {
            console.error('Ошибка загрузки модели:', error);
        }
        return false;
    }
}

// Глобальный экземпляр
window.bayesianModel = new BayesianModel();
window.bayesianModel.loadModel();
console.log('✅ Bayesian Model инициализирован');
