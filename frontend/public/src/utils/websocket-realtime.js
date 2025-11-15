// ⚡ WebSocket для реал-тайм данных
// Подключается к Binance WebSocket и получает данные в реальном времени

class RealtimeDataStream {
    constructor() {
        this.ws = null;
        this.symbol = null;
        this.callbacks = {
            onCandle: null,
            onTicker: null,
            onError: null
        };
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.isConnected = false;
    }

    // Подключение к Binance WebSocket для свечей
    connectCandlestick(symbol, interval = '1m', onCandle) {
        this.symbol = symbol.toUpperCase();
        if (!this.symbol.endsWith('USDT')) {
            this.symbol += 'USDT';
        }

        this.callbacks.onCandle = onCandle;

        const wsUrl = `wss://stream.binance.com:9443/ws/${this.symbol.toLowerCase()}@kline_${interval}`;
        
        console.log(`⚡ Подключение к Binance WebSocket: ${this.symbol} (${interval})`);

        try {
            this.ws = new WebSocket(wsUrl);

            this.ws.onopen = () => {
                console.log('✅ WebSocket подключен');
                this.isConnected = true;
                this.reconnectAttempts = 0;
            };

            this.ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    const kline = data.k;

                    if (kline) {
                        const candle = {
                            Date: new Date(kline.t),
                            Open: parseFloat(kline.o),
                            High: parseFloat(kline.h),
                            Low: parseFloat(kline.l),
                            Close: parseFloat(kline.c),
                            Volume: parseFloat(kline.v),
                            isClosed: kline.x // Свеча закрыта?
                        };

                        if (this.callbacks.onCandle) {
                            this.callbacks.onCandle(candle);
                        }
                    }
                } catch (error) {
                    console.error('Ошибка парсинга WebSocket данных:', error);
                }
            };

            this.ws.onerror = (error) => {
                console.error('❌ WebSocket ошибка:', error);
                this.isConnected = false;
                if (this.callbacks.onError) {
                    this.callbacks.onError(error);
                }
            };

            this.ws.onclose = () => {
                console.log('🔌 WebSocket отключен');
                this.isConnected = false;
                this.attemptReconnect(symbol, interval, onCandle);
            };

        } catch (error) {
            console.error('Ошибка создания WebSocket:', error);
        }
    }

    // Попытка переподключения
    attemptReconnect(symbol, interval, onCandle) {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
            
            console.log(`🔄 Переподключение через ${delay/1000}с (попытка ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
            
            setTimeout(() => {
                this.connectCandlestick(symbol, interval, onCandle);
            }, delay);
        } else {
            console.error('❌ Превышено максимальное количество попыток переподключения');
        }
    }

    // Подключение к тикеру (цена в реальном времени)
    connectTicker(symbol, onTicker) {
        this.symbol = symbol.toUpperCase();
        if (!this.symbol.endsWith('USDT')) {
            this.symbol += 'USDT';
        }

        this.callbacks.onTicker = onTicker;

        const wsUrl = `wss://stream.binance.com:9443/ws/${this.symbol.toLowerCase()}@ticker`;
        
        console.log(`⚡ Подключение к Binance Ticker: ${this.symbol}`);

        try {
            this.ws = new WebSocket(wsUrl);

            this.ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    
                    const ticker = {
                        symbol: data.s,
                        price: parseFloat(data.c),
                        priceChange: parseFloat(data.p),
                        priceChangePercent: parseFloat(data.P),
                        volume: parseFloat(data.v),
                        high24h: parseFloat(data.h),
                        low24h: parseFloat(data.l)
                    };

                    if (this.callbacks.onTicker) {
                        this.callbacks.onTicker(ticker);
                    }
                } catch (error) {
                    console.error('Ошибка парсинга ticker данных:', error);
                }
            };

        } catch (error) {
            console.error('Ошибка создания WebSocket ticker:', error);
        }
    }

    // Отключение
    disconnect() {
        if (this.ws) {
            console.log('🔌 Отключение WebSocket...');
            this.ws.close();
            this.ws = null;
            this.isConnected = false;
        }
    }

    // Проверка подключения
    isActive() {
        return this.isConnected && this.ws && this.ws.readyState === WebSocket.OPEN;
    }
}

// Глобальный экземпляр
window.realtimeStream = new RealtimeDataStream();

// Пример использования:
// window.realtimeStream.connectCandlestick('BTC', '1m', (candle) => {
//     console.log('Новая свеча:', candle);
//     // Обновить график
// });
