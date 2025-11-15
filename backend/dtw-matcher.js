                                      /**
 * 🎯 DTW Pattern Matcher - РАБОТАЮЩИЙ АЛГОРИТМ!
 * 
 * Dynamic Time Warping - проверенный временем алгоритм
 * Находит похожие паттерны даже если они немного растянуты/сжаты
 */

class DTWMatcher {
  constructor(options = {}) {
    this.similarityThreshold = options.threshold || 0.85; // 85% порог (было 70%)
  }

  /**
   * Главный метод: поиск похожих паттернов
   */
  findSimilarPatterns(targetPattern, historicalData, topN = 10) {
    console.log(`🔍 DTW поиск: ${targetPattern.length} свечей в ${historicalData.length} свечах истории`);
    console.log(`🎯 Порог схожести: ${this.similarityThreshold * 100}%`);
    
    // Проверка входных данных
    if (!targetPattern || targetPattern.length === 0) {
      throw new Error('Паттерн пустой');
    }
    
    if (!historicalData || historicalData.length === 0) {
      throw new Error('Исторические данные пусты');
    }
    
    if (historicalData.length < targetPattern.length) {
      throw new Error('Недостаточно исторических данных');
    }

    const matches = [];
    const windowSize = targetPattern.length;
    
    // Нормализуем целевой паттерн
    const normalizedTarget = this._normalize(targetPattern);
    
    let maxSimilarity = 0;
    let checkedWindows = 0;
    
    // ОПТИМИЗАЦИЯ: Проверяем каждое 5-е окно вместо каждого (в 5 раз быстрее!)
    const step = 5;

    // Скользящее окно по истории
    for (let i = 0; i <= historicalData.length - windowSize; i += step) {
      const window = historicalData.slice(i, i + windowSize);
      const normalizedWindow = this._normalize(window);

      // Вычисляем DTW расстояние
      const distance = this._calculateDTW(normalizedTarget, normalizedWindow);
      
      // Конвертируем расстояние в схожесть (0-1)
      const similarity = 1 / (1 + distance);
      
      checkedWindows++;
      
      if (similarity > maxSimilarity) {
        maxSimilarity = similarity;
      }

      // Если схожесть выше порога
      if (similarity >= this.similarityThreshold) {
        const futureLength = 10;
        const futureData = historicalData.slice(i + windowSize, i + windowSize + futureLength);
        const futureOutcome = this._calculateFutureOutcome(historicalData, i + windowSize);
        
        matches.push({
          startIndex: i,
          endIndex: i + windowSize - 1,
          startDate: window[0].Date,
          endDate: window[window.length - 1].Date,
          similarity: Math.round(similarity * 10000) / 100,
          data: window,
          futureData: futureData,
          futureOutcome: futureOutcome,
          priceChange: this._calculatePriceChange(window)
        });
      }
    }

    // Сортируем по схожести
    matches.sort((a, b) => b.similarity - a.similarity);

    console.log(`✅ Проверено окон: ${checkedWindows}`);
    console.log(`📊 Максимальная схожесть: ${(maxSimilarity * 100).toFixed(2)}%`);
    console.log(`✅ Найдено паттернов: ${matches.length}`);
    
    if (matches.length === 0) {
      console.log(`⚠️ ПАТТЕРНЫ НЕ НАЙДЕНЫ!`);
      console.log(`   Максимальная схожесть была: ${(maxSimilarity * 100).toFixed(2)}%`);
      console.log(`   Порог: ${this.similarityThreshold * 100}%`);
    }

    return matches.slice(0, topN);
  }

