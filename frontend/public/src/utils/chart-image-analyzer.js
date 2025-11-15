// 🖼️ Профессиональный анализатор изображений графиков
// Распознает свечи на изображении с валидацией

class ChartImageAnalyzer {
    constructor() {
        this.minCandlesRequired = 3; // Минимум свечей для анализа (ПОНИЖЕНО для гибкости)
        this.maxCandlesAllowed = 200; // Максимум свечей
        this.confidenceThreshold = 0.3; // Порог уверенности распознавания (ПОНИЖЕН для гибкости)
    }

    /**
     * Главный метод: извлекает данные свечей из изображения
     * @param {File} imageFile - файл изображения
     * @returns {Promise<Object>} - {candles: Array, validation: Object}
     */
    async extractCandlesFromImage(imageFile) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                const img = new Image();
                
                img.onload = () => {
                    try {
                        // Создаем canvas для анализа
                        const canvas = document.createElement('canvas');
                        const ctx = canvas.getContext('2d');
                        
                        canvas.width = img.width;
                        canvas.height = img.height;
                        ctx.drawImage(img, 0, 0);
                        
                        // Получаем данные пикселей
                        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                        
                        // Анализируем изображение
                        console.log('📊 Анализ изображения:', canvas.width, 'x', canvas.height);
                        const result = this.analyzeChartImage(imageData, canvas.width, canvas.height);
                        console.log('🔍 Найдено свечей:', result.candles.length);
                        console.log('📍 Позиции свечей:', result.candlePositions.length);
                        
                        // Валидация результата
                        const validation = this.validateChartData(result.candles, imageData, canvas.width, canvas.height);
                        console.log('✅ Валидация:', validation.isValid ? 'Успешно' : 'Ошибка');
                        
                        if (!validation.isValid) {
                            reject(new Error(validation.errorMessage));
                            return;
                        }
                        
                        resolve({
                            candles: result.candles,
                            validation: validation,
                            metadata: {
                                imageWidth: canvas.width,
                                imageHeight: canvas.height,
                                candleCount: result.candles.length,
                                confidence: validation.confidence
                            }
                        });
                        
                    } catch (error) {
                        reject(new Error('❌ Ошибка анализа изображения: ' + error.message));
                    }
                };
                
                img.onerror = () => {
                    reject(new Error('❌ Не удалось загрузить изображение. Проверьте формат файла.'));
                };
                
