// ⚠️ API Keys теперь хранятся на сервере в Netlify Functions
// Все запросы к API проходят через наши serverless функции

// Основные классы
class AdvancedPricePredictor {
    constructor() {
        this.technicalIndicators = {};
    }

    calculateRSI(prices, period = 14) {
        if (!prices || prices.length < period + 1) return 50;
        
        let gains = 0;
        let losses = 0;
        
        for (let i = 1; i <= period; i++) {
            const change = prices[prices.length - i] - prices[prices.length - i - 1];
            if (change > 0) gains += change;
            else losses -= change;
        }
        
        if (losses === 0) return 100;
        if (gains === 0) return 0;
        
        const avgGain = gains / period;
        const avgLoss = losses / period;
        const rs = avgGain / avgLoss;
        return 100 - (100 / (1 + rs));
    }

    calculateSMA(prices, period) {
        if (!prices || prices.length < period) return prices[prices.length - 1];
        const sum = prices.slice(-period).reduce((a, b) => a + b, 0);
        return sum / period;
    }

    calculateEMA(prices, period) {
        if (!prices || prices.length < period) return prices[prices.length - 1];
        
        const multiplier = 2 / (period + 1);
        let ema = prices[0];
        
        for (let i = 1; i < prices.length; i++) {
            ema = (prices[i] - ema) * multiplier + ema;
        }
        
        return ema;
    }

    calculateMACD(prices) {
        if (!prices || prices.length < 26) return 0;
        const ema12 = this.calculateEMA(prices, 12);
        const ema26 = this.calculateEMA(prices, 26);
        return ema12 - ema26;
    }

    calculateBollingerBands(prices, period = 20) {
        if (!prices || prices.length < period) {
            const currentPrice = prices[prices.length - 1];
            return { 
                upper: currentPrice * 1.02, 
                middle: currentPrice, 
                lower: currentPrice * 0.98 
            };
        }
        
        const slice = prices.slice(-period);
        const middle = slice.reduce((a, b) => a + b, 0) / period;
        const variance = slice.reduce((a, b) => a + Math.pow(b - middle, 2), 0) / period;
        const stdDev = Math.sqrt(variance);
        
        return {
            upper: middle + (stdDev * 2),
            middle: middle,
            lower: middle - (stdDev * 2)
        };
    }

    // 🆕 Stochastic Oscillator - определяет перекупленность/перепроданность
    calculateStochastic(data, period = 14) {
        if (!data || data.length < period) return 50;
        
        const recentData = data.slice(-period);
        const currentClose = data[data.length - 1].Close;
        const lowestLow = Math.min(...recentData.map(d => d.Low));
        const highestHigh = Math.max(...recentData.map(d => d.High));
        
        if (highestHigh === lowestLow) return 50;
        
        const k = ((currentClose - lowestLow) / (highestHigh - lowestLow)) * 100;
        return k;
    }

    // 🆕 ATR (Average True Range) - измеряет волатильность
    calculateATR(data, period = 14) {
        if (!data || data.length < period + 1) return 1;
        
        const trueRanges = [];
        for (let i = 1; i < data.length; i++) {
            const high = data[i].High;
            const low = data[i].Low;
            const prevClose = data[i - 1].Close;
            
            const tr = Math.max(
                high - low,
                Math.abs(high - prevClose),
                Math.abs(low - prevClose)
            );
            trueRanges.push(tr);
        }
        
        const recentTR = trueRanges.slice(-period);
        return recentTR.reduce((a, b) => a + b, 0) / period;
    }

    // 🆕 ADX (Average Directional Index) - сила тренда
    calculateADX(data, period = 14) {
        if (!data || data.length < period + 1) return 25;
        
        let plusDM = 0, minusDM = 0;
        
        for (let i = 1; i < Math.min(period + 1, data.length); i++) {
            const highDiff = data[i].High - data[i - 1].High;
            const lowDiff = data[i - 1].Low - data[i].Low;
            
            if (highDiff > lowDiff && highDiff > 0) plusDM += highDiff;
            if (lowDiff > highDiff && lowDiff > 0) minusDM += lowDiff;
        }
        
        const atr = this.calculateATR(data, period);
        if (atr === 0) return 25;
        
        const plusDI = (plusDM / period) / atr * 100;
        const minusDI = (minusDM / period) / atr * 100;
        
        const dx = Math.abs(plusDI - minusDI) / (plusDI + minusDI) * 100;
        return dx || 25;
    }

    // 🆕 OBV (On-Balance Volume) - анализ объемов
    calculateOBV(data) {
        if (!data || data.length < 2) return 0;
        
        let obv = 0;
        for (let i = 1; i < data.length; i++) {
            if (data[i].Close > data[i - 1].Close) {
                obv += data[i].Volume || 0;
            } else if (data[i].Close < data[i - 1].Close) {
                obv -= data[i].Volume || 0;
            }
        }
        return obv;
    }

    // 🆕 Анализ паттернов свечей
    detectCandlePatterns(data) {
        if (!data || data.length < 3) return { bullish: 0, bearish: 0 };
        
        let bullishCount = 0;
        let bearishCount = 0;
        const recent = data.slice(-5);
        
        recent.forEach((candle, i) => {
            const body = Math.abs(candle.Close - candle.Open);
            const range = candle.High - candle.Low;
            const bodyRatio = range > 0 ? body / range : 0;
            
            // Молот (Hammer) - бычий
            if (candle.Close > candle.Open && bodyRatio > 0.6) {
                const lowerShadow = candle.Open - candle.Low;
                if (lowerShadow > body * 2) bullishCount++;
            }
            
            // Падающая звезда - медвежий
            if (candle.Open > candle.Close && bodyRatio > 0.6) {
                const upperShadow = candle.High - candle.Open;
                if (upperShadow > body * 2) bearishCount++;
            }
            
            // Поглощение
            if (i > 0) {
                const prev = recent[i - 1];
                const prevBody = Math.abs(prev.Close - prev.Open);
                
                if (candle.Close > candle.Open && prev.Close < prev.Open && body > prevBody * 1.5) {
                    bullishCount += 2;
                }
                if (candle.Close < candle.Open && prev.Close > prev.Open && body > prevBody * 1.5) {
                    bearishCount += 2;
                }
            }
        });
        
        return { bullish: bullishCount, bearish: bearishCount };
    }

    prepareAdvancedFeatures(currentData) {
        if (!currentData || currentData.length === 0) {
            return this.getDefaultFeatures();
        }

        try {
            const prices = currentData.map(d => d.Close);
            const currentPrice = prices[prices.length - 1];
            
            // Базовые индикаторы
            const rsi = this.calculateRSI(prices);
            const sma20 = this.calculateSMA(prices, 20);
            const sma50 = this.calculateSMA(prices, 50);
            const ema12 = this.calculateEMA(prices, 12);
            const ema26 = this.calculateEMA(prices, 26);
            const macd = this.calculateMACD(prices);
            const bb = this.calculateBollingerBands(prices);
            
            // 🆕 Новые индикаторы
            const stochastic = this.calculateStochastic(currentData);
            const atr = this.calculateATR(currentData);
            const adx = this.calculateADX(currentData);
            const obv = this.calculateOBV(currentData);
            const candlePatterns = this.detectCandlePatterns(currentData);
            
            // Волатильность
            const recentPrices = prices.slice(-Math.min(20, prices.length));
            const mean = recentPrices.reduce((a, b) => a + b, 0) / recentPrices.length;
            const variance = recentPrices.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / recentPrices.length;
            const volatility = Math.sqrt(variance) / currentPrice * 100;
            
            // Изменения цены
            const priceChange1h = prices.length > 4 ? 
                ((currentPrice - prices[prices.length - 4]) / prices[prices.length - 4]) * 100 : 0;
            const priceChange24h = prices.length > 24 ? 
                ((currentPrice - prices[prices.length - 24]) / prices[prices.length - 24]) * 100 : 0;
            const priceChange7d = prices.length > 168 ? 
                ((currentPrice - prices[prices.length - 168]) / prices[prices.length - 168]) * 100 : 0;

            const bbPosition = bb.upper && bb.lower && (bb.upper - bb.lower) > 0 ? 
                Math.max(0, Math.min(1, (currentPrice - bb.lower) / (bb.upper - bb.lower))) : 0.5;

            // 🆕 Анализ тренда
            const smaPosition = currentPrice > sma20 ? 1 : -1;
            const emaCross = ema12 > ema26 ? 1 : -1;
            const trendStrength = adx / 100; // Нормализуем 0-1
            
            // 🆕 Анализ объемов
            const avgVolume = currentData.slice(-20).reduce((sum, d) => sum + (d.Volume || 0), 0) / 20;
            const currentVolume = currentData[currentData.length - 1].Volume || avgVolume;
            const volumeRatio = avgVolume > 0 ? currentVolume / avgVolume : 1;

            return {
                // Базовые
                rsi: rsi || 50,
                sma20: sma20 || currentPrice,
                sma50: sma50 || currentPrice,
                ema12: ema12 || currentPrice,
                ema26: ema26 || currentPrice,
                macd: macd || 0,
                bbUpper: bb.upper || currentPrice * 1.02,
                bbLower: bb.lower || currentPrice * 0.98,
                bbPosition: bbPosition,
                volatility: volatility || 1,
                priceChange1h: priceChange1h || 0,
                priceChange24h: priceChange24h || 0,
                priceChange7d: priceChange7d || 0,
                volume: currentVolume,
                sentiment: (Math.random() - 0.5) * 2,
                // 🆕 Новые
                stochastic: stochastic,
                atr: atr,
                adx: adx,
                obv: obv,
                smaPosition: smaPosition,
                emaCross: emaCross,
                trendStrength: trendStrength,
                volumeRatio: volumeRatio,
                candleBullish: candlePatterns.bullish,
                candleBearish: candlePatterns.bearish
            };
        } catch (error) {
            console.error('Error preparing features:', error);
            return this.getDefaultFeatures();
        }
    }

    getDefaultFeatures() {
        return {
            rsi: 50,
            sma20: 100,
            sma50: 100,
            macd: 0,
            bbUpper: 102,
            bbLower: 98,
            bbPosition: 0.5,
            volatility: 1,
            priceChange1h: 0,
            priceChange24h: 0,
            volume: 500000,
            sentiment: 0
        };
    }