  /**
   * Нормализация данных (цены -> процентные изменения)
   * УЛУЧШЕННАЯ ВЕРСИЯ: нормализуем по диапазону для точного сравнения формы
   */
  _normalize(candles) {
    if (candles.length === 0) return [];
    
    // Находим min и max для нормализации в диапазон [0, 1]
    const closes = candles.map(c => c.Close);
    const minPrice = Math.min(...closes);
    const maxPrice = Math.max(...closes);
    const range = maxPrice - minPrice;
    
    if (range === 0) {
      // Если нет изменений, возвращаем нули
      return candles.map(() => ({
        open: 0,
        high: 0,
        low: 0,
        close: 0
      }));
    }
    
    const normalized = [];
    
    for (const candle of candles) {
      // Нормализуем в диапазон [0, 1]
      normalized.push({
        open: (candle.Open - minPrice) / range,
        high: (candle.High - minPrice) / range,
        low: (candle.Low - minPrice) / range,
        close: (candle.Close - minPrice) / range
      });
    }
    
    return normalized;
  }

  /**
   * Вычисление DTW расстояния
   */
  _calculateDTW(series1, series2) {
    const n = series1.length;
    const m = series2.length;
    
    // Создаем матрицу DTW
    const dtw = Array(n + 1).fill(null).map(() => Array(m + 1).fill(Infinity));
    dtw[0][0] = 0;

    // Заполняем матрицу
    for (let i = 1; i <= n; i++) {
      for (let j = 1; j <= m; j++) {
        const cost = this._distance(series1[i - 1], series2[j - 1]);
        dtw[i][j] = cost + Math.min(
          dtw[i - 1][j],     // insertion
          dtw[i][j - 1],     // deletion
          dtw[i - 1][j - 1]  // match
        );
      }
    }

    return dtw[n][m] / n; // Нормализуем по длине
  }

  /**
   * Расстояние между двумя свечами
   */
  _distance(candle1, candle2) {
    // Евклидово расстояние между OHLC
    const diff = Math.sqrt(
      Math.pow(candle1.open - candle2.open, 2) +
      Math.pow(candle1.high - candle2.high, 2) +
      Math.pow(candle1.low - candle2.low, 2) +
      Math.pow(candle1.close - candle2.close, 2)
    );
    return diff;
  }

  /**
   * Вычисляет что произошло после паттерна
   */
  _calculateFutureOutcome(historicalData, startIndex) {
    const futureLength = 10;
    
    if (startIndex + futureLength > historicalData.length) {
      return null;
    }

    const currentPrice = historicalData[startIndex - 1].Close;
    const futurePrice = historicalData[startIndex + futureLength - 1].Close;

    const change = ((futurePrice - currentPrice) / currentPrice) * 100;
    
    return Math.round(change * 100) / 100;
  }

  /**
   * Вычисляет изменение цены в паттерне
   */
  _calculatePriceChange(candles) {
    const firstPrice = candles[0].Close;
    const lastPrice = candles[candles.length - 1].Close;
    
    const change = ((lastPrice - firstPrice) / firstPrice) * 100;
    
    return Math.round(change * 100) / 100;
  }

  /**
   * Статистика по найденным паттернам
   */
  calculateStatistics(matches) {
    if (matches.length === 0) {
      return {
        totalMatches: 0,
        avgSimilarity: 0,
        avgFutureOutcome: null,
        successRate: 0
      };
    }

    const avgSimilarity = matches.reduce((sum, m) => sum + m.similarity, 0) / matches.length;
    
    const withOutcomes = matches.filter(m => m.futureOutcome !== null);
    const avgFutureOutcome = withOutcomes.length > 0
      ? withOutcomes.reduce((sum, m) => sum + m.futureOutcome, 0) / withOutcomes.length
      : null;

    const positiveOutcomes = withOutcomes.filter(m => m.futureOutcome > 0).length;
    const successRate = withOutcomes.length > 0
      ? (positiveOutcomes / withOutcomes.length) * 100
      : 0;

    return {
      totalMatches: matches.length,
      avgSimilarity: Math.round(avgSimilarity * 100) / 100,
      avgFutureOutcome: avgFutureOutcome !== null ? Math.round(avgFutureOutcome * 100) / 100 : null,
      successRate: Math.round(successRate * 100) / 100
    };
  }
}

module.exports = DTWMatcher;
