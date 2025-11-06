const { useState, useEffect, useRef } = React;

function AnalysisResults() {
    const [analysisData, setAnalysisData] = useState(null);
    const chartsInitializedRef = useRef(false);
    const autoRefreshIntervalRef = useRef(null);
    const analysisParamsRef = useRef(null);

    // Функция для очистки неполных свечей
  const filterIncompleteCandles = (data) => {
    if (!data || !Array.isArray(data)) return [];
    
    return data.filter(candle => {
        if (!candle || typeof candle !== 'object') return false;
        
        // Более мягкая проверка - только основные поля
        const hasRequiredFields = candle.Open !== undefined && 
                                candle.High !== undefined && 
                                candle.Low !== undefined && 
                                candle.Close !== undefined;
        
        if (!hasRequiredFields) return false;
        
        // Убрать строгую проверку High/Low - иногда данные могут быть неточными
        const isValid = !isNaN(candle.Open) && !isNaN(candle.High) && 
                      !isNaN(candle.Low) && !isNaN(candle.Close);
        
        return isValid;
    });
};

    window.updateAnalysisResults = (data) => {
        console.log('Received analysis data:', data);
        
        // Сохраняем параметры анализа для автообновления
        if (data.assetSymbol && data.timeFrame === 'MINUTES') {
            analysisParamsRef.current = {
                assetSymbol: data.assetSymbol,
                periodLength: data.periodLength,
                timeFrame: data.timeFrame
            };
        }
        
        // Фильтруем неполные свечи
        const filteredData = {
            ...data,
            currentPeriodData: filterIncompleteCandles(data.currentPeriodData),
            similarPatterns: data.similarPatterns?.map(pattern => ({
                ...pattern,
                data: filterIncompleteCandles(pattern.data),
                futureData: filterIncompleteCandles(pattern.futureData)
            })) || []
        };
        
        setAnalysisData(filteredData);
        chartsInitializedRef.current = false;
        
        // Скрываем информационный текст после анализа
        const userInfoElement = document.getElementById('userInfo');
        if (userInfoElement) {
            userInfoElement.classList.add('user-info-hidden');
        }
        
        // Запускаем автообновление каждую минуту для минутных данных
        if (data.timeFrame === 'MINUTES' && !autoRefreshIntervalRef.current) {
            startAutoRefresh();
        } else if (data.timeFrame !== 'MINUTES' && autoRefreshIntervalRef.current) {
            stopAutoRefresh();
        }
    };
    
    const startAutoRefresh = () => {
        stopAutoRefresh(); // Очищаем предыдущий интервал если есть
        
        autoRefreshIntervalRef.current = setInterval(async () => {
            if (!analysisParamsRef.current) return;
            
            const { assetSymbol, periodLength, timeFrame } = analysisParamsRef.current;
            console.log(`🔄 Автообновление анализа для ${assetSymbol}...`);
            
            try {
                const interval = "1m";
                const dataPeriod = parseInt(periodLength) <= 9 ? "30d" : "365d";
                
                // Обновляем данные с актуальной ценой из Binance Ticker
                const [assetData, assetType] = await window.analyzer.getAssetData(assetSymbol, dataPeriod, interval);
                
                // Дополнительно обновляем последнюю цену перед анализом из Binance Ticker
                if (assetType.includes("Криптовалюта") && window.analyzer?.api?.getCurrentPrice) {
                    try {
                        const currentPrice = await window.analyzer.api.getCurrentPrice(assetSymbol);
                        if (currentPrice && assetData.length > 0) {
                            const lastCandle = assetData[assetData.length - 1];
                            lastCandle.Close = currentPrice;
                            if (currentPrice > lastCandle.High) lastCandle.High = currentPrice;
                            if (currentPrice < lastCandle.Low) lastCandle.Low = currentPrice;
                            console.log(`✅ Автообновление: цена ${assetSymbol} = $${currentPrice.toFixed(2)}`);
                        }
                    } catch (e) {
                        console.warn('Failed to update price in auto-refresh:', e);
                    }
                }
                
                const currentPeriodData = window.analyzer.getCurrentPeriodData(assetData, parseInt(periodLength), timeFrame);
                
                if (!currentPeriodData || currentPeriodData.length < 1) return;
                
                const similarPatterns = window.analyzer.findSimilarPatterns(currentPeriodData, assetData) || [];
                const predictionResult = await window.analyzer.analyzeAndPredict(currentPeriodData, similarPatterns);
                
                const [confidence, prediction, analysisDetails, directionClass, weightedPrediction] = 
                    Array.isArray(predictionResult) ? predictionResult : [0.5, "Анализ завершен | РЕКОМЕНДАЦИЯ: АНАЛИЗИРУЙТЕ РЕЗУЛЬТАТЫ", "", "neutral", 0];
                
                setAnalysisData(prev => ({
                    assetSymbol: assetSymbol,
                    assetType: assetType || prev?.assetType || "Неизвестно",
                    periodLength: parseInt(periodLength),
                    timeFrame,
                    currentPeriodData: filterIncompleteCandles(currentPeriodData),
                    similarPatterns: similarPatterns.map(pattern => ({
                        ...pattern,
                        data: filterIncompleteCandles(pattern.data),
                        futureData: filterIncompleteCandles(pattern.futureData)
                    })),
                    confidence: confidence || 0.5,
                    prediction: prediction || "Анализ завершен | РЕКОМЕНДАЦИЯ: АНАЛИЗИРУЙТЕ РЕЗУЛЬТАТЫ",
                    analysisDetails: analysisDetails || "",
                    directionClass: directionClass || "neutral",
                    weightedPrediction: weightedPrediction || 0,
                    lastUpdate: new Date().toLocaleTimeString()
                }));
                
                chartsInitializedRef.current = false;
                
                // Пересоздаем графики
                setTimeout(() => {
                    createCharts({
                        currentPeriodData: filterIncompleteCandles(currentPeriodData),
                        similarPatterns,
                        confidence,
                        assetSymbol
                    });
                    chartsInitializedRef.current = true;
                }, 100);
                
            } catch (error) {
                console.error('Auto-refresh error:', error);
            }
        }, 60000); // Каждую минуту (60000 мс)
    };
    
    const stopAutoRefresh = () => {
        if (autoRefreshIntervalRef.current) {
            clearInterval(autoRefreshIntervalRef.current);
            autoRefreshIntervalRef.current = null;
        }
    };

    useEffect(() => {
        if (analysisData && analysisData.currentPeriodData && !chartsInitializedRef.current) {
            setTimeout(() => {
                createCharts(analysisData);
                chartsInitializedRef.current = true;
            }, 100);
        }
        
        // Очистка при размонтировании
        return () => {
            stopAutoRefresh();
        };
    }, [analysisData]);

    const createCharts = (data) => {
        try {
            const {
                currentPeriodData,
                similarPatterns = [],
                confidence,
                assetSymbol
            } = data;

            // Очищаем предыдущие графики
            const clearChartContainers = () => {
                const containers = [
                    'currentPeriodChart',
                    ...Array.from({length: 6}, (_, i) => `patternChart${i}`),
                    'confidenceGauge'
                ];
                
                containers.forEach(id => {
                    const container = document.getElementById(id);
                    if (container) {
                        container.innerHTML = '';
                    }
                });
            };

            clearChartContainers();

            if (currentPeriodData && currentPeriodData.length > 0) {
                setTimeout(() => {
                    try {
                        if (window.createCandlestickChart) {
                            window.createCandlestickChart(
                                currentPeriodData, 
                                `📈 ТЕКУЩИЙ ПЕРИОД (${assetSymbol})`, 
                                'currentPeriodChart', 
                                700
                            );
                        } else {
                            console.error('createCandlestickChart function not found');
                        }
                    } catch (error) {
                        console.error('Error creating candlestick chart:', error);
                    }
                }, 100);
            }

            if (similarPatterns && similarPatterns.length > 0) {
                similarPatterns.slice(0, 6).forEach((pattern, index) => {
                    if (pattern.data && pattern.futureData) {
                        setTimeout(() => {
                            try {
                                if (window.createDualColorPatternChart) {
                                    window.createDualColorPatternChart(
                                        pattern.data,
                                        pattern.futureData,
                                        '',
                                        `patternChart${index}`,
                                        500
                                    );
                                }
                            } catch (error) {
                                console.error(`Error creating pattern chart ${index}:`, error);
                            }
                        }, 200 + (index * 100));
                    }
                });
            }

            if (confidence !== undefined && confidence !== null) {
                setTimeout(() => {
                    try {
                        if (window.createModernGauge) {
                            window.createModernGauge(confidence, 'confidenceGauge');
                        }
                    } catch (error) {
                        console.error('Error creating gauge:', error);
                    }
                }, 300);
            }
        } catch (error) {
            console.error('Error in createCharts:', error);
        }
    };

    if (!analysisData) {
        return null;
    }

    const {
        assetSymbol,
        assetType,
        periodLength,
        timeFrame,
        currentPeriodData,
        similarPatterns = [],
        confidence = 0.5,
        prediction = "Анализ завершен | РЕКОМЕНДАЦИЯ: АНАЛИЗИРУЙТЕ РЕЗУЛЬТАТЫ",
        directionClass = "neutral"
    } = analysisData;

    const predictionParts = (prediction || "").split('|');
    const directionText = predictionParts[0]?.trim() || "📊 АНАЛИЗ ЗАВЕРШЕН";
    const recommendationText = predictionParts[1]?.trim() || "РЕКОМЕНДАЦИЯ: АНАЛИЗИРУЙТЕ РЕЗУЛЬТАТЫ";

    const getFutureChange = (pattern) => {
        if (!pattern || !pattern.data || !pattern.futureData || pattern.futureData.length === 0) return 0;
        try {
            const endPrice = pattern.data[pattern.data.length - 1]?.Close;
            const futurePrice = pattern.futureData[pattern.futureData.length - 1]?.Close;
            if (!endPrice || !futurePrice) return 0;
            return (((futurePrice - endPrice) / endPrice) * 100).toFixed(1);
        } catch {
            return 0;
        }
    };

    const getAverageReturn = () => {
        if (!similarPatterns || similarPatterns.length === 0) return 0;
        const totalReturn = similarPatterns.reduce((sum, pattern) => {
            return sum + parseFloat(getFutureChange(pattern) || 0);
        }, 0);
        return (totalReturn / similarPatterns.length).toFixed(1);
    };

    const getSuccessRate = () => {
        if (!similarPatterns || similarPatterns.length === 0) return 0;
        const successfulPatterns = similarPatterns.filter(pattern => {
            const change = parseFloat(getFutureChange(pattern) || 0);
            return change > 0;
        }).length;
        return ((successfulPatterns / similarPatterns.length) * 100).toFixed(1);
    };

    const getPatternMetrics = (pattern) => {
        const futureChange = getFutureChange(pattern);
        const isPositive = parseFloat(futureChange) > 0;
        const startPrice = pattern.data?.[0]?.Close?.toFixed(2) || '0.00';
        const endPrice = pattern.data?.[pattern.data.length - 1]?.Close?.toFixed(2) || '0.00';
        const similarity = ((pattern.score || 0) * 100).toFixed(1);

        return {
            futureChange,
            isPositive,
            startPrice,
            endPrice,
            similarity
        };
    };

    const lastUpdateText = analysisData?.lastUpdate || new Date().toLocaleString();
    const isAutoRefreshActive = autoRefreshIntervalRef.current !== null;
    
    return React.createElement('div', { id: 'resultsArea' },
        React.createElement('div', { className: 'alert alert-success' },
            `✅ РЕАЛЬНЫЕ ДАННЫЕ ЗАГРУЖЕНЫ: ${assetType} | Период: ${periodLength} ${timeFrame} | Свечей: ${currentPeriodData?.length || 0}`,
            timeFrame === 'MINUTES' && isAutoRefreshActive && 
                React.createElement('span', { style: { marginLeft: '1rem', color: '#00ff88', fontWeight: 'bold' } }, 
                    '🔄 АВТООБНОВЛЕНИЕ АКТИВНО (каждую минуту)'
                ),
            React.createElement('br'),
            React.createElement('small', {}, `Данные обновлены: ${lastUpdateText}`)
        ),
        
        React.createElement('div', { className: 'section-divider' }),
        
        React.createElement('div', { className: 'metrics-container' },
            React.createElement('div', { className: 'metric-card' },
                React.createElement('h3', {}, 'ТИП АКТИВА'),
                React.createElement('div', { className: 'metric-value' }, assetType || "Неизвестно"),
                React.createElement('div', { className: 'metric-description' }, `${periodLength} ${timeFrame}`)
            ),
            
            React.createElement('div', { className: 'metric-card' },
                React.createElement('h3', {}, 'ТЕКУЩАЯ ЦЕНА'),
                React.createElement('div', { className: 'metric-value' }, 
                    `$${currentPeriodData?.[currentPeriodData.length - 1]?.Close?.toFixed(2) || '0.00'}`
                ),
                React.createElement('div', { className: 'metric-description' }, 'LIVE')
            ),
            
            React.createElement('div', { className: 'metric-card' },
                React.createElement('h3', {}, 'НАЙДЕНО ПАТТЕРНОВ'),
                React.createElement('div', { className: 'metric-value' }, similarPatterns.length),
                React.createElement('div', { className: 'metric-description' }, 'исторических')
            ),
            
            React.createElement('div', { className: 'metric-card' },
                React.createElement('h3', {}, 'УВЕРЕННОСТЬ'),
                React.createElement('div', { 
                    className: `metric-value ${confidence > 0.7 ? 'confidence-high' : confidence > 0.5 ? 'confidence-medium' : 'confidence-low'}` 
                }, `${(confidence * 100).toFixed(1)}%`),
                React.createElement('div', { className: 'metric-description' }, 'прогноза')
            )
        ),

        similarPatterns.length > 0 && 
            React.createElement('div', { className: 'metrics-container' },
                React.createElement('div', { className: 'metric-card' },
                    React.createElement('h3', {}, '📊 СРЕДНЯЯ ДОХОДНОСТЬ'),
                    React.createElement('div', { 
                        className: `metric-value ${getAverageReturn() > 0 ? 'prediction-positive' : 'prediction-negative'}` 
                    }, `${getAverageReturn()}%`),
                    React.createElement('div', { className: 'metric-description' }, 'исторических паттернов')
                ),
                
                React.createElement('div', { className: 'metric-card' },
                    React.createElement('h3', {}, '🎯 УСПЕШНОСТЬ'),
                    React.createElement('div', { className: 'metric-value confidence-high' }, 
                        `${getSuccessRate()}%`
                    ),
                    React.createElement('div', { className: 'metric-description' }, 'положительных исходов')
                ),
                
                React.createElement('div', { className: 'metric-card' },
                    React.createElement('h3', {}, '⭐ ЛУЧШИЙ ПАТТЕРН'),
                    React.createElement('div', { className: 'metric-value prediction-positive' }, 
                        `${Math.max(...similarPatterns.map(p => parseFloat(getFutureChange(p) || 0))).toFixed(1)}%`
                    ),
                    React.createElement('div', { className: 'metric-description' }, 'максимальная доходность')
                ),
                
                React.createElement('div', { className: 'metric-card' },
                    React.createElement('h3', {}, '🔄 СРЕДНЯЯ СХОЖЕСТЬ'),
                    React.createElement('div', { className: 'metric-value' }, 
                        `${((similarPatterns.reduce((sum, p) => sum + (p.score || 0), 0) / similarPatterns.length) * 100).toFixed(1)}%`
                    ),
                    React.createElement('div', { className: 'metric-description' }, 'качество паттернов')
                )
            ),
        
        React.createElement('div', { className: 'section-divider' }),
        
        React.createElement('div', { className: 'chart-container' },
            React.createElement('h3', { className: 'section-title' }, `📈 ТЕКУЩИЙ ПЕРИОД (${assetSymbol})`),
            React.createElement('div', { id: 'currentPeriodChart', className: 'chart-full' })
        ),

        similarPatterns.length > 0 && 
            React.createElement('div', { className: 'chart-container' },
                React.createElement('h3', { className: 'section-title' }, 
                    `🔍 ИСТОРИЧЕСКИЕ ПАТТЕРНЫ (${similarPatterns.length} НАЙДЕНО)`
                ),
                React.createElement('div', { className: 'pattern-grid', id: 'similarPatternsGrid' },
                    similarPatterns.slice(0, 6).map((pattern, index) => {
                        const metrics = getPatternMetrics(pattern);
                        
                        return React.createElement('div', { key: index, className: 'pattern-card' },
                            React.createElement('div', { className: 'pattern-header' },
                                React.createElement('div', { className: 'pattern-title' }, 
                                    `📊 Паттерн #${index + 1}`
                                ),
                                React.createElement('div', { 
                                    className: `confidence-${pattern.score > 0.8 ? 'high' : pattern.score > 0.6 ? 'medium' : 'low'}`,
                                    style: { fontSize: '1.1rem' }
                                }, 
                                    `🔍 Схожесть: ${metrics.similarity}%`
                                )
                            ),
                            React.createElement('div', { className: 'pattern-content' },
                                React.createElement('div', { className: 'pattern-chart-container' },
                                    React.createElement('div', { id: `patternChart${index}`, className: 'chart-full' })
                                ),
                                
                                React.createElement('div', { className: 'pattern-collection' },
                                    React.createElement('div', { className: 'pattern-info-card' },
                                        React.createElement('h4', {}, '🎯 Исход'),
                                        React.createElement('div', { 
                                            className: `pattern-info-value ${metrics.isPositive ? 'prediction-positive' : 'prediction-negative'}` 
                                        }, 
                                            `${metrics.isPositive ? '↗' : '↘'} ${metrics.futureChange}%`
                                        ),
                                        React.createElement('div', { className: 'pattern-info-description' }, 'Исторический')
                                    ),
                                    
                                    React.createElement('div', { className: 'pattern-info-card' },
                                        React.createElement('h4', {}, '💰 Начало'),
                                        React.createElement('div', { className: 'pattern-info-value' }, 
                                            `$${metrics.startPrice}`
                                        ),
                                        React.createElement('div', { className: 'pattern-info-description' }, 'Цена')
                                    ),
                                    
                                    React.createElement('div', { className: 'pattern-info-card' },
                                        React.createElement('h4', {}, '💰 Конец'),
                                        React.createElement('div', { className: 'pattern-info-value' }, 
                                            `$${metrics.endPrice}`
                                        ),
                                        React.createElement('div', { className: 'pattern-info-description' }, 'Цена')
                                    ),
                                    
                                    React.createElement('div', { className: 'pattern-info-card' },
                                        React.createElement('h4', {}, '⭐ Схожесть'),
                                        React.createElement('div', { 
                                            className: `pattern-info-value ${pattern.score > 0.8 ? 'confidence-high' : pattern.score > 0.6 ? 'confidence-medium' : 'confidence-low'}` 
                                        }, 
                                            `${metrics.similarity}%`
                                        ),
                                        React.createElement('div', { className: 'pattern-info-description' }, 'Качество')
                                    )
                                )
                            ),
                            React.createElement('div', { className: 'pattern-footer' },
                                React.createElement('div', { 
                                    className: `pattern-outcome ${metrics.isPositive ? 'outcome-positive' : 'outcome-negative'}` 
                                },
                                    metrics.isPositive ? 
                                        '✅ ПОЛОЖИТЕЛЬНЫЙ ИСХОД - ЦЕНА РОСЛА ПОСЛЕ ПАТТЕРНА' : 
                                        '❌ ОТРИЦАТЕЛЬНЫЙ ИСХОД - ЦЕНА ПАДАЛА ПОСЛЕ ПАТТЕРНА'
                                )
                            )
                        );
                    })
                )
            ),

        React.createElement('div', { className: 'prediction-hero' },
            React.createElement('h3', { 
                className: 'section-title', 
                style: { fontSize: '1.8rem', marginBottom: '1.5rem' } 
            }, '🎯 AI АНАЛИЗ И РЕКОМЕНДАЦИИ'),
            
            React.createElement('div', { className: 'prediction-main' },
                React.createElement('div', { className: 'prediction-stats', style: { width: '100%' } },
                    React.createElement('div', { 
                        className: `prediction-direction ${directionClass}`,
                        style: { fontSize: '2rem', padding: '1.5rem' }
                    }, directionText),
                    
                    React.createElement('div', { 
                        className: 'prediction-recommendation',
                        style: { fontSize: '1.2rem', padding: '1.2rem' }
                    }, recommendationText),
                    
                    React.createElement('div', { id: 'confidenceGauge' }),
                    
                    similarPatterns.length > 0 && 
                        React.createElement('div', { className: 'pattern-summary' },
                            React.createElement('h4', { style: { textAlign: 'center', marginBottom: '1rem', color: 'var(--text-primary)' } }, 
                                '📈 СВОДКА ПО ВСЕМ ПАТТЕРНАМ'
                            ),
                            React.createElement('div', { className: 'summary-grid' },
                                React.createElement('div', { className: 'summary-item' },
                                    React.createElement('div', { className: 'summary-value' }, similarPatterns.length),
                                    React.createElement('div', { className: 'summary-label' }, 'Всего паттернов')
                                ),
                                React.createElement('div', { className: 'summary-item' },
                                    React.createElement('div', { 
                                        className: `summary-value ${getAverageReturn() > 0 ? 'prediction-positive' : 'prediction-negative'}` 
                                    }, `${getAverageReturn()}%`),
                                    React.createElement('div', { className: 'summary-label' }, 'Средняя доходность')
                                ),
                                React.createElement('div', { className: 'summary-item' },
                                    React.createElement('div', { className: 'summary-value confidence-high' }, `${getSuccessRate()}%`),
                                    React.createElement('div', { className: 'summary-label' }, 'Успешность')
                                ),
                                React.createElement('div', { className: 'summary-item' },
                                    React.createElement('div', { className: 'summary-value' }, 
                                        `${similarPatterns.filter(p => parseFloat(getFutureChange(p)) > 5).length}`
                                    ),
                                    React.createElement('div', { className: 'summary-label' }, 'Сильные паттерны (>5%)')
                                )
                            )
                        )
                )
            )
        )
    );
}

const resultsRoot = ReactDOM.createRoot(document.getElementById('react-analysis-results'));
resultsRoot.render(React.createElement(AnalysisResults));