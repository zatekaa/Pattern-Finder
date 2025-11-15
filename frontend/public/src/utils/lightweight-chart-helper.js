/**
 * 📊 Helper для создания графиков на TradingView Lightweight Charts
 * Используется для отображения текущего и исторических паттернов
 */

/**
 * Создает свечной график на TradingView Lightweight Charts
 */
function createLightweightCandlestickChart(containerId, data, title, height = 500) {
    console.log('📊 createLightweightCandlestickChart вызвана:', { containerId, dataLength: data?.length, title });
    
    const container = document.getElementById(containerId);
    if (!container) {
        console.error(`Container ${containerId} not found`);
        return null;
    }

    // Очищаем контейнер
    container.innerHTML = '';

    // Проверяем данные
    if (!data || data.length === 0) {
        console.error('❌ Нет данных для графика!');
        container.innerHTML = '<div style="color: red; padding: 20px; text-align: center;">Нет данных для отображения</div>';
        return null;
    }

    // Проверяем что библиотека загружена
    if (!window.LightweightCharts) {
        console.error('LightweightCharts not loaded');
        return null;
    }

    try {
        // Черный фон и размеры контейнера
        container.style.background = '#000000';
        container.style.borderRadius = '10px';
        container.style.padding = '0';
        container.style.height = `${height}px`;
        container.style.width = '100%';
        
        // Создаем график на весь контейнер
        const chart = window.LightweightCharts.createChart(container, {
            width: container.clientWidth,
            height: height,
            layout: {
                background: { 
                    type: 'solid',
                    color: '#000000' 
                },
                textColor: '#ffffff'
            },
            grid: {
                vertLines: { 
                    color: '#2a2a2a',
                    style: 1
                },
                horzLines: { 
                    color: '#2a2a2a',
                    style: 1
                }
            },
            crosshair: {
                mode: window.LightweightCharts.CrosshairMode.Normal
            },
            rightPriceScale: {
                borderColor: 'rgba(102, 126, 234, 0.3)',
                textColor: '#e0e0e0'
            },
            timeScale: {
                borderColor: 'rgba(102, 126, 234, 0.3)',
                timeVisible: false,
                secondsVisible: false,
                textColor: '#e0e0e0'
            }
        });

        // Добавляем свечной график с яркими цветами
        const candlestickSeries = chart.addCandlestickSeries({
            upColor: '#00ff88',
            downColor: '#ff4444',
            borderVisible: true,
            borderUpColor: '#00ff88',
            borderDownColor: '#ff4444',
            wickUpColor: '#00ff88',
            wickDownColor: '#ff4444',
            wickVisible: true
        });

        // Преобразуем данные
        console.log('🔍 Исходные данные (первая свеча):', data[0]);
        
        const formattedData = data.map((candle, index) => {
            // Проверяем формат данных
            const open = candle.Open || candle.open || 0;
            const high = candle.High || candle.high || 0;
            const low = candle.Low || candle.low || 0;
            const close = candle.Close || candle.close || 0;
            
            return {
                time: index,
                open: open,
                high: high,
                low: low,
                close: close
            };
        });

        console.log('📈 Отрисовка данных:', formattedData.length, 'свечей');
        console.log('📈 Первая свеча:', formattedData[0]);
        console.log('📈 Последняя свеча:', formattedData[formattedData.length - 1]);

        if (formattedData.length > 0 && formattedData[0].close === 0) {
            console.error('❌ ОШИБКА: Данные не содержат цен!');
            container.innerHTML = '<div style="color: red; padding: 20px;">Ошибка: данные не содержат цен</div>';
            return null;
        }

        candlestickSeries.setData(formattedData);

        // Подгоняем график
        chart.timeScale().fitContent();

        // Обработчик изменения размера
        const resizeObserver = new ResizeObserver(() => {
            const newWidth = container.clientWidth;
            chart.applyOptions({
                width: newWidth
            });

            if (totalBars > 0) {
                const barSpacing = Math.max(Math.floor(newWidth / totalBars) - 1, 2);
                chart.timeScale().applyOptions({
                    barSpacing
                });
            }
        });

        resizeObserver.observe(container);

        console.log(`✅ График создан: ${title}`);

        return {
            chart: chart,
            series: candlestickSeries,
            destroy: () => {
                resizeObserver.disconnect();
                chart.remove();
            }
        };

    } catch (error) {
        console.error('Error creating chart:', error);
        return null;
    }
}

/**
 * Создает график с двумя сериями (исторический + будущее)
 */