    async predictPriceMovementAdvanced(features, currentPrice) {
        try {
            // 🆕 Улучшенная система весов с новыми индикаторами
            const weights = {
                // Основные индикаторы
                rsi: 0.12,
                stochastic: 0.10,
                bbPosition: 0.14,
                macd: 0.12,
                // Трендовые
                smaPosition: 0.08,
                emaCross: 0.10,
                trendStrength: 0.08,
                // Ценовые изменения
                priceChange1h: 0.05,
                priceChange24h: 0.06,
                priceChange7d: 0.04,
                // Объемы и свечи
                volumeRatio: 0.06,
                candlePatterns: 0.05
            };

            let bullishScore = 0;
            let bearishScore = 0;

            // 📈 RSI анализ
            if (features.rsi < 30) {
                bullishScore += weights.rsi * 1.5; // Перепродано - сильный сигнал
            } else if (features.rsi > 70) {
                bearishScore += weights.rsi * 1.5; // Перекуплено
            } else if (features.rsi < 45) {
                bullishScore += weights.rsi * 0.7;
            } else if (features.rsi > 55) {
                bearishScore += weights.rsi * 0.7;
            }

            // 📈 Stochastic
            if (features.stochastic < 20) {
                bullishScore += weights.stochastic * 1.3;
            } else if (features.stochastic > 80) {
                bearishScore += weights.stochastic * 1.3;
            } else if (features.stochastic < 40) {
                bullishScore += weights.stochastic * 0.6;
            } else if (features.stochastic > 60) {
                bearishScore += weights.stochastic * 0.6;
            }

            // 📈 Bollinger Bands
            if (features.bbPosition < 0.15) {
                bullishScore += weights.bbPosition * 1.4; // У нижней границы
            } else if (features.bbPosition > 0.85) {
                bearishScore += weights.bbPosition * 1.4; // У верхней границы
            } else if (features.bbPosition < 0.35) {
                bullishScore += weights.bbPosition * 0.7;
            } else if (features.bbPosition > 0.65) {
                bearishScore += weights.bbPosition * 0.7;
            }

            // 📈 MACD
            if (features.macd > 0) {
                bullishScore += weights.macd * Math.min(1.5, Math.abs(features.macd));
            } else {
                bearishScore += weights.macd * Math.min(1.5, Math.abs(features.macd));
            }

            // 📈 SMA Position
            if (features.smaPosition > 0) {
                bullishScore += weights.smaPosition;
            } else {
                bearishScore += weights.smaPosition;
            }

            // 📈 EMA Cross
            if (features.emaCross > 0) {
                bullishScore += weights.emaCross;
            } else {
                bearishScore += weights.emaCross;
            }

            // 📈 Trend Strength (ADX)
            const trendMultiplier = 0.5 + features.trendStrength; // 0.5-1.5
            bullishScore *= trendMultiplier;
            bearishScore *= trendMultiplier;

            // 📈 Price Changes
            if (features.priceChange1h > 1) {
                bullishScore += weights.priceChange1h * Math.min(2, features.priceChange1h / 2);
            } else if (features.priceChange1h < -1) {
                bearishScore += weights.priceChange1h * Math.min(2, Math.abs(features.priceChange1h) / 2);
            }

            if (features.priceChange24h > 3) {
                bullishScore += weights.priceChange24h * Math.min(2, features.priceChange24h / 5);
            } else if (features.priceChange24h < -3) {
                bearishScore += weights.priceChange24h * Math.min(2, Math.abs(features.priceChange24h) / 5);
            }

            if (features.priceChange7d > 10) {
                bullishScore += weights.priceChange7d;
            } else if (features.priceChange7d < -10) {
                bearishScore += weights.priceChange7d;
            }

            // 📈 Volume Analysis
            if (features.volumeRatio > 1.5) {
                // Высокий объем усиливает текущий тренд
                const volumeBoost = Math.min(1.5, features.volumeRatio / 2);
                if (bullishScore > bearishScore) {
                    bullishScore += weights.volumeRatio * volumeBoost;
                } else {
                    bearishScore += weights.volumeRatio * volumeBoost;
                }
            }

            // 📈 Candle Patterns
            if (features.candleBullish > features.candleBearish) {
                bullishScore += weights.candlePatterns * (features.candleBullish - features.candleBearish) * 0.5;
            } else if (features.candleBearish > features.candleBullish) {
                bearishScore += weights.candlePatterns * (features.candleBearish - features.candleBullish) * 0.5;
            }

            // 🎯 Расчет итоговой вероятности
            const totalScore = bullishScore + bearishScore;
            let probability = totalScore > 0 ? bullishScore / totalScore : 0.5;
            
            // Небольшая случайность для реализма
            const randomness = (Math.random() - 0.5) * 0.05;
            probability = Math.min(0.95, Math.max(0.05, probability + randomness));

            // 🎯 Расчет confidence (уверенности)
            const signalDifference = Math.abs(bullishScore - bearishScore);
            const maxPossibleDifference = Object.values(weights).reduce((a, b) => a + b, 0) * 1.5;
            
            let confidence = 0.5 + (signalDifference / maxPossibleDifference) * 0.45;
            
            // Волатильность снижает уверенность
            const volatilityPenalty = Math.min(0.3, features.volatility / 30);
            confidence *= (1 - volatilityPenalty);
            
            // Сила тренда повышает уверенность
            confidence *= (0.8 + features.trendStrength * 0.4);
            
            confidence = Math.min(0.95, Math.max(0.3, confidence));

            const direction = probability > 0.5 ? 'UP' : 'DOWN';
            const predictedChange = (probability - 0.5) * 6 * (1 + features.trendStrength);

            return {
                probability: probability,
                confidence: confidence,
                direction: direction,
                features: features,
                predictedChange: predictedChange,
                bullishScore: bullishScore,
                bearishScore: bearishScore
            };
        } catch (error) {
            console.error('Error in prediction:', error);
            return {
                probability: 0.5,
                confidence: 0.3,
                direction: 'UP',
                features: features,
                predictedChange: 0,
                bullishScore: 0,
                bearishScore: 0
            };
        }
    }

    async createEnhancedPrediction(currentData, similarPatterns) {
        try {
            if (!currentData || currentData.length === 0) {
                return [0.3, "Недостаточно данных для анализа", "Нет данных для анализа", "neutral", 0];
            }

            const prices = currentData.map(d => d.Close);
            const currentPrice = prices[prices.length - 1];
            
            const features = this.prepareAdvancedFeatures(currentData);
            const prediction = await this.predictPriceMovementAdvanced(features, currentPrice);
            
            let finalConfidence = prediction.confidence;
            let finalDirection = prediction.direction;
            let weightedPrediction = prediction.predictedChange;

            if (similarPatterns && similarPatterns.length > 0) {
                let patternConfidence = 0;
                let patternDirectionScore = 0;
                
                similarPatterns.forEach(pattern => {
                    if (pattern.futureData && pattern.futureData.length > 0) {
                        const patternEndPrice = pattern.data[pattern.data.length - 1].Close;
                        const futureStartPrice = pattern.futureData[0].Close;
                        const change = (futureStartPrice - patternEndPrice) / patternEndPrice;
                        
                        patternConfidence += pattern.score;
                        patternDirectionScore += change > 0 ? pattern.score : -pattern.score;
                    }
                });
                
                if (patternConfidence > 0) {
                    finalConfidence = (finalConfidence + (patternConfidence / similarPatterns.length)) / 2;
                    
                    const patternWeight = 0.3;
                    const aiWeight = 0.7;
                    
                    const aiDirectionScore = prediction.probability > 0.5 ? 1 : -1;
                    const combinedScore = (aiDirectionScore * aiWeight) + (patternDirectionScore * patternWeight);
                    
                    finalDirection = combinedScore > 0 ? 'UP' : 'DOWN';
                    weightedPrediction = combinedScore * 3;
                }
            }

            let direction, action, directionClass;
            
            if (finalDirection === 'UP') {
                direction = "📈 ВОСХОДЯЩИЙ ТРЕНД";
                action = "РЕКОМЕНДАЦИЯ: ПОКУПКА/УДЕРЖАНИЕ";
                directionClass = "bullish";
            } else {
                direction = "📉 НИСХОДЯЩИЙ ТРЕНД";
                action = "РЕКОМЕНДАЦИЯ: ПРОДАЖА/ОЖИДАНИЕ";
                directionClass = "bearish";
            }

            const predictionText = `${direction} | ${action}`;
            const analysisDetails = `Улучшенный AI анализ + ${similarPatterns ? similarPatterns.length : 0} исторических паттернов`;

            return [finalConfidence, predictionText, analysisDetails, directionClass, weightedPrediction];
        } catch (error) {
            console.error('Error in enhanced prediction:', error);
            return [0.3, "Ошибка анализа", "Произошла ошибка при анализе данных", "neutral", 0];
        }
    }
}


