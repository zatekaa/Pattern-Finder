
const { useState, useEffect } = React;

function ControlPanel() {
    const [assetSymbol, setAssetSymbol] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [assetService, setAssetService] = useState(null);
    
    const [selectedRange, setSelectedRange] = useState(null);
    const [showChart, setShowChart] = useState(false);
    
    // Функция для показа графика
    const handleShowChart = () => {
        if (!assetSymbol.trim()) {
            window.toast?.error('Введите название актива (например: BTC)');
            return;
        }
        
        setShowChart(true);
        
        // Скрываем блок с инструкциями
        const userInfo = document.getElementById('userInfo');
        if (userInfo) {
            userInfo.style.display = 'none';
        }
        
        console.log('✅ Показываем Plotly график для', assetSymbol);
    };
    
    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleShowChart();
        }
    };
    
    // Обработчик выделения области на графике
    const handleRangeSelected = (startDate, endDate) => {
        setSelectedRange({ start: startDate, end: endDate });
        console.log('📐 Область выделена:', { start: startDate, end: endDate });
    };

    // Инициализация сервисов
    useEffect(() => {
        if (window.AssetService) {
            window.AssetService.initialize().then(() => {
                setAssetService(window.AssetService);
            });
        } else {
            const checkInterval = setInterval(() => {
                if (window.AssetService) {
                    window.AssetService.initialize().then(() => {
                        setAssetService(window.AssetService);
                    });
                    clearInterval(checkInterval);
                }
            }, 100);
        }
    }, []);
    
    const handleAnalyze = async () => {
        if (!assetSymbol.trim()) {
            window.toast?.error('Введите название актива (например: BTC)');
            return;
        }
        
        setIsLoading(true);
        
        const progressBar = document.createElement('div');
        progressBar.className = 'progress-bar-container';
        progressBar.innerHTML = '<div class="progress-bar indeterminate"></div>';
        document.body.appendChild(progressBar);
        
        const userInfoElement = document.getElementById('userInfo');
        if (userInfoElement) {
            userInfoElement.classList.add('user-info-hidden');
        }
        
        try {
            window.toast?.info('📊 Анализ паттерна...');
            
            let patternStartDateTime, patternEndDateTime;
            
            // Если есть выделенная область - используем её
            if (selectedRange) {
                patternStartDateTime = selectedRange.start.toISOString();
                patternEndDateTime = selectedRange.end.toISOString();
                console.log('✅ Используем выделенную область:', selectedRange);
            } else {
                // Иначе - последние 6 часов
                const now = new Date();
                const sixHoursAgo = new Date(now.getTime() - 6 * 60 * 60 * 1000);
                patternStartDateTime = sixHoursAgo.toISOString();
                patternEndDateTime = now.toISOString();
                console.log('✅ Используем автоматический период: последние 6 часов');
            }
            
            const now = new Date();
            const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            const historyStart = monthAgo.toISOString().split('T')[0];
            const historyEnd = now.toISOString().split('T')[0];
            
            console.log('📊 Автоматический анализ:', {
                symbol: assetSymbol,
                patternStart: patternStartDateTime,
                patternEnd: patternEndDateTime,
                historyStart: historyStart,
                historyEnd: historyEnd,
                interval: '5m'
            });
            
            // Вызываем Node.js API с автоматическими параметрами
            const response = await fetch('http://localhost:3000/api/analyze', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    symbol: assetSymbol.toUpperCase(),
                    patternStartDate: patternStartDateTime,
                    patternEndDate: patternEndDateTime,
                    historicalStartDate: historyStart,
                    historicalEndDate: historyEnd,
                    interval: '5m',
                    topMatches: 10
                })
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (!data.success) {
                throw new Error(data.error || 'Ошибка анализа');
            }
            
            console.log('✅ Результаты анализа:', data);
            console.log('📊 Паттерн данные:', data.pattern);
            console.log('📊 Количество свечей паттерна:', data.pattern.candleCount);
            console.log('📊 Количество найденных паттернов:', data.matches.length);
            
            // Отображаем результаты
            if (window.updateAnalysisResults) {
                console.log('📊 Вызываем updateAnalysisResults...');
                console.log('📊 Первый паттерн:', data.matches[0]);
                console.log('📊 futureData первого паттерна:', data.matches[0]?.futureData);
                
                window.updateAnalysisResults({
                    assetSymbol: assetSymbol.toUpperCase(),
                    assetType: "TradingView",
                    periodLength: data.pattern.candleCount,
                    timeFrame: '5M',
                    currentPeriodData: data.pattern.data,
                    similarPatterns: data.matches.map(m => ({
                        period: `${m.startDate} - ${m.endDate}`,
                        score: m.similarity / 100,
                        data: m.data,
                        futureData: m.futureData || [], // Данные после паттерна
                        futureOutcome: m.futureOutcome
                    })),
                    confidence: data.statistics.avgSimilarity / 100,
                    prediction: `Найдено ${data.statistics.totalMatches} паттернов`,
                    analysisDetails: `${data.historical.candleCount} свечей • ${data.statistics.avgSimilarity}% схожесть`,
                    directionClass: data.statistics.avgFutureOutcome > 0 ? 'bullish' : 'bearish',
                    weightedPrediction: data.statistics.avgFutureOutcome || 0,
                    historicalYears: (new Date(data.historical.endDate) - new Date(data.historical.startDate)) / (365.25 * 24 * 60 * 60 * 1000)
                });
                
                window.toast?.success(`🎉 Найдено ${data.statistics.totalMatches} похожих паттернов!`);
            }
            
        } catch (error) {
            console.error('Ошибка анализа по датам:', error);
            window.toast?.error(error.message || 'Ошибка анализа. Проверьте что сервер запущен (npm start)', 8000);
        } finally {
            setIsLoading(false);
            const progressBar = document.querySelector('.progress-bar-container');
            if (progressBar) {
                progressBar.remove();
            }
        }
    };

    return (
        <div className="control-panel-modern">
            {/* Поле ввода актива с кнопкой */}
            <div style={{ 
                display: 'flex', 
                gap: '15px', 
                alignItems: 'flex-end',
                marginBottom: '30px',
                padding: '20px',
                background: 'var(--bg-secondary)',
                borderRadius: '10px',
                border: '2px solid var(--border-color)'
            }}>
                <div style={{ flex: 1 }}>
                    <label htmlFor="assetSymbol" className="modern-label" style={{ marginBottom: '10px', display: 'block' }}>
                        <span className="label-icon">📊</span>
                        НАЗВАНИЕ АКТИВА
                    </label>
                    <input
                        type="text"
                        id="assetSymbol"
                        className="modern-input"
                        value={assetSymbol}
                        onChange={(e) => {
                            setAssetSymbol(e.target.value);
                            // Сбрасываем состояние графика при изменении символа
                            if (showChart) {
                                setShowChart(false);
                            }
                        }}
                        onKeyPress={handleKeyPress}
                        placeholder="Например: BTC, ETH, AAPL..."
                        disabled={isLoading}
                        style={{ width: '100%', fontSize: '1.1rem', padding: '12px' }}
                    />
                </div>
                <button
                    onClick={handleShowChart}
                    disabled={!assetSymbol.trim() || showChart}
                    style={{
                        padding: '12px 30px',
                        fontSize: '1.1rem',
                        fontWeight: 'bold',
                        background: showChart ? '#6c757d' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: showChart ? 'not-allowed' : 'pointer',
                        transition: 'all 0.3s ease',
                        boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
                        whiteSpace: 'nowrap'
                    }}
                >
                    {showChart ? '✅ График загружен' : '📊 Показать график'}
                </button>
            </div>
            
            {/* UnifiedChart - показывается только после нажатия кнопки */}
            {showChart && window.UnifiedChart && React.createElement(window.UnifiedChart, {
                symbol: assetSymbol,
                onPatternAnalyzed: (data) => {
                    console.log('📊 Паттерны найдены:', data);
                    // Можно сразу показать результаты
                    if (window.updateAnalysisResults) {
                        window.updateAnalysisResults({
                            assetSymbol: assetSymbol.toUpperCase(),
                            assetType: "UnifiedChart",
                            periodLength: data.pattern.candleCount,
                            timeFrame: '1D',
                            currentPeriodData: data.pattern.data,
                            similarPatterns: data.matches.map(m => ({
                                period: `${m.startDate} - ${m.endDate}`,
                                score: m.similarity / 100,
                                data: m.data,
                                futureData: m.futureData || [],
                                futureOutcome: m.futureOutcome
                            })),
                            confidence: data.statistics.avgSimilarity / 100,
                            prediction: `Найдено ${data.statistics.totalMatches} паттернов`,
                            analysisDetails: `${data.historical.candleCount} свечей • ${data.statistics.avgSimilarity}% схожесть`,
                            directionClass: data.statistics.avgFutureOutcome > 0 ? 'bullish' : 'bearish',
                            weightedPrediction: data.statistics.avgFutureOutcome || 0,
                            historicalYears: (new Date(data.historical.endDate) - new Date(data.historical.startDate)) / (365.25 * 24 * 60 * 60 * 1000)
                        });
                    }
                }
            })}
            
            {/* Кнопка анализа - показывается только после загрузки графика */}
            {showChart && (
                <div className="control-group-modern" style={{ marginTop: '20px' }}>
                    <button
                        className="btn-analyze"
                        onClick={handleAnalyze}
                        disabled={isLoading || !assetSymbol.trim()}
                    >
                        {isLoading ? '🔄 АНАЛИЗИРУЕМ...' : '🎯 АНАЛИЗИРОВАТЬ ПАТТЕРНЫ'}
                    </button>
                </div>
            )}
        </div>
    );
}

const controlRoot = ReactDOM.createRoot(document.getElementById('react-control-panel'));
controlRoot.render(React.createElement(ControlPanel));
