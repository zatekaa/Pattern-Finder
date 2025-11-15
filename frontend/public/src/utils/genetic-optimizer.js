// 🧬 Genetic Algorithm для оптимизации весов факторов
// Автоматически находит лучшие веса для максимальной точности

class GeneticOptimizer {
    constructor() {
        this.populationSize = 50;
        this.generations = 30;
        this.mutationRate = 0.1;
        this.crossoverRate = 0.7;
        
        // Лучшие найденные веса (начальные значения)
        this.bestWeights = {
            price: 0.35,
            returns: 0.25,
            volatility: 0.10,
            trend: 0.10,
            volume: 0.05,
            indicators: 0.10,
            candles: 0.05
        };
        
        this.isOptimized = false;
    }

    /**
     * Оптимизирует веса на основе исторических данных
     */
    async optimizeWeights(historicalPatterns, actualOutcomes) {
        console.log('🧬 Запуск генетического алгоритма оптимизации весов...');
        
        if (!historicalPatterns || historicalPatterns.length < 10) {
            console.warn('⚠️ Недостаточно данных для оптимизации');
            return this.bestWeights;
        }

        try {
            // Создаем начальную популяцию
            let population = this.generateInitialPopulation();
            
            let bestFitness = 0;
            let generationsWithoutImprovement = 0;
            
            for (let gen = 0; gen < this.generations; gen++) {
                // Оцениваем приспособленность каждой особи
                const fitness = population.map(weights => 
                    this.evaluateFitness(weights, historicalPatterns, actualOutcomes)
                );
                
                // Находим лучшую особь
                const maxFitness = Math.max(...fitness);
                const bestIndex = fitness.indexOf(maxFitness);
                
                if (maxFitness > bestFitness) {
                    bestFitness = maxFitness;
                    this.bestWeights = {...population[bestIndex]};
                    generationsWithoutImprovement = 0;
                    console.log(`🧬 Поколение ${gen + 1}: Лучшая точность ${(maxFitness * 100).toFixed(1)}%`);
                } else {
                    generationsWithoutImprovement++;
                }
                
                // Early stopping если нет улучшений
                if (generationsWithoutImprovement > 5) {
                    console.log('✅ Оптимизация завершена (нет улучшений)');
                    break;
                }
                
                // Создаем новое поколение
                population = this.evolvePopulation(population, fitness);
            }
            
            console.log('✅ Оптимальные веса найдены:', this.bestWeights);
            console.log(`📊 Финальная точность: ${(bestFitness * 100).toFixed(1)}%`);
            
            this.isOptimized = true;
            this.saveBestWeights();
            
            return this.bestWeights;
            
        } catch (error) {
            console.error('❌ Ошибка оптимизации:', error);
            return this.bestWeights;
        }
    }

    /**
     * Генерирует начальную популяцию
     */
    generateInitialPopulation() {
        const population = [];
        
        // Добавляем текущие веса как первую особь
        population.push({...this.bestWeights});
        
        // Генерируем остальные случайно
        for (let i = 1; i < this.populationSize; i++) {
            const weights = this.generateRandomWeights();
            population.push(weights);
        }
        
        return population;
    }

    /**
     * Генерирует случайные веса
     */
    generateRandomWeights() {
        const weights = {
            price: Math.random(),
            returns: Math.random(),
            volatility: Math.random(),
            trend: Math.random(),
            volume: Math.random(),
            indicators: Math.random(),
            candles: Math.random()
        };
        
        // Нормализуем чтобы сумма = 1
        const sum = Object.values(weights).reduce((a, b) => a + b, 0);
        Object.keys(weights).forEach(key => {
            weights[key] /= sum;
        });
        
        return weights;
    }

    /**
     * Оценивает приспособленность (точность) набора весов
     */
    evaluateFitness(weights, historicalPatterns, actualOutcomes) {
        let correctPredictions = 0;
        
        for (let i = 0; i < historicalPatterns.length; i++) {
            const pattern = historicalPatterns[i];
            const actualOutcome = actualOutcomes[i];
            
            // Вычисляем прогноз с этими весами
            const prediction = this.calculatePrediction(pattern, weights);
            
            // Проверяем правильность
            if (this.isPredictionCorrect(prediction, actualOutcome)) {
                correctPredictions++;
            }
        }
        
        return correctPredictions / historicalPatterns.length;
    }