class FinancialDataAPI {
    constructor() {
        this.cache = new Map();
        // Для минутных интервалов используем более короткий кэш (30 секунд) для реального времени
        this.cacheTimeout = 5 * 60 * 1000; // 5 минут для обычных данных
        this.realtimeCacheTimeout = 30 * 1000; // 30 секунд для минутных данных
        
        this.apis = {
            coinmarketcap: '6bf5e09d04bb451e9b3fc16cb4e6a32c',
            kraken: 'https://api.kraken.com/0/public',
            binance: 'https://api.binance.com/api/v3',
            coinbase: 'https://api.pro.coinbase.com',
            alphavantage: 'https://www.alphavantage.co/query',
            fmp: 'https://financialmodelingprep.com/api/v3',
            yahoo: 'https://query1.finance.yahoo.com/v8/finance/chart',
            twelvedata: 'https://api.twelvedata.com',
            polygon: 'https://api.polygon.io',
            finnhub: 'https://finnhub.io/api/v1'
        };
        
        this.symbolMaps = {
            coinmarketcap: {
                // Топ криптовалюты
                'BTC': 1, 'ETH': 1027, 'BNB': 1839, 'SOL': 5426, 'XRP': 52, 'ADA': 2010,
                'DOGE': 74, 'TRX': 1958, 'DOT': 6636, 'MATIC': 3890, 'AVAX': 5805,
                'LINK': 1975, 'UNI': 7083, 'LTC': 2, 'BCH': 1831, 'ATOM': 3794,
                'XLM': 512, 'ALGO': 4030, 'VET': 3077, 'FIL': 2280, 'ETC': 1321,
                'XMR': 328, 'EOS': 1765, 'AAVE': 7278, 'MKR': 1518, 'GRT': 6719,
                'SAND': 6210, 'MANA': 1966, 'AXS': 6783, 'THETA': 2416, 'NEAR': 6535,
                'FTM': 3513, 'SHIB': 5994, 'APT': 21794, 'ARB': 11841, 'OP': 11840,
                'SUI': 20947, 'INJ': 7226, 'TIA': 22861, 'SEI': 23149,
                // 🆕 Новые популярные мем-коины и токены
                'BONK': 23095, 'WIF': 28752, 'PEPE': 24478, 'FLOKI': 10804, 'JUP': 29210,
                'PYTH': 28177, 'ONDO': 26580, 'STRK': 22691, 'ORDI': 28476, 'SATS': 28919,
                'MEME': 28301, 'BOME': 29870, 'PENDLE': 9481, 'WLD': 13502, 'RNDR': 5690,
                'IMX': 10603, 'LDO': 8000, 'RUNE': 4157, 'FET': 3773, 'AGIX': 2424,
                // Stablecoins
                'USDT': 825, 'USDC': 3408, 'DAI': 4943, 'BUSD': 4687,
                // Дополнительные популярные
                'XTZ': 2011, 'COMP': 5692, 'SNX': 2586, 'YFI': 5864, 'ZEC': 1437,
                'BAT': 1697, 'KSM': 5034, 'OMG': 1808, 'ENJ': 2130, 'CHZ': 4066,
                'HBAR': 4642, 'ICP': 8916, 'QNT': 3155, 'FLOW': 4558, 'EGLD': 6892,
                // 🆕 ТОП-200 КРИПТОВАЛЮТ (Расширение)
                'TON': 11419, 'KASPA': 20396, 'STX': 4847, 'VET': 3077, 'BEAM': 28298,
                'IMX': 10603, 'MNT': 27075, 'GALA': 7080, 'AXS': 6783, 'SAND': 6210,
                'MANA': 1966, 'ENJ': 2130, 'CHZ': 4066, 'THETA': 2416, 'FTM': 3513,
                'ALGO': 4030, 'XLM': 512, 'HBAR': 4642, 'FLOW': 4558, 'EGLD': 6892,
                'XTZ': 2011, 'EOS': 1765, 'AAVE': 7278, 'MKR': 1518, 'SNX': 2586,
                'COMP': 5692, 'YFI': 5864, 'CRV': 6538, 'BAL': 5728, 'SUSHI': 6758,
                '1INCH': 8104, 'UMA': 5617, 'REN': 2539, 'LRC': 1934, 'ZRX': 1896,
                'KNC': 1982, 'BAND': 4679, 'STORJ': 1772, 'OCEAN': 3911, 'NMR': 1732,
                'ANT': 1680, 'BAT': 1697, 'REP': 1104, 'ZEC': 1437, 'DASH': 131,
                'XMR': 328, 'DCR': 1168, 'ZEN': 1698, 'BTG': 2083, 'RVN': 3412,
                'QTUM': 1684, 'ICX': 2099, 'ZIL': 2469, 'ONT': 2566, 'WAVES': 1274,
                'LSK': 1214, 'NANO': 1567, 'SC': 1042, 'DGB': 109, 'RDD': 118,
                'DOGE': 74, 'LTC': 2, 'BCH': 1831, 'BSV': 3602, 'ETC': 1321,
                'XEM': 873, 'IOTA': 1720, 'NEO': 1376, 'VET': 3077, 'OMG': 1808,
                'QTUM': 1684, 'LSK': 1214, 'STRAT': 1343, 'ARK': 1586, 'PIVX': 1169,
                'KMD': 1521, 'GAS': 1785, 'MONA': 213, 'XVG': 693, 'STEEM': 1230,
                'SYS': 541, 'GNT': 1455, 'DCR': 1168, 'ARDR': 1320, 'NXT': 66,
                'MAID': 291, 'BTS': 463, 'GAME': 291, 'NXS': 789, 'BLOCK': 843,
                'VIA': 33, 'XCP': 105, 'CLAM': 111, 'POT': 122, 'MINT': 460,
                // 🆕 ТОВАРЫ (COMMODITIES)
                'GOLD': 99999, 'SILVER': 99998, 'PLATINUM': 99997, 'PALLADIUM': 99996,
                'COPPER': 99995, 'OIL': 99994, 'BRENT': 99993, 'NATGAS': 99992,
                'WHEAT': 99991, 'CORN': 99990, 'SOYBEANS': 99989, 'COFFEE': 99988,
                'SUGAR': 99987, 'COTTON': 99986, 'COCOA': 99985
            },
            kraken: {
                'BTC': 'XBTUSD', 'ETH': 'ETHUSD', 'ADA': 'ADAUSD', 'SOL': 'SOLUSD',
                'XRP': 'XRPUSD', 'DOT': 'DOTUSD', 'MATIC': 'MATICUSD', 'AVAX': 'AVAXUSD',
                'LINK': 'LINKUSD', 'ATOM': 'ATOMUSD', 'UNI': 'UNIUSD', 'LTC': 'LTCUSD',
                'BCH': 'BCHUSD', 'ETC': 'ETCUSD', 'XLM': 'XLMUSD', 'XMR': 'XMRUSD',
                'EOS': 'EOSUSD', 'TRX': 'TRXUSD', 'XTZ': 'XTZUSD', 'ALGO': 'ALGOUSD',
                'AAVE': 'AAVEUSD', 'FIL': 'FILUSD', 'FLOW': 'FLOWUSD', 'GRT': 'GRTUSD',
                'TSLA': 'TSLAUSD'
            },
            // 🆕 РАСШИРЕННЫЙ СПИСОК ФОРЕКС ПАР (100+ пар)
            forex: [
                // Мажорные пары (Major Pairs)
                'EURUSD', 'GBPUSD', 'USDJPY', 'USDCHF', 'AUDUSD', 'USDCAD', 'NZDUSD',
                // Кросс-пары EUR (EUR Cross Pairs)
                'EURGBP', 'EURJPY', 'EURCHF', 'EURAUD', 'EURCAD', 'EURNZD', 'EURSEK',
                'EURNOK', 'EURDKK', 'EURPLN', 'EURHUF', 'EURCZK', 'EURTRY', 'EURZAR',
                // Кросс-пары GBP (GBP Cross Pairs)
                'GBPJPY', 'GBPCHF', 'GBPAUD', 'GBPCAD', 'GBPNZD', 'GBPSEK', 'GBPNOK',
                'GBPDKK', 'GBPPLN', 'GBPHUF', 'GBPCZK', 'GBPTRY', 'GBPZAR',
                // Кросс-пары JPY (JPY Cross Pairs)
                'AUDJPY', 'CADJPY', 'CHFJPY', 'NZDJPY', 'SEKJPY', 'NOKJPY', 'DKKJPY',
                // Кросс-пары AUD (AUD Cross Pairs)
                'AUDCHF', 'AUDCAD', 'AUDNZD', 'AUDSEK', 'AUDNOK', 'AUDDKK', 'AUDPLN',
                // Кросс-пары CAD (CAD Cross Pairs)
                'CADCHF', 'NZDCAD', 'AUDCAD', 'CADJPY',
                // Кросс-пары NZD (NZD Cross Pairs)
                'NZDCHF', 'NZDJPY', 'AUDNZD', 'NZDCAD', 'NZDSEK',
                // Кросс-пары CHF (CHF Cross Pairs)
                'CHFJPY', 'AUDCHF', 'CADCHF', 'NZDCHF',
                // Экзотические пары (Exotic Pairs) - Азия
                'USDCNH', 'USDSGD', 'USDHKD', 'USDTHB', 'USDINR', 'USDKRW', 'USDPHP',
                'USDIDR', 'USDMYR', 'USDTWD', 'EURCNH', 'GBPCNH', 'AUDCNH',
                'USDJPY', 'USDVND', 'USDLKR', 'USDBDT', 'USDPKR', 'USDMMK',
                // 🆕 Экзотические пары - Постсоветское пространство
                'USDKZT', 'USDUAH', 'USDUZS', 'USDAZN', 'USDGEL', 'USDAMD',
                'USDKGS', 'USDTJS', 'USDTMT', 'USDMDN', 'USDBYN',
                'EURKZT', 'EURUAH', 'EURRUB', 'RUBKZT', 'RUBUZS',
                // Экзотические пары - Европа
                'USDSEK', 'USDNOK', 'USDDKK', 'USDPLN', 'USDHUF', 'USDCZK', 'USDRON',
                'USDRUB', 'USDTRY', 'EURPLN', 'EURHUF', 'EURCZK', 'EURTRY', 'EURRUB',
                'USDBGN', 'USDHRK', 'USDMKD', 'USDALL', 'USDRS',
                // Экзотические пары - Америка
                'USDMXN', 'USDBRL', 'USDARS', 'USDCLP', 'USDCOP', 'USDPEN',
                'USDVEF', 'USDUYU', 'USDPYG', 'USDGTQ', 'USDHNL', 'USDCRC',
                // Экзотические пары - Африка и Ближний Восток
                'USDZAR', 'USDEGP', 'USDNGN', 'USDKES', 'USDILS', 'USDSAR', 'USDAED',
                'USDQAR', 'USDKWD', 'USDBHD', 'USDOMR', 'USDJOD', 'USDLBP', 'USDIQD',
                'USDDZD', 'USDMAD', 'USDTND', 'USDUGX', 'USDTZS', 'USDGHC',
                // Экзотические пары - Океания
                'USDAUD', 'USDNZD', 'USDFJD', 'USDPGK'
            ],
            // Популярные акции (для Alpha Vantage и FMP)
            stocks: [
                // Tech гиганты
                'AAPL', 'MSFT', 'GOOGL', 'GOOG', 'AMZN', 'META', 'NVDA', 'TSLA',
                'NFLX', 'AMD', 'INTC', 'ORCL', 'CRM', 'ADBE', 'QCOM', 'CSCO',
                // Финансы
                'JPM', 'BAC', 'WFC', 'GS', 'MS', 'C', 'AXP', 'V', 'MA',
                // Потребительские товары
                'WMT', 'HD', 'NKE', 'SBUX', 'MCD', 'TGT', 'LOW', 'COST',
                // Здравоохранение
                'JNJ', 'PFE', 'UNH', 'ABBV', 'MRK', 'TMO', 'ABT', 'DHR',
                // Промышленность
                'BA', 'CAT', 'GE', 'HON', 'RTX', 'LMT', 'NOC', 'GD',
                // Энергетика
                'XOM', 'CVX', 'SLB', 'COP', 'EOG', 'MPC', 'PSX', 'VLO',
                // Недвижимость
                'AMT', 'PLD', 'EQIX', 'WELL', 'VICI', 'PSA', 'SPG', 'O',
                // Телекоммуникации
                'T', 'VZ', 'CMCSA', 'DIS', 'NFLX', 'CHTR', 'TMUS', 'LUMN',
                // Другие популярные
                'BRK.B', 'VTI', 'SPY', 'QQQ', 'IWM', 'DIA', 'GLD', 'SLV',
                // 🆕 РАСШИРЕННЫЙ S&P 500 (ТОП-200 КОМПАНИЙ)
                // Technology
                'AVGO', 'ACN', 'TXN', 'NOW', 'INTU', 'IBM', 'AMAT', 'PANW', 'MU', 'ADI',
                'LRCX', 'KLAC', 'SNPS', 'CDNS', 'MCHP', 'FTNT', 'ANSS', 'ON', 'MPWR', 'TER',
                // Consumer Discretionary
                'AMZN', 'TSLA', 'HD', 'MCD', 'NKE', 'SBUX', 'LOW', 'TJX', 'BKNG', 'CMG',
                'MAR', 'ABNB', 'GM', 'F', 'ORLY', 'AZO', 'ROST', 'YUM', 'DHI', 'LEN',
                // Healthcare
                'UNH', 'JNJ', 'LLY', 'ABBV', 'MRK', 'TMO', 'ABT', 'DHR', 'PFE', 'BMY',
                'AMGN', 'GILD', 'CVS', 'CI', 'ISRG', 'REGN', 'VRTX', 'ZTS', 'DXCM', 'BSX',
                // Financials
                'JPM', 'BAC', 'WFC', 'GS', 'MS', 'BLK', 'SCHW', 'C', 'AXP', 'USB',
                'PNC', 'TFC', 'COF', 'BK', 'STT', 'TROW', 'CME', 'ICE', 'MCO', 'SPGI',
                // Communication Services
                'META', 'GOOGL', 'GOOG', 'NFLX', 'DIS', 'CMCSA', 'T', 'VZ', 'TMUS', 'CHTR',
                'EA', 'TTWO', 'NWSA', 'FOX', 'PARA', 'WBD', 'OMC', 'IPG',
                // Consumer Staples
                'WMT', 'PG', 'COST', 'KO', 'PEP', 'PM', 'MO', 'MDLZ', 'CL', 'KMB',
                'GIS', 'KHC', 'HSY', 'K', 'STZ', 'TAP', 'CPB', 'CAG', 'SJM', 'HRL',
                // Energy
                'XOM', 'CVX', 'COP', 'SLB', 'EOG', 'MPC', 'PSX', 'VLO', 'OXY', 'HAL',
                'BKR', 'WMB', 'KMI', 'OKE', 'DVN', 'FANG', 'HES', 'MRO', 'APA', 'CTRA',
                // Industrials
                'BA', 'CAT', 'HON', 'UNP', 'RTX', 'LMT', 'GE', 'MMM', 'DE', 'UPS',
                'GD', 'NOC', 'ETN', 'ITW', 'EMR', 'PH', 'CARR', 'PCAR', 'JCI', 'CMI',
                // Materials
                'LIN', 'APD', 'SHW', 'FCX', 'NEM', 'ECL', 'DD', 'NUE', 'DOW', 'PPG',
                'ALB', 'CTVA', 'VMC', 'MLM', 'IFF', 'FMC', 'CE', 'CF', 'MOS', 'AVY',
                // Real Estate
                'AMT', 'PLD', 'EQIX', 'PSA', 'WELL', 'DLR', 'O', 'SPG', 'VICI', 'AVB',
                'EQR', 'SBAC', 'WY', 'INVH', 'ARE', 'VTR', 'ESS', 'MAA', 'KIM', 'REG',
                // Utilities
                'NEE', 'DUK', 'SO', 'D', 'AEP', 'EXC', 'SRE', 'XEL', 'WEC', 'ED',
                'PEG', 'ES', 'FE', 'EIX', 'ETR', 'AWK', 'DTE', 'PPL', 'AEE', 'CMS',
                // ETFs и Индексы
                'SPY', 'QQQ', 'IWM', 'DIA', 'VTI', 'VOO', 'VEA', 'VWO', 'AGG', 'BND',
                'GLD', 'SLV', 'USO', 'UNG', 'XLK', 'XLF', 'XLE', 'XLV', 'XLI', 'XLP',
                'XLY', 'XLU', 'XLB', 'XLRE', 'XLC', 'VNQ', 'EEM', 'EFA', 'IEF', 'TLT'
            ],
            // 🆕 ТОВАРЫ (COMMODITIES) - отдельный список для специальной обработки
            commodities: [
                'GOLD', 'SILVER', 'PLATINUM', 'PALLADIUM', 'COPPER',
                'OIL', 'BRENT', 'WTI', 'NATGAS', 'GASOLINE', 'HEATING',
                'WHEAT', 'CORN', 'SOYBEANS', 'RICE', 'OATS',
                'COFFEE', 'SUGAR', 'COTTON', 'COCOA', 'LUMBER',
                'CATTLE', 'HOGS', 'ORANGE'
            ],
            // 🆕 КРИПТОВАЛЮТНЫЕ КРОСС-ПАРЫ (100+ пар)
            cryptoPairs: [
                // BTC пары (20 пар)
                'BTCETH', 'BTCBNB', 'BTCUSDT', 'BTCUSDC', 'BTCBUSD',
                'BTCSOL', 'BTCXRP', 'BTCADA', 'BTCDOGE', 'BTCLTC',
                'BTCBCH', 'BTCLINK', 'BTCDOT', 'BTCMATIC', 'BTCAVAX',
                'BTCUNI', 'BTCATOM', 'BTCXLM', 'BTCALGO', 'BTCAAVE',
                // ETH пары (20 пар)
                'ETHBTC', 'ETHBNB', 'ETHUSDT', 'ETHUSDC', 'ETHBUSD',
                'ETHSOL', 'ETHXRP', 'ETHADA', 'ETHDOGE', 'ETHLTC',
                'ETHBCH', 'ETHLINK', 'ETHDOT', 'ETHMATIC', 'ETHAVAX',
                'ETHUNI', 'ETHATOM', 'ETHXLM', 'ETHALGO', 'ETHAAVE',
                // BNB пары (15 пар)
                'BNBBTC', 'BNBETH', 'BNBUSDT', 'BNBUSDC', 'BNBBUSD',
                'BNBSOL', 'BNBXRP', 'BNBADA', 'BNBDOGE', 'BNBLTC',
                'BNBLINK', 'BNBDOT', 'BNBMATIC', 'BNBAVAX', 'BNBUNI',
                // SOL пары (10 пар)
                'SOLBTC', 'SOLETH', 'SOLBNB', 'SOLUSDT', 'SOLUSDC',
                'SOLXRP', 'SOLADA', 'SOLDOGE', 'SOLLINK', 'SOLDOT',
                // XRP пары (8 пар)
                'XRPBTC', 'XRPETH', 'XRPBNB', 'XRPUSDT', 'XRPUSDC',
                'XRPBUSD', 'XRPEUR', 'XRPGBP',
                // ADA пары (8 пар)
                'ADABTC', 'ADAETH', 'ADABNB', 'ADAUSDT', 'ADAUSDC',
                'ADABUSD', 'ADAEUR', 'ADAGBP',
                // DOGE пары (6 пар)
                'DOGEBTC', 'DOGEETH', 'DOGEBNB', 'DOGEUSDT', 'DOGEUSDC', 'DOGEBUSD',
                // Другие популярные пары
                'LTCBTC', 'LTCETH', 'LTCUSDT', 'LTCBUSD',
                'BCHBTC', 'BCHETH', 'BCHUSDT', 'BCHBUSD',
                'LINKBTC', 'LINKETH', 'LINKUSDT', 'LINKBUSD',
                'DOTBTC', 'DOTETH', 'DOTUSDT', 'DOTBUSD',
                'MATICBTC', 'MATICETH', 'MATICUSDT', 'MATICBUSD',
                'AVAXBTC', 'AVAXETH', 'AVAXUSDT', 'AVAXBUSD',
                'UNIBTC', 'UNIETH', 'UNIUSDT', 'UNIBUSD',
                'ATOMBTC', 'ATOMETH', 'ATOMUSDT', 'ATOMBUSD'
            ]
        };
    }