function createComparisonChart(containerId, historicalData, futureData, title, height = 500) {
    console.log('📊 createComparisonChart вызвана:', { 
        containerId, 
        historicalLength: historicalData?.length, 
        futureLength: futureData?.length, 
        title 
    });
    
    const container = document.getElementById(containerId);
    if (!container) {
        console.error(`Container ${containerId} not found`);
        return null;
    }

    container.innerHTML = '';

    // Проверяем данные
    if (!historicalData || historicalData.length === 0) {
        console.error('❌ Нет исторических данных!');
        container.innerHTML = '<div style="color: red; padding: 20px; text-align: center;">Нет данных для отображения</div>';
        return null;
    }

    if (!window.LightweightCharts) {
        console.error('LightweightCharts not loaded');
        return null;
    }

    try {
        // Черный фон и размеры контейнера
        container.style.background = '#000000';
        container.style.borderRadius = '10px';
        container.style.padding = '0';
        container.style.height = `${height}px`;
        container.style.width = '100%';
        
        const chart = window.LightweightCharts.createChart(container, {
            width: container.clientWidth,
            height: height,
            layout: {
                background: { 
                    type: 'solid',
                    color: '#000000' 
                },
                textColor: '#ffffff'
            },
            grid: {
                vertLines: { 
                    color: '#2a2a2a',
                    style: 1
                },
                horzLines: { 
                    color: '#2a2a2a',
                    style: 1
                }
            },
            crosshair: {
                mode: window.LightweightCharts.CrosshairMode.Normal
            },
            rightPriceScale: {
                borderColor: 'rgba(102, 126, 234, 0.3)',
                textColor: '#e0e0e0'
            },
            timeScale: {
                borderColor: 'rgba(102, 126, 234, 0.3)',
                timeVisible: false,
                secondsVisible: false,
                textColor: '#e0e0e0'
            }
        });

        // Исторический паттерн (зелено-красный)
        const historicalSeries = chart.addCandlestickSeries({
            upColor: '#00ff88',
            downColor: '#ff4444',
            borderVisible: true,
            borderUpColor: '#00ff88',
            borderDownColor: '#ff4444',
            wickUpColor: '#00ff88',
            wickDownColor: '#ff4444'
        });

        // Будущее (сине-оранжевый)
        const futureSeries = chart.addCandlestickSeries({
            upColor: 'rgba(77, 171, 247, 0.8)',
            downColor: 'rgba(255, 152, 0, 0.8)',
            borderVisible: true,
            borderUpColor: '#4dabf7',
            borderDownColor: '#ff9800',
            wickUpColor: '#4dabf7',
            wickDownColor: '#ff9800'
        });

        // Форматируем данные
        console.log('🔍 Исходные исторические:', historicalData);
        console.log('🔍 Исходные будущие:', futureData);
        console.log('🔍 Длина исторических:', historicalData.length);
        console.log('🔍 Длина будущих:', futureData.length);
        
        const formattedHistorical = historicalData.map((candle, index) => ({
            time: index,
            open: candle.Open || candle.open || 0,
            high: candle.High || candle.high || 0,
            low: candle.Low || candle.low || 0,
            close: candle.Close || candle.close || 0
        }));

        // КЛЮЧЕВОЕ ИСПРАВЛЕНИЕ: Начинаем будущие данные БЕЗ пропуска индекса
        const formattedFuture = futureData.map((candle, index) => ({
            time: historicalData.length - 1 + index, // -1 чтобы перекрыть последнюю историческую
            open: candle.Open || candle.open || 0,
            high: candle.High || candle.high || 0,
            low: candle.Low || candle.low || 0,
            close: candle.Close || candle.close || 0
        }));
        
        console.log('📈 Исторических:', formattedHistorical.length, 'Будущих:', formattedFuture.length);
        console.log('🔗 Будущие начинаются с индекса:', historicalData.length - 1, '(перекрытие для устранения пробела)');

        historicalSeries.setData(formattedHistorical);
        futureSeries.setData(formattedFuture);

        chart.timeScale().fitContent();

        const totalBars = formattedHistorical.length + formattedFuture.length;
        if (totalBars > 0) {
            const width = container.clientWidth || 600;
            const barSpacing = Math.max(Math.floor(width / totalBars) - 1, 2);
            chart.timeScale().applyOptions({
                barSpacing,
                rightOffset: 1,
                leftOffset: 0
            });
        }

        const resizeObserver = new ResizeObserver(() => {
            chart.applyOptions({
                width: container.clientWidth
            });
        });

        resizeObserver.observe(container);

        console.log(`✅ Сравнительный график создан: ${title} (без пробелов)`);

        return {
            chart: chart,
            historicalSeries: historicalSeries,
            futureSeries: futureSeries,
            destroy: () => {
                resizeObserver.disconnect();
                chart.remove();
            }
        };

    } catch (error) {
        console.error('Error creating comparison chart:', error);
        return null;
    }
}

// Экспортируем функции
window.createLightweightCandlestickChart = createLightweightCandlestickChart;
window.createComparisonChart = createComparisonChart;

console.log('✅ Lightweight Chart Helper загружен v5 (исправление пробелов через перекрытие индексов)');
