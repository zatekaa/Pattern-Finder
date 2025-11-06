const { useState, useEffect, useRef } = React;

function ControlPanel() {
    const [assetSymbol, setAssetSymbol] = useState('');
    const [periodLength, setPeriodLength] = useState('');
    const [timeFrame, setTimeFrame] = useState('MINUTES');
    const [isLoading, setIsLoading] = useState(false);
    const [assetService, setAssetService] = useState(null);

    // Инициализация сервисов
    useEffect(() => {
        const service = new AssetService();
        service.initialize().then(() => {
            setAssetService(service);
        });
    }, []);

    const handleAnalyze = async () => {
        if (!assetSymbol.trim()) {
            window.toast?.error('Введите символ актива');
            return;
        }

        setIsLoading(true);
        
        // Показываем прогресс бар
        const progressBar = document.createElement('div');
        progressBar.className = 'progress-bar-container';
        progressBar.innerHTML = '<div class="progress-bar indeterminate"></div>';
        document.body.appendChild(progressBar);
        
        // Скрываем информационный текст
        const userInfoElement = document.getElementById('userInfo');
        if (userInfoElement) {
            userInfoElement.classList.add('user-info-hidden');
        }

        try {
            // Проверяем доступность актива
            if (assetService) {
                const isSupported = await assetService.isAssetSupported(assetSymbol);
                if (!isSupported) {
                    // ВСЕ РАВНО пробуем проанализировать - может быть новый актив
                    console.log('⚠️ Актив не найден в базах, пробуем анализ...');
                }
            }

            let interval = "1m", dataPeriod = "7d";
            if (timeFrame === "MINUTES") {
                interval = "1m"; 
                dataPeriod = parseInt(periodLength) <= 9 ? "30d" : "365d";
            }
            else if (timeFrame === "HOURS") {
                interval = "1h";
                dataPeriod = "5y";
            }
            else { 
                interval = "1d"; 
                dataPeriod = "10y";
            }

            // Пробуем получить данные - analyzer сам будет пробовать разные источники
            const [assetData, assetType] = await window.analyzer.getAssetData(
                assetSymbol.toUpperCase(), 
                dataPeriod, 
                interval
            );
            
            const currentPeriodData = window.analyzer.getCurrentPeriodData(
                assetData, 
                parseInt(periodLength), 
                timeFrame
            );
            
            if (!currentPeriodData || currentPeriodData.length < 1) {
                throw new Error('Недостаточно данных для анализа. Попробуйте другой актив или таймфрейм.');
            }

            const similarPatterns = window.analyzer.findSimilarPatterns(currentPeriodData, assetData) || [];
            const predictionResult = await window.analyzer.analyzeAndPredict(currentPeriodData, similarPatterns);
            
            const [confidence, prediction, analysisDetails, directionClass, weightedPrediction] = 
                Array.isArray(predictionResult) ? predictionResult : [0.5, "Анализ завершен", "", "neutral", 0];

            if (window.updateAnalysisResults) {
                window.updateAnalysisResults({
                    assetSymbol: assetSymbol.toUpperCase(),
                    assetType: assetType || "Автоопределение",
                    periodLength: parseInt(periodLength),
                    timeFrame,
                    currentPeriodData,
                    similarPatterns,
                    confidence: confidence || 0.5,
                    prediction: prediction || "Анализ завершен",
                    analysisDetails: analysisDetails || "",
                    directionClass: directionClass || "neutral",
                    weightedPrediction: weightedPrediction || 0
                });
                
                // Показываем успешное уведомление
                window.toast?.success(`Анализ ${assetSymbol.toUpperCase()} завершен успешно!`);
            }

        } catch (error) {
            console.error('Analysis error:', error);
            
            // 🆕 Более информативные сообщения об ошибках
            let errorMessage = error.message;
            let suggestions = '';
            
            if (errorMessage.includes('not found') || errorMessage.includes('No historical data')) {
                suggestions = '\n\n💡 Попробуйте:\n• Проверить правильность символа\n• Использовать другой таймфрейм\n• Попробовать похожий актив';
            } else if (errorMessage.includes('API') || errorMessage.includes('limit')) {
                suggestions = '\n\n⚠️ Возможно превышен лимит API. Подождите 1-2 минуты и попробуйте снова.';
            } else if (errorMessage.includes('Index') || errorMessage.includes('Индекс')) {
                suggestions = '\n\n📊 Для индексов (^GSPC, ^DJI) используйте таймфрейм "1 ДЕНЬ"';
            }
            
            window.toast?.error(`ОШИБКА: ${errorMessage}${suggestions}`, 6000);
        } finally {
            setIsLoading(false);
            
            // Удаляем прогресс бар
            const progressBar = document.querySelector('.progress-bar-container');
            if (progressBar) {
                progressBar.remove();
            }
        }
    };


    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleAnalyze();
        }
    };

    const handlePeriodChange = (e) => {
        const value = e.target.value;
        if (value === '' || (/^\d+$/.test(value) && parseInt(value) >= 1 && parseInt(value) <= 300)) {
            setPeriodLength(value);
        }
    };

    return (
        <div className="control-panel">
            <div className="control-group">
                <label htmlFor="assetSymbol">СИМВОЛ АКТИВА</label>
                <input
                    type="text"
                    id="assetSymbol"
                    value={assetSymbol}
                    onChange={(e) => setAssetSymbol(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Введите ЛЮБОЙ актив: BTC, AAPL, EURUSD, TSLA, GOLD..."
                    disabled={isLoading}
                />
            </div>
            
            <div className="control-group">
                <label htmlFor="periodLength">ДЛИТЕЛЬНОСТЬ ПЕРИОДА</label>
                <input
                    type="text"
                    id="periodLength"
                    value={periodLength}
                    onChange={handlePeriodChange}
                    onKeyPress={handleKeyPress}
                    placeholder="Введите число от 1 до 300"
                    disabled={isLoading}
                />
            </div>
            
            <div className="control-group">
                <label htmlFor="timeFrame">ТАЙМФРЕЙМ</label>
                <select
                    id="timeFrame"
                    value={timeFrame}
                    onChange={(e) => setTimeFrame(e.target.value)}
                    disabled={isLoading}
                >
                    <option value="MINUTES">1 МИНУТ</option>
                    <option value="HOURS">1 ЧАС</option>
                    <option value="DAYS">1 ДЕНЬ</option>
                </select>
            </div>
            
            <div className="control-group">
                <button
                    className="btn-primary"
                    onClick={handleAnalyze}
                    disabled={isLoading || !assetSymbol.trim() || !periodLength}
                >
                    {isLoading ? '🔄 АНАЛИЗ...' : '🎯 АНАЛИЗИРОВАТЬ ПАТТЕРНЫ'}
                </button>
            </div>
        </div>
    );
}

const controlRoot = ReactDOM.createRoot(document.getElementById('react-control-panel'));
controlRoot.render(React.createElement(ControlPanel));