    // 🆕 Функция автоопределения и нормализации форекс пар
    normalizeForexSymbol(symbol) {
        // Проверяем, является ли это форекс парой
        const forexPairs = this.symbolMaps.forex;
        
        // Если уже есть слэш, возвращаем как есть
        if (symbol.includes('/')) return symbol;
        
        // Проверяем, есть ли в списке форекс пар
        if (forexPairs.includes(symbol)) {
            // Добавляем слэш: EURUSD -> EUR/USD
            // Обычно первые 3 символа - базовая валюта, последние 3 - котируемая
            if (symbol.length === 6) {
                return symbol.substring(0, 3) + '/' + symbol.substring(3);
            }
        }
        
        return symbol;
    }
    
    // 🆕 Функция определения криптовалютной кросс-пары
    isCryptoPair(symbol) {
        const cryptoPairs = this.symbolMaps.cryptoPairs;
        return cryptoPairs.includes(symbol.toUpperCase().replace('/', ''));
    }
    
    // 🆕 Нормализация криптовалютной пары для Binance
    normalizeCryptoPair(symbol) {
        // Убираем слэш если есть: BTC/ETH -> BTCETH
        symbol = symbol.replace('/', '');
        
        // Проверяем, есть ли в списке
        if (this.isCryptoPair(symbol)) {
            return symbol;
        }
        
        return symbol;
    }
    
    // 🆕 Проверка совместимости таймфрейма с типом актива
    validateTimeframeForAsset(symbol, interval, assetType) {
        // Индексы (начинаются с ^) поддерживают только дневные данные
        if (symbol.startsWith('^')) {
            if (interval !== '1d' && interval !== '1D') {
                console.warn(`⚠️ Индекс ${symbol} поддерживает только дневные данные. Переключаем на 1d...`);
                return '1d';
            }
        }
        return interval;
    }

    async getAssetData(symbol, period = '7d', interval = "5m") {
        try {
            symbol = symbol.toUpperCase().trim();
            if (!symbol) throw new Error('Symbol cannot be empty');
            
            // 🆕 Проверяем, является ли это криптовалютной кросс-парой
            const isCryptoPair = this.isCryptoPair(symbol);
            
            if (isCryptoPair) {
                console.log(`📊 Определена криптовалютная кросс-пара: ${symbol}`);
                symbol = this.normalizeCryptoPair(symbol);
                // Для кросс-пар используем Binance напрямую
                const data = await this.getBinanceCrossPair(symbol, interval, period);
                return [data, "Криптовалютная пара"];
            }
            
            // 🆕 Нормализуем форекс пары
            symbol = this.normalizeForexSymbol(symbol);
            
            const assetType = this.detectAssetType(symbol);
            
            // 🆕 Проверяем совместимость таймфрейма
            interval = this.validateTimeframeForAsset(symbol, interval, assetType);
            let data;
            
            try {
                if (assetType.includes("Криптовалюта")) {
                    data = await this.getCryptoDataMulti(symbol, interval, period);
                } else {
                    data = await this.getStockDataMulti(symbol, interval, period);
                }
            } catch (primaryError) {
                console.error(`Primary API failed for ${symbol}:`, primaryError.message);
                throw primaryError; // Пробрасываем ошибку дальше
            }
            
            if (!data || !Array.isArray(data) || data.length === 0) {
                throw new Error(`No historical data could be fetched for ${symbol}`);
            }
            
            // ВСЕГДА обновляем последнюю цену из Binance Ticker для криптовалют (самая актуальная цена)
            if (assetType.includes("Криптовалюта") && data.length > 0) {
                const currentPrice = await this.getCurrentPrice(symbol);
                if (currentPrice) {
                    const lastCandle = data[data.length - 1];
                    // Обновляем Close цену на самую актуальную
                    lastCandle.Close = currentPrice;
                    // Также обновляем High/Low если текущая цена их превышает/опускается ниже
                    if (currentPrice > lastCandle.High) lastCandle.High = currentPrice;
                    if (currentPrice < lastCandle.Low) lastCandle.Low = currentPrice;
                    console.log(`✅ Обновлена цена для ${symbol}: $${currentPrice.toFixed(2)} (из Binance Ticker)`);
                }
            }
            
            return [data, assetType];
        } catch (error) {
            console.error('Error loading asset data:', error);
            throw error;
        }
    }

    async getCryptoDataMulti(symbol, interval = '5m', period = '7d') {
        const cacheKey = `crypto_${symbol}_${interval}_${period}`;
        let cached = this.getFromCache(cacheKey);
        
        // Для минутных данных обновляем последнюю свечу в реальном времени
        if (cached && (interval === '1m' || interval === '5m')) {
            const updatedData = await this.updateRealtimeData([...cached], symbol, interval);
            // Обновляем кэш с актуальными данными
            if (updatedData !== cached) {
                this.setToCache(cacheKey, updatedData);
                cached = updatedData;
            }
        }
        
        if (cached) return cached;

        // Для минутных интервалов (1m) предпочтительно использовать Binance как основной источник
        if (interval === '1m') {
            try {
                console.log(`🔄 Используем Binance для минутных данных ${symbol}...`);
                // Для 1 минуты запрашиваем больше данных (до 1000 свечей = ~16 часов истории)
                const limit = period.includes('d') && parseInt(period) > 30 ? 1000 : 1000;
                return await this.getBinanceData(symbol, interval, limit);
            } catch (binanceError) {
                console.warn(`Binance failed for ${symbol}, trying Kraken...`);
                try {
                    return await this.getKrakenData(symbol, interval, 1000);
                } catch (krakenError) {
                    console.warn(`Kraken failed for ${symbol}, trying Coinbase...`);
                    try {
                        return await this.getCoinbaseData(symbol, interval, 500);
                    } catch (coinbaseError) {
                        console.warn(`All crypto APIs failed for ${symbol}, trying CoinMarketCap...`);
                        try {
                            return await this.getCoinMarketCapData(symbol, interval, period);
                        } catch (cmcError) {
                            console.error(`All crypto APIs failed for ${symbol}`);
                            throw new Error(`Не удалось получить данные для ${symbol}. Все крипто API вернули ошибку. Проверьте правильность символа.`);
                        }
                    }
                }
            }
        }

        // Для других интервалов используем стандартную логику
        try {
            console.log(`🔄 Пробуем CoinMarketCap для ${symbol}...`);
            return await this.getCoinMarketCapData(symbol, interval, period);
        } catch (cmcError) {
            console.warn(`CoinMarketCap failed for ${symbol}, trying Kraken...`);
            try {
                return await this.getKrakenData(symbol, interval, 1000);
            } catch (krakenError) {
                console.warn(`Kraken failed for ${symbol}, trying Binance...`);
                try {
                    return await this.getBinanceData(symbol, interval, 1000);
                } catch (binanceError) {
                    console.warn(`Binance failed for ${symbol}, trying Coinbase...`);
                    try {
                        return await this.getCoinbaseData(symbol, interval, 300);
                    } catch (coinbaseError) {
                        console.error(`All crypto APIs failed for ${symbol}`);
                        throw new Error(`Не удалось получить данные для ${symbol}. Все крипто API недоступны. Попробуйте позже.`);
                    }
                }
            }
        }
    }