    /**
     * Вычисляет прогноз с заданными весами
     */
    calculatePrediction(pattern, weights) {
        // Упрощенная версия - в реальности используется полный алгоритм
        const score = 
            pattern.priceScore * weights.price +
            pattern.returnsScore * weights.returns +
            pattern.volatilityScore * weights.volatility +
            pattern.trendScore * weights.trend +
            pattern.volumeScore * weights.volume +
            pattern.indicatorsScore * weights.indicators +
            pattern.candlesScore * weights.candles;
        
        return score > 0.5 ? 'up' : 'down';
    }

    /**
     * Проверяет правильность прогноза
     */
    isPredictionCorrect(prediction, actualOutcome) {
        return prediction === actualOutcome;
    }

    /**
     * Эволюция популяции (селекция, скрещивание, мутация)
     */
    evolvePopulation(population, fitness) {
        const newPopulation = [];
        
        // Элитизм - сохраняем лучшие 10%
        const eliteCount = Math.floor(this.populationSize * 0.1);
        const sortedIndices = fitness
            .map((f, i) => ({fitness: f, index: i}))
            .sort((a, b) => b.fitness - a.fitness)
            .map(item => item.index);
        
        for (let i = 0; i < eliteCount; i++) {
            newPopulation.push({...population[sortedIndices[i]]});
        }
        
        // Создаем остальных через скрещивание и мутацию
        while (newPopulation.length < this.populationSize) {
            // Турнирная селекция
            const parent1 = this.tournamentSelection(population, fitness);
            const parent2 = this.tournamentSelection(population, fitness);
            
            // Скрещивание
            let child;
            if (Math.random() < this.crossoverRate) {
                child = this.crossover(parent1, parent2);
            } else {
                child = {...parent1};
            }
            
            // Мутация
            if (Math.random() < this.mutationRate) {
                child = this.mutate(child);
            }
            
            newPopulation.push(child);
        }
        
        return newPopulation;
    }

    /**
     * Турнирная селекция
     */
    tournamentSelection(population, fitness) {
        const tournamentSize = 3;
        let best = null;
        let bestFitness = -1;
        
        for (let i = 0; i < tournamentSize; i++) {
            const index = Math.floor(Math.random() * population.length);
            if (fitness[index] > bestFitness) {
                bestFitness = fitness[index];
                best = population[index];
            }
        }
        
        return {...best};
    }

    /**
     * Скрещивание (одноточечное)
     */
    crossover(parent1, parent2) {
        const child = {};
        const keys = Object.keys(parent1);
        const crossoverPoint = Math.floor(Math.random() * keys.length);
        
        keys.forEach((key, i) => {
            child[key] = i < crossoverPoint ? parent1[key] : parent2[key];
        });
        
        // Нормализуем
        const sum = Object.values(child).reduce((a, b) => a + b, 0);
        Object.keys(child).forEach(key => {
            child[key] /= sum;
        });
        
        return child;
    }

    /**
     * Мутация
     */
    mutate(weights) {
        const mutated = {...weights};
        const keys = Object.keys(mutated);
        const mutateKey = keys[Math.floor(Math.random() * keys.length)];
        
        // Изменяем случайный вес на ±20%
        mutated[mutateKey] *= (0.8 + Math.random() * 0.4);
        
        // Нормализуем
        const sum = Object.values(mutated).reduce((a, b) => a + b, 0);
        Object.keys(mutated).forEach(key => {
            mutated[key] /= sum;
        });
        
        return mutated;
    }

    /**
     * Сохраняет лучшие веса
     */
    saveBestWeights() {
        try {
            localStorage.setItem('genetic_best_weights', JSON.stringify(this.bestWeights));
            console.log('💾 Лучшие веса сохранены');
        } catch (error) {
            console.error('Ошибка сохранения весов:', error);
        }
    }

    /**
     * Загружает сохраненные веса
     */
    loadBestWeights() {
        try {
            const saved = localStorage.getItem('genetic_best_weights');
            if (saved) {
                this.bestWeights = JSON.parse(saved);
                this.isOptimized = true;
                console.log('📂 Загружены оптимизированные веса');
                return true;
            }
        } catch (error) {
            console.error('Ошибка загрузки весов:', error);
        }
        return false;
    }

    /**
     * Получает текущие лучшие веса
     */
    getBestWeights() {
        return {...this.bestWeights};
    }
}

// Глобальный экземпляр
window.geneticOptimizer = new GeneticOptimizer();
window.geneticOptimizer.loadBestWeights();
console.log('✅ Genetic Optimizer инициализирован');