                img.src = e.target.result;
            };
            
            reader.onerror = () => {
                reject(new Error('❌ Ошибка чтения файла'));
            };
            
            reader.readAsDataURL(imageFile);
        });
    }

    /**
     * Анализирует изображение и извлекает свечи
     */
    analyzeChartImage(imageData, width, height) {
        const pixels = imageData.data;
        
        // 1. Определяем область графика
        const chartArea = this.detectChartArea(pixels, width, height);
        
        // 2. Находим вертикальные линии (свечи)
        const candlePositions = this.detectCandlePositions(pixels, width, height, chartArea);
        
        // 3. Извлекаем OHLC данные для каждой свечи
        const candles = this.extractOHLCData(pixels, width, height, chartArea, candlePositions);
        
        return { candles, chartArea, candlePositions };
    }

    /**
     * Определяет область графика (исключая оси, легенду, заголовки)
     */
    detectChartArea(pixels, width, height) {
        // Ищем границы графика по плотности пикселей
        let left = Math.floor(width * 0.08);
        let right = Math.floor(width * 0.96);
        let top = Math.floor(height * 0.08);
        let bottom = Math.floor(height * 0.88);
        
        // Уточняем границы, ища скопления цветных пикселей
        const sampleSize = 10;
        
        // Левая граница
        for (let x = 0; x < width * 0.3; x += sampleSize) {
            let colorCount = 0;
            for (let y = top; y < bottom; y += sampleSize) {
                if (this.isColoredPixel(pixels, x, y, width)) colorCount++;
            }
            if (colorCount > 5) {
                left = x;
                break;
            }
        }
        
        // Правая граница
        for (let x = width - 1; x > width * 0.7; x -= sampleSize) {
            let colorCount = 0;
            for (let y = top; y < bottom; y += sampleSize) {
                if (this.isColoredPixel(pixels, x, y, width)) colorCount++;
            }
            if (colorCount > 5) {
                right = x;
                break;
            }
        }
        
        return { left, right, top, bottom };
    }

    /**
     * Находит позиции свечей на графике
     * УЛУЧШЕНО: Умное распознавание реальных свечей
     */
    detectCandlePositions(pixels, width, height, chartArea) {
        const positions = [];
        const chartWidth = chartArea.right - chartArea.left;
        const chartHeight = chartArea.bottom - chartArea.top;
        
        console.log('🔍 Умное распознавание свечей...');
        
        // ШАГ 1: Создаем вертикальную проекцию (сколько цветных пикселей в каждом столбце)
        const verticalProjection = new Array(chartWidth).fill(0);
        
        for (let x = 0; x < chartWidth; x++) {
            const actualX = chartArea.left + x;
            for (let y = chartArea.top; y < chartArea.bottom; y += 2) { // Каждый 2-й пиксель для скорости
                if (this.isColoredPixel(pixels, actualX, y, width)) {
                    verticalProjection[x]++;
                }
            }
        }
        
        // ШАГ 2: Находим пики (места где много цветных пикселей = свечи)
        const threshold = chartHeight / 20; // Минимальная высота для свечи
        let inCandle = false;
        let candleStart = 0;
        
        for (let x = 0; x < chartWidth; x++) {
            const isCandle = verticalProjection[x] > threshold;
            
            if (isCandle && !inCandle) {
                // Начало свечи
                candleStart = x;
                inCandle = true;
            } else if (!isCandle && inCandle) {
                // Конец свечи
                const candleWidth = x - candleStart;
                const candleCenter = chartArea.left + candleStart + Math.floor(candleWidth / 2);
                
                // Проверяем что это реальная свеча (не шум)
                if (candleWidth >= 2 && candleWidth <= chartWidth / 5) {
                    positions.push({
                        x: candleCenter,
                        width: candleWidth,
                        start: chartArea.left + candleStart,
                        end: chartArea.left + x
                    });
                }
                
                inCandle = false;
            }
        }
        
        console.log('📍 Найдено свечей (умное распознавание):', positions.length);
        
        // ШАГ 3: Если нашли слишком мало или слишком много - используем адаптивный подход
        if (positions.length < 5 || positions.length > 100) {
            console.warn('⚠️ Нестандартное количество свечей, используем адаптивный метод');
            positions.length = 0; // Очищаем
            
            // Определяем оптимальное количество свечей
            const estimatedCandles = Math.min(50, Math.max(10, Math.floor(chartWidth / 30)));
            const candleWidth = Math.floor(chartWidth / estimatedCandles);
            
            for (let i = 0; i < estimatedCandles; i++) {
                const x = chartArea.left + (i * candleWidth) + Math.floor(candleWidth / 2);
                
                // Проверяем наличие данных
                let hasData = false;
                for (let y = chartArea.top; y < chartArea.bottom; y += 5) {
                    if (this.isColoredPixel(pixels, x, y, width)) {
                        hasData = true;
                        break;
                    }
                }
                
                if (hasData) {
                    positions.push({
                        x: x,
                        width: candleWidth,
                        start: x - Math.floor(candleWidth / 2),
                        end: x + Math.floor(candleWidth / 2)
                    });
                }
            }
            
            console.log('📍 Адаптивный метод: создано', positions.length, 'свечей');
        }
        
        // ШАГ 4: Фильтруем слишком близкие свечи
        const filteredPositions = [];
        const minDistance = Math.floor(chartWidth / 100); // Минимальное расстояние между свечами
        
        for (let i = 0; i < positions.length; i++) {
            if (i === 0 || positions[i].x - positions[i - 1].x > minDistance) {
                filteredPositions.push(positions[i]);
            }
        }
        
        console.log('✅ Финальное количество свечей:', filteredPositions.length);
        
        return filteredPositions;
    }

    /**
     * Извлекает OHLC данные для каждой свечи
     */
    extractOHLCData(pixels, width, height, chartArea, candlePositions) {
        const candles = [];
        const chartHeight = chartArea.bottom - chartArea.top;
        
        console.log(`🔍 Извлечение OHLC данных из ${candlePositions.length} свечей...`);
        
        for (let i = 0; i < candlePositions.length; i++) {
            const pos = candlePositions[i];
            
            // Находим границы свечи
            let high = chartArea.bottom;
            let low = chartArea.top;
            let bodyTop = chartArea.bottom;
            let bodyBottom = chartArea.top;
            
            let greenPixels = 0;
            let redPixels = 0;
            let totalCandlePixels = 0;
            
            // Сканируем область свечи (используем start/end если есть, иначе вычисляем)
            const startX = pos.start || (pos.x - Math.floor(pos.width / 2));
            const endX = pos.end || (pos.x + Math.floor(pos.width / 2));
            
            for (let x = startX; x <= endX; x++) {
                for (let y = chartArea.top; y < chartArea.bottom; y++) {
                    const idx = (y * width + x) * 4;
                    const r = pixels[idx];
                    const g = pixels[idx + 1];
                    const b = pixels[idx + 2];
                    
                    // Проверяем, является ли пиксель частью свечи (более гибкие условия)
                    const isGreen = g > r + 15 && g > b + 15;
                    const isRed = r > g + 15 && r > b + 15;
                    const isWhite = r > 180 && g > 180 && b > 180;
                    const isBlack = r < 80 && g < 80 && b < 80;
                    const isBlue = b > r + 15 && b > g + 15; // Добавляем синие свечи
                    const isYellow = r > 150 && g > 150 && b < 100; // Добавляем желтые свечи
                    
                    if (isGreen || isRed || isWhite || isBlack || isBlue || isYellow) {
                        totalCandlePixels++;
                        
                        if (y < high) high = y;
                        if (y > low) low = y;
                        
                        // Подсчитываем цвета для определения направления
                        if (isGreen || isBlue) greenPixels++;
                        if (isRed || isYellow) redPixels++;
                        
                        // Определяем тело свечи (более толстая часть)
                        const thickness = this.getPixelThickness(pixels, width, x, y, chartArea);
                        if (thickness > 3) { // Увеличен порог для более точного определения тела
                            if (y < bodyTop) bodyTop = y;
                            if (y > bodyBottom) bodyBottom = y;
                        }
                    }
                }
            }
            
            // Если нашли свечу
            if (high < low && totalCandlePixels > 5) {
                // Определяем направление свечи
                const isBullish = greenPixels > redPixels;
                
                // Если тело не определено, используем среднюю часть
                if (bodyTop >= bodyBottom) {
                    const middleY = (high + low) / 2;
                    const bodyHeight = (low - high) * 0.6; // 60% от общей высоты
                    bodyTop = middleY - bodyHeight / 2;
                    bodyBottom = middleY + bodyHeight / 2;
                }
                
                // Конвертируем пиксели в относительные цены (инвертируем Y, так как Y растет вниз)
                const priceHigh = 100 - ((high - chartArea.top) / chartHeight) * 100;
                const priceLow = 100 - ((low - chartArea.top) / chartHeight) * 100;
                const priceBodyTop = 100 - ((bodyTop - chartArea.top) / chartHeight) * 100;
                const priceBodyBottom = 100 - ((bodyBottom - chartArea.top) / chartHeight) * 100;
                
                // Убеждаемся, что OHLC логичны
                const validHigh = Math.max(priceHigh, priceLow, priceBodyTop, priceBodyBottom);
                const validLow = Math.min(priceHigh, priceLow, priceBodyTop, priceBodyBottom);
                const validOpen = isBullish ? Math.min(priceBodyTop, priceBodyBottom) : Math.max(priceBodyTop, priceBodyBottom);
                const validClose = isBullish ? Math.max(priceBodyTop, priceBodyBottom) : Math.min(priceBodyTop, priceBodyBottom);
                
                candles.push({
                    Date: new Date(Date.now() - (candlePositions.length - i) * 3600000).toISOString(),
                    Open: validOpen,
                    High: validHigh,
                    Low: validLow,
                    Close: validClose,
                    Volume: 1000000,
                    _isBullish: isBullish,
                    _pixelData: { // Для отладки
                        high: high,
                        low: low,
                        bodyTop: bodyTop,
                        bodyBottom: bodyBottom,
                        greenPixels: greenPixels,
                        redPixels: redPixels
                    }
                });
            }
        }
        
        console.log(`✅ Извлечено ${candles.length} валидных свечей`);
        if (candles.length > 0) {
            console.log(`📊 Диапазон цен: ${Math.min(...candles.map(c => c.Low)).toFixed(2)} - ${Math.max(...candles.map(c => c.High)).toFixed(2)}`);
        }
        
        return candles;
    }

    /**
     * Определяет толщину пикселя (для различия тела и фитиля)
     */
    getPixelThickness(pixels, width, x, y, chartArea) {
        let thickness = 0;
        
        // Проверяем горизонтально
        for (let dx = -5; dx <= 5; dx++) {
            const checkX = x + dx;
            if (checkX >= chartArea.left && checkX < chartArea.right) {
                if (this.isColoredPixel(pixels, checkX, y, width)) {
                    thickness++;
                }
            }
        }
        
        return thickness;
    }

    /**
     * Проверяет, является ли пиксель цветным (часть свечи)
     * УЛУЧШЕНО: Более гибкое распознавание разных цветовых схем
     */
    isColoredPixel(pixels, x, y, width) {
        const idx = (y * width + x) * 4;
        const r = pixels[idx];
        const g = pixels[idx + 1];
        const b = pixels[idx + 2];
        const a = pixels[idx + 3];
        
        // Пропускаем прозрачные пиксели
        if (a < 100) return false;
        
        // Вычисляем яркость и насыщенность
        const brightness = (r + g + b) / 3;
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        const saturation = max === 0 ? 0 : (max - min) / max;
        
        // 1. Очень темные пиксели (черные свечи, тени)
        if (brightness < 60) return true;
        
        // 2. Очень светлые пиксели (белые свечи)
        if (brightness > 200) return true;
        
        // 3. Насыщенные цвета (цветные свечи)
        if (saturation > 0.2) return true;
        
        // 4. Зеленые оттенки (любые)
        if (g > r + 15 && g > b + 10) return true;
        
        // 5. Красные оттенки (любые)
        if (r > g + 15 && r > b + 10) return true;
        
        // 6. Синие оттенки (TradingView, некоторые платформы)
        if (b > r + 15 && b > g + 10) return true;
        
        // 7. Оранжевые оттенки (некоторые платформы)
        if (r > 150 && g > 80 && g < r - 20 && b < 100) return true;
        
        // 8. Голубые оттенки (некоторые платформы)
        if (b > 150 && g > 150 && r < 150) return true;
        
        // 9. Серые линии (сетка, но могут быть и свечи)
        const isGray = Math.abs(r - g) < 30 && Math.abs(g - b) < 30 && Math.abs(r - b) < 30;
        if (isGray && brightness > 60 && brightness < 200) return true;
        
        return false;
    }

    /**
     * Валидирует распознанные данные
     */
    validateChartData(candles, imageData, width, height) {
        const errors = [];
        let confidence = 1.0;
        
        // 1. Проверка количества свечей
        if (!candles || candles.length === 0) {
            return {
                isValid: false,
                errorMessage: '❌ НЕ НАЙДЕНО СВЕЧЕЙ НА ИЗОБРАЖЕНИИ!\n\n' +
                             '📋 Пожалуйста, загрузите изображение свечного графика:\n' +
                             '  • График должен содержать японские свечи\n' +
                             '  • Свечи должны быть четко видны\n' +
                             '  • Рекомендуется 10-100 свечей\n' +
                             '  • Поддерживаются графики из TradingView, Binance, MetaTrader',
                confidence: 0
            };
        }
        
        // Понижаем минимальное требование для гибкости
        const effectiveMinCandles = Math.max(2, this.minCandlesRequired);
        
        if (candles.length < effectiveMinCandles) {
            return {
                isValid: false,
                errorMessage: `❌ СЛИШКОМ МАЛО СВЕЧЕЙ (${candles.length})!\n\n` +
                             `Для качественного анализа нужно минимум ${effectiveMinCandles} свечей.\n` +
                             'Загрузите график с большим количеством свечей.',
                confidence: candles.length / effectiveMinCandles
            };
        }
        
        if (candles.length > this.maxCandlesAllowed) {
            confidence *= 0.9;
            errors.push(`Много свечей (${candles.length}), будут использованы последние ${this.maxCandlesAllowed}`);
        }
        
        // 2. Проверка валидности OHLC данных
        let invalidCandles = 0;
        for (let i = 0; i < candles.length; i++) {
            const c = candles[i];
            
            // Проверка логичности OHLC
            if (c.High < c.Low || 
                c.Close > c.High || c.Close < c.Low ||
                c.Open > c.High || c.Open < c.Low) {
                invalidCandles++;
            }
            
            // Проверка на нулевые значения
            if (c.Open <= 0 || c.High <= 0 || c.Low <= 0 || c.Close <= 0) {
                invalidCandles++;
            }
        }
        
        const invalidRatio = invalidCandles / candles.length;
        if (invalidRatio > 0.3) {
            return {
                isValid: false,
                errorMessage: '❌ ГРАФИК НЕ РАСПОЗНАН КОРРЕКТНО!\n\n' +
                             'Изображение не похоже на свечной график.\n\n' +
                             '💡 Советы:\n' +
                             '  • Используйте четкое изображение\n' +
                             '  • Свечи должны быть зеленого/красного цвета\n' +
                             '  • Уберите лишние элементы (индикаторы, текст)\n' +
                             '  • Увеличьте масштаб графика перед скриншотом',
                confidence: 1 - invalidRatio
            };
        }
        
        confidence *= (1 - invalidRatio * 0.5);
        
        // 3. Проверка на монотонность (все свечи одного цвета = подозрительно)
        const bullishCount = candles.filter(c => c._isBullish).length;
        const bearishCount = candles.length - bullishCount;
        const colorRatio = Math.max(bullishCount, bearishCount) / candles.length;
        
        if (colorRatio > 0.95) {
            confidence *= 0.7;
            errors.push('Все свечи одного цвета - возможна ошибка распознавания');
        }
        
        // 4. Проверка волатильности
        const priceRange = Math.max(...candles.map(c => c.High)) - Math.min(...candles.map(c => c.Low));
        if (priceRange < 1) {
            confidence *= 0.8;
            errors.push('Очень низкая волатильность - возможно плохое качество изображения');
        }
        
        // Финальная проверка confidence
        if (confidence < this.confidenceThreshold) {
            return {
                isValid: false,
                errorMessage: '❌ НИЗКАЯ УВЕРЕННОСТЬ РАСПОЗНАВАНИЯ!\n\n' +
                             `Уверенность: ${(confidence * 100).toFixed(0)}% (требуется ${(this.confidenceThreshold * 100).toFixed(0)}%)\n\n` +
                             'Возможные проблемы:\n' +
                             errors.map(e => '  • ' + e).join('\n') + '\n\n' +
                             'Попробуйте загрузить более четкое изображение.',
                confidence: confidence
            };
        }
        
        return {
            isValid: true,
            confidence: confidence,
            warnings: errors,
            candleCount: candles.length,
            priceRange: priceRange
        };
    }
}

// Экспорт
if (typeof window !== 'undefined') {
    window.ChartImageAnalyzer = ChartImageAnalyzer;
    // Создаем глобальный экземпляр для использования
    window.chartImageAnalyzer = new ChartImageAnalyzer();
    console.log('✅ ChartImageAnalyzer инициализирован');
}