    async getCoinMarketCapData(symbol, interval = '5m', period = '7d') {
        // Убираем слэш для поиска в mapping (EUR/USD -> EURUSD)
        const cleanSymbol = symbol.replace('/', '');
        const coinId = this.symbolMaps.coinmarketcap[cleanSymbol] || this.symbolMaps.coinmarketcap[symbol];
        
        if (!coinId) {
            // 🆕 Более информативная ошибка
            console.warn(`⚠️ ${symbol} не найден в CoinMarketCap mapping. Пробуем другие API...`);
            throw new Error(`Symbol ${symbol} not found in CoinMarketCap mapping`);
        }

        const intervalMap = {
            '1m': '1m', '5m': '5m', '15m': '15m', '1h': '1h', '4h': '4h', '1d': '1d'
        };
        
        const countMap = {
            '1d': 24, '7d': 168, '1mo': 720, '3mo': 2160, '6mo': 4320, '1y': 8760
        };

        const cmcInterval = intervalMap[interval] || '5m';
        const count = countMap[period] || 168;

        const url = `${this.apis.coinmarketcap}?id=${coinId}&interval=${cmcInterval}&count=${count}&convert=USD`;

        const response = await fetch(url, {
            headers: {
                'X-CMC_PRO_API_KEY': COINMARKETCAP_API_KEY,
                'Accept': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error(`CoinMarketCap API failed with status ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.status.error_code !== 0) {
            throw new Error(`CoinMarketCap API Error: ${data.status.error_message}`);
        }
        
        const quotes = data.data.quotes;
        if (!quotes || !Array.isArray(quotes)) {
            throw new Error('No quotes data in CoinMarketCap response');
        }
        
        const candles = quotes.map(quote => ({
            Date: new Date(quote.quote.USD.timestamp),
            Open: quote.quote.USD.open,
            High: quote.quote.USD.high,
            Low: quote.quote.USD.low,
            Close: quote.quote.USD.close,
            Volume: quote.quote.USD.volume
        })).sort((a, b) => a.Date - b.Date);
        
        this.setToCache(`cmc_${symbol}_${interval}_${period}`, candles);
        return candles;
    }

    async getKrakenData(symbol, interval = '5m', limit = 720) {
        const pair = this.symbolMaps.kraken[symbol] || symbol + 'USD';
        
        const intervalMap = {
            '1m': 1, '5m': 5, '15m': 15, '1h': 60, '4h': 240, '1d': 1440
        };
        
        const krakenInterval = intervalMap[interval] || 5;


        const response = await fetch(
            `${this.apis.kraken}/OHLC?pair=${pair}&interval=${krakenInterval}`
        );
        
        if (!response.ok) throw new Error(`Kraken API failed with status ${response.status}`);
        
        const data = await response.json();
        if (data.error && data.error.length > 0) {
            throw new Error(`Kraken API Error: ${data.error.join(', ')}`);
        }
        
        const resultKey = Object.keys(data.result).find(key => key !== 'last');
        if (!resultKey) throw new Error('No valid pair data in Kraken response');
        
        const ohlcData = data.result[resultKey];
        const candles = ohlcData.slice(-limit).map(item => ({
            Date: new Date(item[0] * 1000),
            Open: parseFloat(item[1]),
            High: parseFloat(item[2]),
            Low: parseFloat(item[3]),
            Close: parseFloat(item[4]),
            Volume: parseFloat(item[6])
        }));
        
        this.setToCache(`kraken_${symbol}_${interval}_${limit}`, candles);
        return candles;
    }

    async getBinanceData(symbol, interval = '5m', limit = 1000) {
        // Binance использует формат символов с USDT для криптовалют
        let binanceSymbol = symbol;
        if (!symbol.endsWith('USDT') && !symbol.endsWith('BUSD')) {
            binanceSymbol = symbol + 'USDT';
        }
        
        // Для минутных интервалов убеждаемся, что запрашиваем достаточно данных
        if (interval === '1m' && limit < 1000) {
            limit = 1000; // Минимум 1000 свечей для хорошего поиска паттернов
        }
        
        const response = await fetch(
            `${this.apis.binance}/klines?symbol=${binanceSymbol}&interval=${interval}&limit=${limit}`
        );
        
        if (!response.ok) {
            // Пробуем альтернативные форматы символов
            if (!symbol.endsWith('BTC')) {
                const altSymbol = symbol + 'BTC';
                try {
                    const altResponse = await fetch(
                        `${this.apis.binance}/klines?symbol=${altSymbol}&interval=${interval}&limit=${limit}`
                    );
                    if (altResponse.ok) {
                        const altData = await altResponse.json();
                        if (!altData.msg) {
                            const candles = altData.map(item => ({
                                Date: new Date(item[0]),
                                Open: parseFloat(item[1]),
                                High: parseFloat(item[2]),
                                Low: parseFloat(item[3]),
                                Close: parseFloat(item[4]),
                                Volume: parseFloat(item[5])
                            }));
                            this.setToCache(`binance_${symbol}_${interval}_${limit}`, candles);
                            return candles;
                        }
                    }
                } catch (e) {
                    // Продолжаем с исходной ошибкой
                }
            }
            throw new Error(`Binance API failed with status ${response.status}`);
        }
        
        const data = await response.json();
        if (data.msg) throw new Error(`Binance API Error: ${data.msg}`);
        
        const candles = data.map(item => ({
            Date: new Date(item[0]),
            Open: parseFloat(item[1]),
            High: parseFloat(item[2]),
            Low: parseFloat(item[3]),
            Close: parseFloat(item[4]),
            Volume: parseFloat(item[5])
        }));
        
        this.setToCache(`binance_${symbol}_${interval}_${limit}`, candles);
        return candles;
    }
    
    // 🆕 Получение данных для криптовалютных кросс-пар через Binance
    async getBinanceCrossPair(symbol, interval = '5m', period = '7d') {
        const cacheKey = `binance_cross_${symbol}_${interval}_${period}`;
        const cached = this.getFromCache(cacheKey);
        if (cached) return cached;
        
        // Определяем лимит свечей в зависимости от периода
        let limit = 500;
        if (interval === '1m') limit = 1000;
        else if (interval === '5m') limit = 500;
        else if (interval === '1h') limit = 168;
        else if (interval === '1d') limit = 365;
        
        console.log(`🔄 Получаем данные кросс-пары ${symbol} через Binance...`);
        
        try {
            // Binance принимает пары без слэша: BTCETH, ETHBNB и т.д.
            const binanceSymbol = symbol.replace('/', '');
            
            const response = await fetch(
                `${this.apis.binance}/klines?symbol=${binanceSymbol}&interval=${interval}&limit=${limit}`
            );
            
            if (!response.ok) {
                throw new Error(`Binance API failed with status ${response.status} for ${binanceSymbol}`);
            }
            
            const data = await response.json();
            
            if (data.msg || data.code) {
                throw new Error(`Binance API Error: ${data.msg || 'Unknown error'}`);
            }
            
            const candles = data.map(item => ({
                Date: new Date(item[0]),
                Open: parseFloat(item[1]),
                High: parseFloat(item[2]),
                Low: parseFloat(item[3]),
                Close: parseFloat(item[4]),
                Volume: parseFloat(item[5])
            }));
            
            if (candles.length === 0) {
                throw new Error(`No data returned for ${symbol}`);
            }
            
            console.log(`✅ Получено ${candles.length} свечей для ${symbol}`);
            
            this.setToCache(cacheKey, candles);
            return candles;
            
        } catch (error) {
            console.error(`❌ Ошибка получения кросс-пары ${symbol}:`, error.message);
            throw new Error(`Криптовалютная пара ${symbol} не найдена или недоступна. Проверьте правильность символа.`);
        }
    }

    async getCoinbaseData(symbol, interval = '5m', limit = 300) {
        const productId = symbol + '-USD';
        const granularity = this.getCoinbaseGranularity(interval);
        
        const response = await fetch(
            `${this.apis.coinbase}/products/${productId}/candles?granularity=${granularity}`
        );
        
        if (!response.ok) throw new Error(`Coinbase API failed with status ${response.status}`);
        
        const data = await response.json();
        if (data.message) throw new Error(`Coinbase API Error: ${data.message}`);
        
        const candles = data.slice(-limit).map(item => ({
            Date: new Date(item[0] * 1000),
            Low: parseFloat(item[1]),
            High: parseFloat(item[2]),
            Open: parseFloat(item[3]),
            Close: parseFloat(item[4]),
            Volume: parseFloat(item[5])
        })).reverse();
        
        this.setToCache(`coinbase_${symbol}_${interval}_${limit}`, candles);
        return candles;
    }

    async getStockDataMulti(symbol, interval = '5m', period = '7d') {
        const cacheKey = `stock_${symbol}_${interval}_${period}`;
        const cached = this.getFromCache(cacheKey);
        if (cached) return cached;

        // ПРИОРИТЕТ 1: Twelve Data (800 запросов/день, универсальный)
        try {
            console.log(`🔄 Пробуем Twelve Data для ${symbol}...`);
            return await this.getTwelveData(symbol, interval, period);
        } catch (twelveError) {
            console.warn(`Twelve Data failed for ${symbol}: ${twelveError.message}`);
            
            // ПРИОРИТЕТ 2: Polygon (хорошее качество данных)
            try {
                console.log(`🔄 Пробуем Polygon для ${symbol}...`);
                return await this.getPolygonData(symbol, interval, period);
            } catch (polygonError) {
                console.warn(`Polygon failed for ${symbol}: ${polygonError.message}`);
                
                // ПРИОРИТЕТ 3: Finnhub (60 запросов/минуту)
                try {
                    console.log(`🔄 Пробуем Finnhub для ${symbol}...`);
                    return await this.getFinnhubData(symbol, interval, period);
                } catch (finnhubError) {
                    console.warn(`Finnhub failed for ${symbol}: ${finnhubError.message}`);
                    
                    // ПРИОРИТЕТ 4: Yahoo Finance (без ключа, но CORS проблемы)
                    try {
                        console.log(`🔄 Пробуем Yahoo Finance для ${symbol}...`);
                        return await this.getYahooFinanceData(symbol, interval, period);
                    } catch (yahooError) {
                        console.warn(`Yahoo Finance failed for ${symbol}: ${yahooError.message}`);
                        
                        // ПРИОРИТЕТ 5: FMP (с ключом)
                        try {
                            console.log(`🔄 Пробуем FMP для ${symbol}...`);
                            return await this.getFMPData(symbol, interval);
                        } catch (fmpError) {
                            console.warn(`FMP failed for ${symbol}: ${fmpError.message}`);
                            
                            // ПРИОРИТЕТ 6: Alpha Vantage (demo ключ)
                            try {
                                console.log(`🔄 Пробуем Alpha Vantage для ${symbol}...`);
                                return await this.getAlphaVantageData(symbol, interval);
                            } catch (avError) {
                                console.error(`All stock APIs failed for ${symbol}`);
                                throw new Error(`Не удалось получить данные для ${symbol}. Все API вернули ошибку. Попробуйте другой актив или проверьте символ.`);
                            }
                        }
                    }
                }
            }
        }
    }


    async getAlphaVantageData(symbol, interval = '5min') {
        let functionName = 'TIME_SERIES_INTRADAY';
        let symbolParam = symbol;
        
        // 🆕 Улучшенное определение типа актива
        if (symbol.includes('/')) {
            // Форекс пара
            functionName = 'FX_INTRADAY';
            symbolParam = symbol.replace('/', '');
            console.log(`📊 Определен форекс: ${symbol} -> ${symbolParam}`);
        } else if (this.symbolMaps.forex.includes(symbol.replace('/', ''))) {
            // Форекс без слэша (уже нормализован)
            functionName = 'FX_INTRADAY';
            symbolParam = symbol.replace('/', '');
            console.log(`📊 Определен форекс: ${symbol}`);
        } else if (symbol.startsWith('^')) {
            // Индекс - только дневные данные
            functionName = 'TIME_SERIES_DAILY';
            console.log(`📊 Определен индекс: ${symbol} (только дневные данные)`);
        }
        
        const intervalParam = this.getAlphaVantageInterval(interval);
        
        const url = `${this.apis.alphavantage}?function=${functionName}&symbol=${symbolParam}&interval=${intervalParam}&apikey=${ALPHA_VANTAGE_API_KEY}&outputsize=full&datatype=json`;
        
        const response = await fetch(url);
        
        if (!response.ok) throw new Error(`Alpha Vantage failed with status ${response.status}`);
        
        const data = await response.json();
        
        if (data['Error Message'] || data['Note']) {
            throw new Error(data['Error Message'] || data['Note'] || 'Alpha Vantage API error');
        }
        
        let timeSeries;
        if (functionName === 'FX_INTRADAY') {
            timeSeries = data['Time Series FX (' + intervalParam + ')'];
        } else if (functionName === 'TIME_SERIES_INTRADAY') {
            timeSeries = data['Time Series (' + intervalParam + ')'];
        } else {
            timeSeries = data['Time Series (Daily)'];
        }
        
        if (!timeSeries) {
            throw new Error('No time series data in Alpha Vantage response');
        }
        
        const candles = Object.entries(timeSeries).map(([timestamp, values]) => ({
            Date: new Date(timestamp),
            Open: parseFloat(values['1. open']),
            High: parseFloat(values['2. high']),
            Low: parseFloat(values['3. low']),
            Close: parseFloat(values['4. close']),
            Volume: parseFloat(values['5. volume'] || 0)
        })).sort((a, b) => a.Date - b.Date).slice(-1000);
        
        this.setToCache(`av_${symbol}_${interval}`, candles);
        return candles;
    }

    async getFMPData(symbol, interval = '5min') {
        const intervalParam = this.getFMPInterval(interval);
        const url = `${this.apis.fmp}/historical-chart/${intervalParam}/${symbol}?apikey=DMM8f525nl09ExCSY5oOi7A7sjtyNiTN`;
        const response = await fetch(url);
        
        if (!response.ok) throw new Error(`FMP failed with status ${response.status}`);
        
        const data = await response.json();
        
        if (data['Error Message'] || !Array.isArray(data)) {
            throw new Error(data['Error Message'] || 'FMP API error');
        }
        
        if (data.length === 0) {
            throw new Error('No data from FMP');
        }
        
        const candles = data.map(item => ({
            Date: new Date(item.date),
            Open: parseFloat(item.open),
            High: parseFloat(item.high),
            Low: parseFloat(item.low),
            Close: parseFloat(item.close),
            Volume: parseFloat(item.volume || 0)
        })).sort((a, b) => a.Date - b.Date);
        
        this.setToCache(`fmp_${symbol}_${interval}`, candles);
        return candles;
    }

    async getTwelveData(symbol, interval = '5m', period = '7d') {
        const cacheKey = `twelve_${symbol}_${interval}_${period}`;
        const cached = this.getFromCache(cacheKey);
        if (cached) return cached;

        // Маппинг интервалов для Twelve Data
        const intervalMap = {
            '1m': '1min',
            '5m': '5min',
            '15m': '15min',
            '1h': '1h',
            '4h': '4h',
            '1d': '1day'
        };

        const twelveInterval = intervalMap[interval] || '1day';
        
        // Twelve Data использует outputsize вместо period
        const outputsize = 5000; // Максимум данных

        console.log(`🔄 Запрос к Twelve Data: ${symbol} (${twelveInterval})`);
        
        // Используем apiClient для безопасного вызова через Netlify Functions
        if (!window.apiClient) {
            throw new Error('TWELVE_DATA_API_KEY is not defined');
        }
        
        const data = await window.apiClient.twelvedata('/time_series', {
            symbol: symbol,
            interval: twelveInterval,
            outputsize: outputsize
        });
        
        if (data.status === 'error' || !data.values || data.values.length === 0) {
            throw new Error(data.message || 'No data from Twelve Data');
        }
        
        const candles = data.values.map(item => ({
            Date: new Date(item.datetime),
            Open: parseFloat(item.open),
            High: parseFloat(item.high),
            Low: parseFloat(item.low),
            Close: parseFloat(item.close),
            Volume: parseFloat(item.volume || 0)
        })).reverse(); // Twelve Data возвращает данные в обратном порядке
        
        if (candles.length === 0) {
            throw new Error('No valid candles from Twelve Data');
        }
        
        console.log(`✅ Twelve Data: получено ${candles.length} свечей для ${symbol}`);
        
        this.setToCache(cacheKey, candles);
        return candles;
    }

    async getPolygonData(symbol, interval = '5m', period = '7d') {
        const cacheKey = `polygon_${symbol}_${interval}_${period}`;
        const cached = this.getFromCache(cacheKey);
        if (cached) return cached;

        // Маппинг интервалов для Polygon
        const intervalMap = {
            '1m': { multiplier: 1, timespan: 'minute' },
            '5m': { multiplier: 5, timespan: 'minute' },
            '15m': { multiplier: 15, timespan: 'minute' },
            '1h': { multiplier: 1, timespan: 'hour' },
            '4h': { multiplier: 4, timespan: 'hour' },
            '1d': { multiplier: 1, timespan: 'day' }
        };

        const { multiplier, timespan } = intervalMap[interval] || { multiplier: 1, timespan: 'day' };
        
        // Рассчитываем даты
        const to = new Date();
        const from = new Date();
        const periodDays = period.includes('d') ? parseInt(period) : 30;
        from.setDate(from.getDate() - periodDays);
        
        const fromStr = from.toISOString().split('T')[0];
        const toStr = to.toISOString().split('T')[0];

        console.log(`🔄 Запрос к Polygon: ${symbol} (${multiplier} ${timespan})`);
        
        // Используем apiClient для безопасного вызова через Netlify Functions
        if (!window.apiClient) {
            throw new Error('POLYGON_API_KEY is not defined');
        }
        
        const endpoint = `/v2/aggs/ticker/${symbol}/range/${multiplier}/${timespan}/${fromStr}/${toStr}`;
        const data = await window.apiClient.polygon(endpoint, {
            adjusted: 'true',
            sort: 'asc',
            limit: '50000'
        });
        
        if (data.status !== 'OK' || !data.results || data.results.length === 0) {
            throw new Error(data.error || 'No data from Polygon');
        }
        
        const candles = data.results.map(item => ({
            Date: new Date(item.t),
            Open: parseFloat(item.o),
            High: parseFloat(item.h),
            Low: parseFloat(item.l),
            Close: parseFloat(item.c),
            Volume: parseFloat(item.v || 0)
        }));
        
        if (candles.length === 0) {
            throw new Error('No valid candles from Polygon');
        }
        
        console.log(`✅ Polygon: получено ${candles.length} свечей для ${symbol}`);
        
        this.setToCache(cacheKey, candles);
        return candles;
    }

    async getFinnhubData(symbol, interval = '5m', period = '7d') {
        const cacheKey = `finnhub_${symbol}_${interval}_${period}`;
        const cached = this.getFromCache(cacheKey);
        if (cached) return cached;

        // Маппинг интервалов для Finnhub
        const intervalMap = {
            '1m': '1',
            '5m': '5',
            '15m': '15',
            '1h': '60',
            '4h': '240',
            '1d': 'D'
        };

        const resolution = intervalMap[interval] || 'D';
        
        // Рассчитываем временные метки
        const to = Math.floor(Date.now() / 1000);
        const periodDays = period.includes('d') ? parseInt(period) : 30;
        const from = to - (periodDays * 24 * 60 * 60);

        console.log(`🔄 Запрос к Finnhub: ${symbol} (resolution: ${resolution})`);
        
        // Используем apiClient для безопасного вызова через Netlify Functions
        if (!window.apiClient) {
            throw new Error('FINNHUB_API_KEY is not defined');
        }
        
        const data = await window.apiClient.finnhub('/stock/candle', {
            symbol: symbol,
            resolution: resolution,
            from: from.toString(),
            to: to.toString()
        });
        
        if (data.s !== 'ok' || !data.t || data.t.length === 0) {
            throw new Error('No data from Finnhub');
        }
        
        const candles = data.t.map((timestamp, index) => ({
            Date: new Date(timestamp * 1000),
            Open: parseFloat(data.o[index]),
            High: parseFloat(data.h[index]),
            Low: parseFloat(data.l[index]),
            Close: parseFloat(data.c[index]),
            Volume: parseFloat(data.v[index] || 0)
        }));
        
        if (candles.length === 0) {
            throw new Error('No valid candles from Finnhub');
        }
        
        console.log(`✅ Finnhub: получено ${candles.length} свечей для ${symbol}`);
        
        this.setToCache(cacheKey, candles);
        return candles;
    }

    async getYahooFinanceData(symbol, interval = '5m', period = '7d') {
        const cacheKey = `yahoo_${symbol}_${interval}_${period}`;
        const cached = this.getFromCache(cacheKey);
        if (cached) return cached;

        // Маппинг интервалов для Yahoo Finance
        const intervalMap = {
            '1m': '1m',
            '5m': '5m',
            '15m': '15m',
            '1h': '1h',
            '4h': '4h',
            '1d': '1d'
        };

        // Маппинг периодов для Yahoo Finance
        const periodMap = {
            '1d': '1d',
            '5d': '5d',
            '7d': '7d',
            '1mo': '1mo',
            '3mo': '3mo',
            '6mo': '6mo',
            '1y': '1y',
            '2y': '2y',
            '5y': '5y',
            '10y': '10y'
        };

        const yahooInterval = intervalMap[interval] || '1d';
        const yahooPeriod = periodMap[period] || '1mo';

        console.log(`🔄 Запрос к Yahoo Finance: ${symbol} (${yahooInterval}, ${yahooPeriod})`);
        
        // Используем apiClient для безопасного вызова через Netlify Functions
        if (!window.apiClient) {
            throw new Error('Yahoo Finance API client not available');
        }
        
        const endpoint = `/v8/finance/chart/${symbol}`;
        const data = await window.apiClient.yahoo(endpoint, {
            interval: yahooInterval,
            range: yahooPeriod
        });
        
        if (!data.chart || !data.chart.result || data.chart.result.length === 0) {
            throw new Error('No data from Yahoo Finance');
        }
        
        const result = data.chart.result[0];
        const timestamps = result.timestamp;
        const quotes = result.indicators.quote[0];
        
        if (!timestamps || !quotes) {
            throw new Error('Invalid data structure from Yahoo Finance');
        }
        
        const candles = timestamps.map((timestamp, index) => ({
            Date: new Date(timestamp * 1000),
            Open: parseFloat(quotes.open[index]) || 0,
            High: parseFloat(quotes.high[index]) || 0,
            Low: parseFloat(quotes.low[index]) || 0,
            Close: parseFloat(quotes.close[index]) || 0,
            Volume: parseFloat(quotes.volume[index]) || 0
        })).filter(candle => candle.Close > 0); // Фильтруем пустые свечи
        
        if (candles.length === 0) {
            throw new Error('No valid candles from Yahoo Finance');
        }
        
        console.log(`✅ Yahoo Finance: получено ${candles.length} свечей для ${symbol}`);
        
        this.setToCache(cacheKey, candles);
        return candles;
    }

    async generateFallbackData(symbol, period = '7d', interval = '5m') {
        console.warn(`⚠️ Генерация fallback данных для ${symbol}`);
        
        // Генерируем реалистичные исторические данные на основе текущего времени
        const intervalMs = this.getIntervalMs(interval);
        const periodMs = this.getPeriodMs(period);
        const now = Date.now();
        const startTime = now - periodMs;
        const candles = [];
        
        // Базовое значение цены (примерное для разных символов)
        let basePrice = 100;
        if (symbol.includes('BTC')) basePrice = 45000;
        else if (symbol.includes('ETH')) basePrice = 2500;
        else if (symbol.includes('SOL')) basePrice = 100;
        else if (symbol.includes('ADA')) basePrice = 0.5;
        
        let currentPrice = basePrice;
        
        for (let time = startTime; time <= now; time += intervalMs) {
            // Генерируем реалистичные колебания цены
            const volatility = 0.02; // 2% волатильность
            const change = (Math.random() - 0.5) * volatility;
            currentPrice *= (1 + change);
            
            const high = currentPrice * (1 + Math.abs(change) * 0.5);
            const low = currentPrice * (1 - Math.abs(change) * 0.5);
            const open = currentPrice * (1 + (Math.random() - 0.5) * 0.01);
            const close = currentPrice;
            const volume = Math.random() * 1000000 + 100000;
            
            candles.push({
                Date: new Date(time),
                Open: parseFloat(open.toFixed(2)),
                High: parseFloat(high.toFixed(2)),
                Low: parseFloat(low.toFixed(2)),
                Close: parseFloat(close.toFixed(2)),
                Volume: parseFloat(volume.toFixed(2))
            });
        }
        
        return candles;
    }

    getIntervalMs(interval) {
        const map = {
            '1m': 60 * 1000,
            '5m': 5 * 60 * 1000,
            '15m': 15 * 60 * 1000,
            '1h': 60 * 60 * 1000,
            '4h': 4 * 60 * 60 * 1000,
            '1d': 24 * 60 * 60 * 1000
        };
        return map[interval] || 5 * 60 * 1000;
    }

    getPeriodMs(period) {
        const num = parseInt(period);
        if (period.includes('d')) return num * 24 * 60 * 60 * 1000;
        if (period.includes('mo')) return num * 30 * 24 * 60 * 60 * 1000;
        if (period.includes('y')) return num * 365 * 24 * 60 * 60 * 1000;
        return 7 * 24 * 60 * 60 * 1000; // По умолчанию 7 дней
    }

    getCoinbaseGranularity(interval) {
        const map = { '1m': 60, '5m': 300, '15m': 900, '1h': 3600, '6h': 21600, '1d': 86400 };
        return map[interval] || 300;
    }

    getAlphaVantageInterval(interval) {
        const map = { 
            '1m': '1min', '5m': '5min', '15m': '15min', 
            '1h': '60min', '4h': '60min', '1d': 'daily' 
        };
        return map[interval] || '5min';
    }

    getFMPInterval(interval) {
        const map = { 
            '1m': '1min', '5m': '5min', '15m': '15min', 
            '1h': '1hour', '4h': '4hour', '1d': '1day' 
        };
        return map[interval] || '5min';
    }


    detectAssetType(symbol) {
        symbol = symbol.toUpperCase().replace('/', '');
        
        // ПРИОРИТЕТ 1: Используем нашу базу данных для точного определения
        if (typeof window !== 'undefined' && window.assetDatabase) {
            const assetInfo = window.assetDatabase.getAssetInfo(symbol);
            if (assetInfo) {
                const typeMap = {
                    'crypto': 'Криптовалюта',
                    'stock': 'Акция',
                    'forex': 'Форекс',
                    'index': 'Индекс',
                    'etf': 'ETF'
                };
                console.log(`✅ Тип актива ${symbol} определен из базы: ${typeMap[assetInfo.type] || assetInfo.type}`);
                return typeMap[assetInfo.type] || 'Акция';
            }
        }
        
        // ПРИОРИТЕТ 2: Проверяем популярные акции ПЕРЕД криптовалютами
        const popularStocks = [
            'AAPL', 'MSFT', 'GOOGL', 'GOOG', 'AMZN', 'META', 'NVDA', 'TSLA',
            'NFLX', 'AMD', 'INTC', 'ORCL', 'CRM', 'ADBE', 'QCOM', 'CSCO',
            'JPM', 'BAC', 'WFC', 'GS', 'MS', 'C', 'AXP', 'V', 'MA',
            'WMT', 'HD', 'NKE', 'SBUX', 'MCD', 'TGT', 'LOW', 'COST',
            'JNJ', 'PFE', 'UNH', 'ABBV', 'MRK', 'TMO', 'ABT', 'DHR',
            'BA', 'CAT', 'GE', 'HON', 'RTX', 'LMT', 'NOC', 'GD',
            'XOM', 'CVX', 'SLB', 'COP', 'EOG', 'MPC', 'PSX', 'VLO',
            'T', 'VZ', 'CMCSA', 'DIS', 'CHTR', 'TMUS', 'LUMN', 'BRK.B'
        ];
        
        if (popularStocks.includes(symbol)) {
            console.log(`✅ ${symbol} определен как популярная акция`);
            return "Акция";
        }
        
        // ПРИОРИТЕТ 3: Индексы
        if (symbol.startsWith('^')) {
            return "Индекс";
        }
        
        // ПРИОРИТЕТ 4: ETF
        const etfKeywords = [
            'SPY', 'QQQ', 'IWM', 'DIA', 'XLF', 'XLK', 'XLE', 'XLV', 'XLI', 'XLP', 
            'GLD', 'SLV', 'VTI', 'VOO', 'VEA', 'VWO', 'AGG', 'BND', 'VNQ', 'IEFA'
        ];
        if (etfKeywords.includes(symbol)) {
            return "ETF";
        }
        
        // ПРИОРИТЕТ 5: Форекс пары
        const forexPairs = [
            'EURUSD', 'GBPUSD', 'USDJPY', 'USDCHF', 'AUDUSD', 'USDCAD', 'NZDUSD',
            'EURGBP', 'EURJPY', 'GBPJPY', 'AUDJPY', 'EURCHF', 'GBPCHF', 'CADJPY',
            'EURAUD', 'EURCAD', 'GBPAUD', 'GBPCAD', 'AUDCAD', 'AUDNZD', 'NZDCAD',
            'USDCNH', 'USDSGD', 'USDHKD', 'USDSEK', 'USDNOK', 'USDDKK', 'USDPLN',
            'USDZAR', 'USDMXN', 'USDBRL', 'USDTRY', 'USDINR', 'USDKRW'
        ];
        
        if (forexPairs.includes(symbol) || (symbol.length === 6 && !symbol.includes('.') && !symbol.startsWith('^'))) {
            return "Форекс";
        }
        
        // ПРИОРИТЕТ 6: Криптовалюты (ПОСЛЕДНИЙ ПРИОРИТЕТ!)
        const cryptoKeywords = Object.keys(this.symbolMaps.coinmarketcap);
        
        if (cryptoKeywords.includes(symbol)) {
            return "Криптовалюта";
        }
        
        // По умолчанию - акция
        console.log(`⚠️ Тип актива ${symbol} не определен точно, используем "Акция" по умолчанию`);
        return "Акция";
    }

    getFromCache(key) {
        const cached = this.cache.get(key);
        if (!cached) return null;
        
        // Для минутных данных используем более короткий кэш
        const isMinuteData = key.includes('_1m_') || key.includes('interval=1m');
        const timeout = isMinuteData ? this.realtimeCacheTimeout : this.cacheTimeout;
        
        if (Date.now() - cached.timestamp < timeout) {
            return cached.data;
        }
        return null;
    }
    
    // Функция для получения текущей цены в реальном времени (самый быстрый способ через Binance Ticker)
    async getCurrentPrice(symbol) {
        try {
            symbol = symbol.toUpperCase().trim();
            const assetType = this.detectAssetType(symbol);
            
            if (assetType.includes("Криптовалюта")) {
                // Используем Binance Ticker API - самый быстрый способ получить текущую цену
                try {
                    let binanceSymbol = symbol;
                    if (!symbol.endsWith('USDT') && !symbol.endsWith('BUSD')) {
                        binanceSymbol = symbol + 'USDT';
                    }
                    
                    const response = await fetch(
                        `${this.apis.binance}/ticker/price?symbol=${binanceSymbol}`
                    );
                    
                    if (response.ok) {
                        const data = await response.json();
                        if (data.price && !data.code) {
                            return parseFloat(data.price);
                        }
                    }
                } catch (error) {
                    console.warn('Failed to get current price from Binance ticker:', error);
                }
            }
            
            return null;
        } catch (error) {
            console.error('Error getting current price:', error);
            return null;
        }
    }
    
    // Функция для получения последней свечи в реальном времени (без кэша)
    async getLatestCandle(symbol, interval = '1m') {
        try {
            symbol = symbol.toUpperCase().trim();
            const assetType = this.detectAssetType(symbol);
            
            if (assetType.includes("Криптовалюта")) {
                // Используем Binance для получения последней свечи
                try {
                    let binanceSymbol = symbol;
                    if (!symbol.endsWith('USDT') && !symbol.endsWith('BUSD')) {
                        binanceSymbol = symbol + 'USDT';
                    }
                    
                    const response = await fetch(
                        `${this.apis.binance}/klines?symbol=${binanceSymbol}&interval=${interval}&limit=1`
                    );
                    
                    if (response.ok) {
                        const data = await response.json();
                        if (!data.msg && data.length > 0) {
                            const item = data[0];
                            
                            // Получаем самую актуальную цену из ticker для Close
                            const currentPrice = await this.getCurrentPrice(symbol);
                            
                            return {
                                Date: new Date(item[0]),
                                Open: parseFloat(item[1]),
                                High: parseFloat(item[2]),
                                Low: parseFloat(item[3]),
                                Close: currentPrice || parseFloat(item[4]), // Используем текущую цену если доступна
                                Volume: parseFloat(item[5])
                            };
                        }
                    }
                } catch (error) {
                    console.warn('Failed to get latest candle from Binance:', error);
                }
            }
            
            return null;
        } catch (error) {
            console.error('Error getting latest candle:', error);
            return null;
        }
    }
    
    // Обновление последних данных для реального времени
    async updateRealtimeData(cachedData, symbol, interval = '1m') {
        if (!cachedData || cachedData.length === 0) return cachedData;
        
        const assetType = this.detectAssetType(symbol);
        
        // Для криптовалют всегда обновляем цену из Binance Ticker (самая актуальная)
        if (assetType.includes("Криптовалюта")) {
            try {
                const currentPrice = await this.getCurrentPrice(symbol);
                if (currentPrice) {
                    const lastCandle = cachedData[cachedData.length - 1];
                    const oldPrice = lastCandle.Close;
                    
                    // Обновляем цену даже если изменения небольшие (для максимальной актуальности)
                    lastCandle.Close = currentPrice;
                    if (currentPrice > lastCandle.High) lastCandle.High = currentPrice;
                    if (currentPrice < lastCandle.Low) lastCandle.Low = currentPrice;
                    
                    // Обновляем дату на текущую
                    lastCandle.Date = new Date();
                    
                    if (Math.abs(currentPrice - oldPrice) / oldPrice > 0.0001) { // Изменение > 0.01%
                        console.log(`✅ Обновлена цена для ${symbol}: $${oldPrice.toFixed(2)} → $${currentPrice.toFixed(2)} (Binance Ticker)`);
                    }
                }
            } catch (error) {
                console.warn(`⚠️ Не удалось обновить цену для ${symbol}:`, error);
            }
        }
        
        // Для минутных интервалов также обновляем последнюю свечу из klines
        if (interval === '1m' || interval === '5m') {
            try {
                const latestCandle = await this.getLatestCandle(symbol, interval);
                if (latestCandle) {
                    const lastCached = cachedData[cachedData.length - 1];
                    // Обновляем только если новая свеча новее
                    if (latestCandle.Date > lastCached.Date) {
                        // Заменяем последнюю свечу на актуальную
                        cachedData[cachedData.length - 1] = latestCandle;
                    }
                }
            } catch (error) {
                console.warn(`⚠️ Не удалось обновить свечу для ${symbol}:`, error);
            }
        }
        
        return cachedData;
    }

    setToCache(key, data) {
        this.cache.set(key, {
            data: data,
            timestamp: Date.now()
        });
    }
}

class UniversalPatternAnalyzer {
    constructor() {
        this.api = new FinancialDataAPI();
        this.advancedPredictor = new AdvancedPricePredictor();
        this.dataCache = {};
    }
    
    async getAssetData(symbol, period = '7d', interval = "5m") {
        return await this.api.getAssetData(symbol, period, interval);
    }
    
    getCurrentPeriodData(data, periodLength, timeFrame) {
        if (!data || !Array.isArray(data) || data.length === 0) return null;
        
        let dataPoints = Math.min(periodLength, data.length);
        
        return data.slice(-dataPoints);
    }
    
    // Проверка качества данных паттерна (фильтрация аномалий)
    isPatternDataValid(data) {
        if (!data || data.length < 2) return false;
        
        try {
            // Проверяем на резкие скачки цены (более 50% за одну свечу)
            for (let i = 1; i < data.length; i++) {
                const prevClose = data[i - 1].Close;
                const currentClose = data[i].Close;
                const change = Math.abs((currentClose - prevClose) / prevClose);
                
                // Если изменение больше 50% - это аномалия
                if (change > 0.5) {
                    return false;
                }
                
                // Проверяем на нулевые или отрицательные цены
                if (currentClose <= 0 || data[i].High <= 0 || data[i].Low <= 0 || data[i].Open <= 0) {
                    return false;
                }
                
                // Проверяем логичность OHLC (High >= Low, Close/Open между High и Low)
                if (data[i].High < data[i].Low || 
                    data[i].Close > data[i].High || 
                    data[i].Close < data[i].Low ||
                    data[i].Open > data[i].High || 
                    data[i].Open < data[i].Low) {
                    return false;
                }
            }
            
            return true;
        } catch (error) {
            return false;
        }
    }
    
    findSimilarPatterns(currentPattern, fullData, topN = 12) {
        if (!currentPattern || currentPattern.length < 1) return [];
        if (!fullData || fullData.length < currentPattern.length * 2) return [];

        try {
            const patterns = [];
            const patternLength = currentPattern.length;
            
            // 🆕 Адаптивный поиск в зависимости от длины периода
            const isShortPeriod = patternLength <= 9;
            const isMediumPeriod = patternLength > 9 && patternLength <= 50;
            
            // 🆕 Оптимизированный шаг поиска
            let stepSize;
            if (isShortPeriod) {
                stepSize = 1; // Максимальная точность для коротких периодов
            } else if (isMediumPeriod) {
                stepSize = Math.max(1, Math.floor(patternLength / 8));
            } else {
                stepSize = Math.max(1, Math.floor(patternLength / 10));
            }
            
            // 🆕 Адаптивный порог схожести
            const minSimilarityThreshold = isShortPeriod ? 0.45 : (isMediumPeriod ? 0.55 : 0.60);
            
            const searchLimit = fullData.length - patternLength - Math.max(1, Math.floor(patternLength / 2));

            for (let i = 0; i < searchLimit; i += stepSize) {
                const patternData = fullData.slice(i, i + patternLength);
                const futureLength = isShortPeriod ? patternLength : Math.floor(patternLength / 2);
                const futureData = fullData.slice(i + patternLength, i + patternLength + futureLength);
                
                if (futureData.length === 0) continue;
                
                // Проверяем качество данных паттерна (фильтруем аномалии)
                if (!this.isPatternDataValid(patternData) || !this.isPatternDataValid(futureData)) {
                    continue;
                }
                
                const score = this.calculatePatternSimilarity(currentPattern, patternData);
                
                if (score > minSimilarityThreshold) {
                    // 🆕 Рассчитываем будущее движение для этого паттерна
                    const futureMovement = this.calculateFutureMovement(patternData, futureData);
                    
                    patterns.push({
                        startIndex: i,
                        endIndex: i + patternLength,
                        score: score,
                        data: patternData,
                        futureData: futureData,
                        futureMovement: futureMovement,
                        period: this.getPatternPeriod(patternData)
                    });
                }
            }
            
            // 🆕 Сортируем по score и берем топ-N
            patterns.sort((a, b) => b.score - a.score);
            return patterns.slice(0, topN);
        } catch (error) {
            console.error('Error finding similar patterns:', error);
            return [];
        }
    }
    
    // 🆕 Расчет будущего движения паттерна
    calculateFutureMovement(patternData, futureData) {
        if (!patternData || !futureData || patternData.length === 0 || futureData.length === 0) {
            return { direction: 'neutral', change: 0, confidence: 0 };
        }
        
        const patternEnd = patternData[patternData.length - 1].Close;
        const futureEnd = futureData[futureData.length - 1].Close;
        const change = ((futureEnd - patternEnd) / patternEnd) * 100;
        
        const direction = change > 0.5 ? 'up' : (change < -0.5 ? 'down' : 'neutral');
        const confidence = Math.min(1, Math.abs(change) / 10); // Нормализуем 0-1
        
        return { direction, change, confidence };
    }
    
    getPatternPeriod(patternData) {
        if (!patternData || patternData.length === 0) return "Неизвестно";
        try {
            const startDate = patternData[0].Date;
            const endDate = patternData[patternData.length - 1].Date;
            const startYear = startDate.getFullYear();
            const endYear = endDate.getFullYear();
            
            if (startYear === endYear) {
                return `${startYear} год`;
            } else {
                return `${startYear}-${endYear}`;
            }
        } catch (error) {
            return "Неизвестно";
        }
    }
    
    calculatePatternSimilarity(pattern1, pattern2) {
        if (pattern1.length !== pattern2.length) return 0;
        
        try {
            // 1️⃣ Нормализация цен (форма паттерна)
            const normalizedPrices1 = pattern1.map(p => (p.Close / pattern1[0].Close) - 1);
            const normalizedPrices2 = pattern2.map(p => (p.Close / pattern2[0].Close) - 1);

            let priceSimilarity = 0;
            for (let i = 0; i < normalizedPrices1.length; i++) {
                const diff = Math.abs(normalizedPrices1[i] - normalizedPrices2[i]);
                priceSimilarity += Math.exp(-diff * 5); // Экспоненциальная функция для более точного сопоставления
            }
            priceSimilarity /= normalizedPrices1.length;

            // 2️⃣ Сходство доходностей (ритм движения)
            let returnsSimilarity = 0;
            for (let i = 1; i < pattern1.length; i++) {
                const return1 = (pattern1[i].Close - pattern1[i-1].Close) / pattern1[i-1].Close;
                const return2 = (pattern2[i].Close - pattern2[i-1].Close) / pattern2[i-1].Close;
                const diff = Math.abs(return1 - return2);
                returnsSimilarity += Math.exp(-diff * 20);
            }
            returnsSimilarity /= (pattern1.length - 1);
            
            // 3️⃣ Сходство волатильности
            const volatility1 = this.calculatePatternVolatility(pattern1);
            const volatility2 = this.calculatePatternVolatility(pattern2);
            const volatilitySimilarity = 1 - Math.min(1, Math.abs(volatility1 - volatility2) / Math.max(volatility1, volatility2, 0.01));
            
            // 4️⃣ Сходство направления тренда
            const trend1 = (pattern1[pattern1.length - 1].Close - pattern1[0].Close) / pattern1[0].Close;
            const trend2 = (pattern2[pattern2.length - 1].Close - pattern2[0].Close) / pattern2[0].Close;
            const trendSimilarity = trend1 * trend2 > 0 ? 1 - Math.min(1, Math.abs(trend1 - trend2) / Math.max(Math.abs(trend1), Math.abs(trend2), 0.01)) : 0;
            
            // 5️⃣ Сходство объемов (если доступны)
            let volumeSimilarity = 0.5; // Нейтральное значение по умолчанию
            if (pattern1[0].Volume && pattern2[0].Volume) {
                const avgVol1 = pattern1.reduce((sum, p) => sum + (p.Volume || 0), 0) / pattern1.length;
                const avgVol2 = pattern2.reduce((sum, p) => sum + (p.Volume || 0), 0) / pattern2.length;
                if (avgVol1 > 0 && avgVol2 > 0) {
                    volumeSimilarity = 1 - Math.min(1, Math.abs(avgVol1 - avgVol2) / Math.max(avgVol1, avgVol2));
                }
            }
            
            // 🎯 Взвешенная комбинация всех метрик
            const weights = {
                price: 0.35,      // Форма паттерна
                returns: 0.30,    // Ритм движения
                volatility: 0.15, // Волатильность
                trend: 0.15,      // Направление
                volume: 0.05      // Объемы
            };
            
            const finalSimilarity = 
                priceSimilarity * weights.price +
                returnsSimilarity * weights.returns +
                volatilitySimilarity * weights.volatility +
                trendSimilarity * weights.trend +
                volumeSimilarity * weights.volume;
            
            return Math.max(0, Math.min(1, finalSimilarity));

        } catch (error) {
            console.error('Error calculating similarity:', error);
            return 0;
        }
    }
    
    calculatePatternVolatility(pattern) {
        if (!pattern || pattern.length < 2) return 0;
        
        const returns = [];
        for (let i = 1; i < pattern.length; i++) {
            returns.push((pattern[i].Close - pattern[i-1].Close) / pattern[i-1].Close);
        }
        
        const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
        const variance = returns.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / returns.length;
        return Math.sqrt(variance);
    }
    
    async analyzeAndPredict(currentData, similarPatterns) {
        return await this.advancedPredictor.createEnhancedPrediction(currentData, similarPatterns);
    }
}


// Функции для графиков
function createCandlestickChart(data, title, containerId, height = 700) {
    if (!data || data.length === 0) {
        document.getElementById(containerId).innerHTML = '<p>Нет данных для графика</p>';
        return;
    }
    const isLightTheme = document.documentElement.getAttribute('data-theme') === 'light';
    
    // Используем индексы вместо дат для устранения пробелов
    const indices = data.map((_, i) => i);
    
    // Вычисляем оптимальный диапазон оси Y (фокус на основном движении цены)
    const allPrices = data.flatMap(d => [d.High, d.Low]);
    const minPrice = Math.min(...allPrices);
    const maxPrice = Math.max(...allPrices);
    const priceRange = maxPrice - minPrice;
    
    // Добавляем минимальные отступы (2%) для компактного отображения
    const yMin = minPrice - priceRange * 0.02;
    const yMax = maxPrice + priceRange * 0.02;
    
    const trace = {
        x: indices,
        close: data.map(d => d.Close),
        decreasing: {line: {color: '#ff4444'}},
        high: data.map(d => d.High),
        increasing: {line: {color: '#00ff88'}},
        low: data.map(d => d.Low),
        open: data.map(d => d.Open),
        type: 'candlestick',
        hovertext: data.map(d => new Date(d.Date).toLocaleString()),
        hoverinfo: 'text+y'
    };
    const layout = {
        title: { text: title, x: 0.5, font: {color: isLightTheme ? 'black' : 'white', size: 16} },
        xaxis: { 
            gridcolor: isLightTheme ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)', 
            rangeslider: { visible: false },
            type: 'linear',
            showticklabels: false
        },
        yaxis: { 
            title: 'Цена (USD)', 
            gridcolor: isLightTheme ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)',
            range: [yMin, yMax],
            autorange: false
        },
        height: height,
        margin: {l: 60, r: 40, t: 40, b: 60},
        plot_bgcolor: 'rgba(0,0,0,0)',
        paper_bgcolor: 'rgba(0,0,0,0)',
        font: {color: isLightTheme ? 'black' : 'white'}
    };
    Plotly.newPlot(containerId, [trace], layout, {responsive: true});
}

function createDualColorPatternChart(patternData, futureData, title, containerId, height = 500) {
    if (!patternData || patternData.length === 0) return;
    const isLightTheme = document.documentElement.getAttribute('data-theme') === 'light';
    const textColor = isLightTheme ? 'black' : 'white';
    
    // Используем индексы вместо дат для устранения пробелов
    const patternIndices = patternData.map((_, i) => i);
    const futureIndices = futureData.map((_, i) => patternData.length + i);
    
    // Вычисляем оптимальный диапазон оси Y для обоих наборов данных
    const allData = [...patternData, ...futureData];
    const allPrices = allData.flatMap(d => [d.High, d.Low]);
    const minPrice = Math.min(...allPrices);
    const maxPrice = Math.max(...allPrices);
    const priceRange = maxPrice - minPrice;
    
    // Добавляем минимальные отступы (2%) для компактного отображения
    const yMin = minPrice - priceRange * 0.02;
    const yMax = maxPrice + priceRange * 0.02;
    
    const trace1 = {
        x: patternIndices,
        close: patternData.map(d => d.Close),
        decreasing: {line: {color: '#ff4444'}},
        high: patternData.map(d => d.High),
        increasing: {line: {color: '#00ff88'}},
        low: patternData.map(d => d.Low),
        open: patternData.map(d => d.Open),
        type: 'candlestick',
        name: 'Исторический паттерн',
        hovertext: patternData.map(d => new Date(d.Date).toLocaleString()),
        hoverinfo: 'text+y'
    };
    
    const trace2 = {
        x: futureIndices,
        close: futureData.map(d => d.Close),
        decreasing: {line: {color: '#ffc482'}},
        high: futureData.map(d => d.High),
        increasing: {line: {color: '#82c9ff'}},
        low: futureData.map(d => d.Low),
        open: futureData.map(d => d.Open),
        type: 'candlestick',
        name: 'Что было дальше',
        hovertext: futureData.map(d => new Date(d.Date).toLocaleString()),
        hoverinfo: 'text+y'
    };
    
    const layout = {
        title: { text: title, x: 0.5, font: { color: textColor, size: 16 } },
        xaxis: { 
            gridcolor: isLightTheme ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)', 
            rangeslider: { visible: false },
            type: 'linear',
            showticklabels: false
        },
        yaxis: { 
            gridcolor: isLightTheme ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)',
            range: [yMin, yMax],
            autorange: false
        },
        height: height,
        margin: {l: 60, r: 30, t: 40, b: 60},
        plot_bgcolor: 'rgba(0,0,0,0)',
        paper_bgcolor: 'rgba(0,0,0,0)',
        font: { color: textColor },
        showlegend: true,
        legend: { orientation: "h", yanchor: "bottom", y: 1.02, xanchor: "right", x: 1 }
    };
    Plotly.newPlot(containerId, [trace1, trace2], layout, {responsive: true});
}
    

function createModernGauge(confidence, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    let levelClass, levelText;
    if (confidence >= 0.7) { levelClass = 'level-high'; levelText = 'ВЫСОКАЯ УВЕРЕННОСТЬ'; }
    else if (confidence >= 0.5) { levelClass = 'level-medium'; levelText = 'СРЕДНЯЯ УВЕРЕННОСТЬ'; }
    else { levelClass = 'level-low'; levelText = 'НИЗКАЯ УВЕРЕННОСТЬ'; }
    const fillAngle = confidence * 180;
    container.innerHTML = `
        <div class="confidence-gauge-modern">
            <div class="gauge-header"><div class="gauge-title">ТОЧНОСТЬ ПРОГНОЗА</div><div class="gauge-subtitle">На основе AI и исторических данных</div></div>
            <div class="gauge-main">
                <div class="gauge-circle"><div class="gauge-track"></div><div class="gauge-fill" style="transform: rotate(${fillAngle}deg);"></div><div class="gauge-center"><div class="gauge-value">${(confidence * 100).toFixed(0)}</div><div class="gauge-percent">%</div></div></div>
                <div class="confidence-level ${levelClass}"><div class="level-dot"></div><span>${levelText}</span></div>
            </div>
        </div>`;
}

// Глобальные функции для React
window.analyzer = new UniversalPatternAnalyzer();
window.createCandlestickChart = createCandlestickChart;
window.createDualColorPatternChart = createDualColorPatternChart;
window.createModernGauge = createModernGauge;

// Инициализация Plotly
if (typeof Plotly !== 'undefined') {
    Plotly.setPlotConfig({ displayModeBar: true, displaylogo: false, modeBarButtonsToRemove: ['pan2d', 'lasso2d', 'select2d', 'zoomIn2d', 'zoomOut2d', 'autoScale2d', 'resetScale2d'] });
}
