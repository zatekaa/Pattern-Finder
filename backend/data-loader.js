/**
 * 📊 ЗАГРУЗЧИК ДАННЫХ ДЛЯ 750+ АКТИВОВ
 * 
 * Поддерживает:
 * - Binance (криптовалюты) - бесплатно, без ключа
 * - Twelve Data (форекс 1436 пар) - требует API ключ
 * - Alpha Vantage (форекс ~120 пар) - требует API ключ
 * - EODHD (акции, форекс, индексы) - требует API ключ
 * - Автоматический фоллбэк между источниками
 */

const fetch = require('node-fetch');
const path = require('path');
require('dotenv').config();

class DataLoader {
  constructor() {
    this.eodApiKey = process.env.EOD_API_KEY || '';
    this.twelveDataKey = process.env.TWELVE_DATA_API_KEY || '';
    this.alphaVantageKey = process.env.ALPHA_VANTAGE_API_KEY || '';
    this.cache = new Map(); // Простой кеш в памяти
    this.cacheTimeout = 5 * 60 * 1000; // 5 минут
  }

  /**
   * Главный метод: загрузка данных для любого актива
   */
  async loadData(symbol, fromDate, toDate, interval = '1d') {
    console.log(`📊 Загрузка данных: ${symbol}, ${fromDate} - ${toDate}, ${interval}`);

    const cacheKey = `${symbol}_${fromDate}_${toDate}_${interval}`;
    
    // ⚠️ ВРЕМЕННО ОТКЛЮЧАЕМ КЕШ для отладки
    // const cached = this._getFromCache(cacheKey);
    // if (cached) {
    //   console.log(`📦 Данные из кеша: ${symbol} (${cached.length} свечей)`);
    //   return cached;
    // }
    
    console.log(`🔥 КЕШ ОТКЛЮЧЕН - загружаем свежие данные для ${symbol}`);

    // Определяем тип актива и источник
    const assetType = this._detectAssetType(symbol);
    
    let data = null;

    // ФОРЕКС: Гибридная система с дополнением данных
    if (assetType === 'forex') {
      const forexSources = [
        { name: 'Twelve Data', fn: () => this._loadFromTwelveData(symbol, fromDate, toDate, interval), available: this.twelveDataKey },
        { name: 'Alpha Vantage', fn: () => this._loadFromAlphaVantage(symbol, fromDate, toDate, interval), available: this.alphaVantageKey },
        { name: 'EODHD', fn: () => this._loadFromEODHD(symbol, fromDate, toDate, interval), available: this.eodApiKey }
      ];

      let mainSource = null;

      for (const source of forexSources) {
        if (!source.available) continue;
        
        try {
          console.log(`🔄 Пробуем ${source.name} для форекс...`);
          data = await source.fn();
          
          if (data && data.length > 0) {
            mainSource = source.name;
            console.log(`✅ Загружено ${data.length} свечей из ${source.name}`);
            
            // 🎯 ГИБРИДНАЯ МАГИЯ: Дополняем данные от других API
            if (source.name === 'Twelve Data' && this.alphaVantageKey) {
              // Twelve Data дал данные, но у него нет Bid/Ask
              // Получаем Bid/Ask от Alpha Vantage
              try {
                console.log('💎 Дополняем Bid/Ask спредом от Alpha Vantage...');
                const bidAskData = await this._getForexBidAsk(symbol);
                if (bidAskData) {
                  // Добавляем Bid/Ask к последней свече
                  if (data.length > 0) {
                    data[data.length - 1].Bid = bidAskData.bid;
                    data[data.length - 1].Ask = bidAskData.ask;
                    data[data.length - 1].Spread = bidAskData.spread;
                    console.log(`✅ Добавлен Bid/Ask спред: ${bidAskData.spread.toFixed(5)}`);
                  }
                }
              } catch (error) {
                console.warn(`⚠️ Не удалось получить Bid/Ask: ${error.message}`);
              }
            }
            
            this._saveToCache(cacheKey, data);
            return data;
          }
        } catch (error) {
          console.error(`❌ ${source.name} ошибка: ${error.message}`);
        }
      }
    }
    // КРИПТО: Приоритет - EODHD (платный, 30+ лет), потом Twelve Data, потом Binance
    else if (assetType === 'crypto') {
      // 🔥 ПРИОРИТЕТ #1: EODHD (платный план дает полную историю)
      if (this.eodApiKey) {
        try {
          console.log('🔄 Пробуем EODHD для криптовалюты (платный план - полная история)...');
          data = await this._loadFromEODHD(symbol, fromDate, toDate, interval);
          if (data && data.length > 0) {
            this._saveToCache(cacheKey, data);
            console.log(`✅ Загружено ${data.length} свечей из EODHD (полная история)`);
            return data;
          }
        } catch (eodError) {
          console.error(`❌ EODHD ошибка: ${eodError.message}`);
        }
      }

      // Приоритет #2: Twelve Data (бесплатный, но только 250 свечей)
      if (this.twelveDataKey) {
        try {
          console.log('🔄 Пробуем Twelve Data для криптовалюты (лимит 250 свечей)...');
          data = await this._loadFromTwelveData(symbol, fromDate, toDate, interval);
          if (data && data.length > 0) {
            this._saveToCache(cacheKey, data);
            console.log(`✅ Загружено ${data.length} свечей из Twelve Data`);
            return data;
          }
        } catch (error) {
          console.error(`❌ Twelve Data ошибка: ${error.message}`);
        }
      }

      // Последняя попытка - Binance (может быть заблокирован)
      try {
        console.log('🔄 Пробуем Binance для криптовалюты...');
        data = await this._loadFromBinance(symbol, fromDate, toDate, interval);
        if (data && data.length > 0) {
          this._saveToCache(cacheKey, data);
          console.log(`✅ Загружено ${data.length} свечей из Binance`);
          return data;
        }
      } catch (error) {
        console.error(`❌ Binance ошибка (возможно заблокирован в регионе): ${error.message}`);
      }
    }
    // АКЦИИ, ИНДЕКСЫ
    else {
      try {
        data = await this._loadFromEODHD(symbol, fromDate, toDate, interval);
        if (data && data.length > 0) {
          this._saveToCache(cacheKey, data);
          console.log(`✅ Загружено ${data.length} свечей из EODHD`);
          return data;
        }
      } catch (error) {
        console.error(`❌ EODHD ошибка: ${error.message}`);
      }
    }

    if (data && data.length > 0) {
      this._saveToCache(cacheKey, data);
      return data;
    }

    throw new Error(`Не удалось загрузить данные для ${symbol}`);
  }

  /**
   * Загрузка из Binance (криптовалюты)
   */
  async _loadFromBinance(symbol, fromDate, toDate, interval) {
    // Конвертируем символ (BTC -> BTCUSDT)
    const binanceSymbol = this._convertToBinanceSymbol(symbol);
    
    // Конвертируем интервал
    const binanceInterval = this._convertToBinanceInterval(interval);

    // Конвертируем даты в timestamp
    const startTime = new Date(fromDate).getTime();
    const endTime = new Date(toDate).getTime();
    
    console.log(`📊 Binance запрос: ${binanceSymbol}, ${binanceInterval}, ${new Date(startTime).toISOString()} - ${new Date(endTime).toISOString()}`);

    const url = `https://api.binance.com/api/v3/klines?symbol=${binanceSymbol}&interval=${binanceInterval}&startTime=${startTime}&endTime=${endTime}&limit=1000`;

    const response = await fetch(url);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Binance API error:', response.status, errorText);
      throw new Error(`Binance API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    
    console.log(`✅ Binance вернул ${data.length} свечей`);
    
    if (data.length === 0) {
      console.warn('⚠️ Binance вернул 0 свечей! Проверьте параметры запроса.');
    }

    // Конвертируем в наш формат
    return data.map(candle => ({
      Date: new Date(candle[0]).toISOString(),
      Open: parseFloat(candle[1]),
      High: parseFloat(candle[2]),
      Low: parseFloat(candle[3]),
      Close: parseFloat(candle[4]),
      Volume: parseFloat(candle[5])
    }));
  }

  /**
   * Загрузка из Twelve Data (форекс, акции, крипто)
   */
  async _loadFromTwelveData(symbol, fromDate, toDate, interval) {
    if (!this.twelveDataKey) {
      throw new Error('Twelve Data API key not configured');
    }

    // Конвертируем символ (EURUSD -> EUR/USD)
    const twelveSymbol = symbol.includes('/') ? symbol : symbol;
    
    // Конвертируем интервал
    const twelveInterval = this._convertToTwelveDataInterval(interval);
    
    console.log(`📊 Twelve Data запрос: ${twelveSymbol}, ${twelveInterval}`);

    const url = `https://api.twelvedata.com/time_series?symbol=${encodeURIComponent(twelveSymbol)}&interval=${twelveInterval}&start_date=${fromDate}&end_date=${toDate}&apikey=${this.twelveDataKey}&format=JSON`;

    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Twelve Data API error: ${response.status}`);
    }

    const result = await response.json();
    
    if (result.status === 'error') {
      throw new Error(`Twelve Data: ${result.message}`);
    }

    const data = result.values || [];
    
    console.log(`✅ Twelve Data вернул ${data.length} свечей`);
    
    // ⚠️ ВАЖНО: Twelve Data на бесплатном плане ограничен 250 свечами
    if (data.length >= 250) {
      console.warn('⚠️ Достигнут лимит Twelve Data (250 свечей на бесплатном плане)');
    }

    // Конвертируем в наш формат
    return data.map(candle => ({
      Date: candle.datetime,
      Open: parseFloat(candle.open),
      High: parseFloat(candle.high),
      Low: parseFloat(candle.low),
      Close: parseFloat(candle.close),
      Volume: parseFloat(candle.volume || 0)
    })).reverse(); // Twelve Data возвращает в обратном порядке
  }

  /**
   * Загрузка из Alpha Vantage (форекс)
   */
  async _loadFromAlphaVantage(symbol, fromDate, toDate, interval) {
    if (!this.alphaVantageKey) {
      throw new Error('Alpha Vantage API key not configured');
    }

    // Конвертируем символ (EUR/USD -> EUR, USD)
    const [fromCurrency, toCurrency] = symbol.replace('/', '').match(/.{1,3}/g) || [];
    
    if (!fromCurrency || !toCurrency) {
      throw new Error(`Invalid forex symbol: ${symbol}`);
    }

    // Alpha Vantage поддерживает только дневные данные для форекс
    const functionName = interval === '1d' ? 'FX_DAILY' : 'FX_INTRADAY';
    const intervalParam = interval === '1d' ? '' : `&interval=${interval}`;
    
    console.log(`📊 Alpha Vantage запрос: ${fromCurrency}/${toCurrency}`);

    const url = `https://www.alphavantage.co/query?function=${functionName}&from_symbol=${fromCurrency}&to_symbol=${toCurrency}${intervalParam}&outputsize=full&apikey=${this.alphaVantageKey}`;

    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Alpha Vantage API error: ${response.status}`);
    }

    const result = await response.json();
    
    if (result['Error Message']) {
      throw new Error(`Alpha Vantage: ${result['Error Message']}`);
    }

    const timeSeriesKey = Object.keys(result).find(key => key.includes('Time Series'));
    if (!timeSeriesKey) {
      throw new Error('Alpha Vantage: No time series data');
    }

    const timeSeries = result[timeSeriesKey];
    const data = [];

    // Фильтруем по датам
    const startDate = new Date(fromDate);
    const endDate = new Date(toDate);

    for (const [date, values] of Object.entries(timeSeries)) {
      const currentDate = new Date(date);
      if (currentDate >= startDate && currentDate <= endDate) {
        data.push({
          Date: date,
          Open: parseFloat(values['1. open']),
          High: parseFloat(values['2. high']),
          Low: parseFloat(values['3. low']),
          Close: parseFloat(values['4. close']),
          Volume: 0
        });
      }
    }
    
    console.log(`✅ Alpha Vantage вернул ${data.length} свечей`);

    // Сортируем по дате
    return data.sort((a, b) => new Date(a.Date) - new Date(b.Date));
  }

  /**
   * Загрузка из EODHD (акции, форекс, индексы)
   */
  async _loadFromEODHD(symbol, fromDate, toDate, interval) {
    if (!this.eodApiKey) {
      throw new Error('EOD API key not configured');
    }

    // 🔥 КОНВЕРТИРУЕМ СИМВОЛ ДЛЯ EODHD
    let eodSymbol = symbol;
    
    // Для крипто: BTC → BTC-USD.CC
    const cryptoSymbols = ['BTC', 'ETH', 'BNB', 'XRP', 'ADA', 'SOL', 'DOT', 'DOGE', 'AVAX', 'MATIC'];
    const upperSymbol = symbol.toUpperCase();
    
    for (const crypto of cryptoSymbols) {
      if (upperSymbol.startsWith(crypto) || upperSymbol === crypto) {
        eodSymbol = `${crypto}-USD.CC`;
        console.log(`🔄 Конвертируем ${symbol} → ${eodSymbol} для EODHD`);
        break;
      }
    }

    // Определяем endpoint
    const isIntraday = ['1m', '5m', '15m', '30m', '1h'].includes(interval);
    
    let url;
    if (isIntraday) {
      // Intraday данные
      url = `https://eodhistoricaldata.com/api/intraday/${eodSymbol}?api_token=${this.eodApiKey}&interval=${interval}&from=${fromDate}&to=${toDate}&fmt=json`;
    } else {
      // Дневные данные
      url = `https://eodhistoricaldata.com/api/eod/${eodSymbol}?api_token=${this.eodApiKey}&from=${fromDate}&to=${toDate}&fmt=json`;
    }
    
    console.log(`📊 EODHD запрос: ${url.replace(this.eodApiKey, 'API_KEY')}`);

    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`EODHD API error: ${response.status}`);
    }

    const data = await response.json();
    
    console.log(`✅ EODHD вернул ${data.length} свечей для ${eodSymbol}`);
    if (data.length > 0) {
      console.log(`📅 Первая свеча: ${data[0].date || data[0].datetime}`);
      console.log(`📅 Последняя свеча: ${data[data.length - 1].date || data[data.length - 1].datetime}`);
    }

    // Конвертируем в наш формат
    return data.map(candle => ({
      Date: candle.date || candle.datetime,
      Open: parseFloat(candle.open),
      High: parseFloat(candle.high),
      Low: parseFloat(candle.low),
      Close: parseFloat(candle.close),
      Volume: parseFloat(candle.volume || 0)
    }));
  }

  /**
   * Определяет тип актива по символу
   */
  _detectAssetType(symbol) {
    const cryptoSymbols = ['BTC', 'ETH', 'BNB', 'XRP', 'ADA', 'SOL', 'DOT', 'DOGE', 'AVAX', 'MATIC'];
    
    // Проверяем начало символа
    for (const crypto of cryptoSymbols) {
      if (symbol.toUpperCase().startsWith(crypto)) {
        return 'crypto';
      }
    }

    // Если содержит точку - это биржа (AAPL.US)
    if (symbol.includes('.')) {
      return 'stock';
    }

    // Если содержит слэш - это форекс (EUR/USD)
    if (symbol.includes('/')) {
      return 'forex';
    }

    // По умолчанию - акция
    return 'stock';
  }

  /**
   * Конвертирует символ для Binance
   */
  _convertToBinanceSymbol(symbol) {
    // BTC -> BTCUSDT
    // ETH -> ETHUSDT
    const clean = symbol.toUpperCase().replace(/[^A-Z]/g, '');
    
    if (clean.endsWith('USDT')) {
      return clean;
    }
    
    return clean + 'USDT';
  }

  /**
   * Конвертирует интервал для Binance
   */
  _convertToBinanceInterval(interval) {
    const map = {
      '1m': '1m',
      '5m': '5m',
      '15m': '15m',
      '30m': '30m',
      '1h': '1h',
      '4h': '4h',
      '1d': '1d',
      '1w': '1w'
    };
    
    return map[interval] || '1d';
  }

  /**
   * Конвертирует интервал для Twelve Data
   */
  _convertToTwelveDataInterval(interval) {
    const map = {
      '1m': '1min',
      '5m': '5min',
      '15m': '15min',
      '30m': '30min',
      '1h': '1h',
      '4h': '4h',
      '1d': '1day',
      '1w': '1week'
    };
    
    return map[interval] || '1day';
  }

  /**
   * 💎 ГИБРИДНАЯ ФУНКЦИЯ: Получить Bid/Ask спред от Alpha Vantage
   * Дополняет данные от Twelve Data
   */
  async _getForexBidAsk(symbol) {
    if (!this.alphaVantageKey) {
      return null;
    }

    try {
      // Конвертируем символ (EUR/USD -> EUR, USD)
      const [fromCurrency, toCurrency] = symbol.replace('/', '').match(/.{1,3}/g) || [];
      
      if (!fromCurrency || !toCurrency) {
        return null;
      }

      const url = `https://www.alphavantage.co/query?function=CURRENCY_EXCHANGE_RATE&from_currency=${fromCurrency}&to_currency=${toCurrency}&apikey=${this.alphaVantageKey}`;

      const response = await fetch(url);
      
      if (!response.ok) {
        return null;
      }

      const result = await response.json();
      
      if (!result['Realtime Currency Exchange Rate']) {
        return null;
      }

      const rate = result['Realtime Currency Exchange Rate'];
      const bid = parseFloat(rate['8. Bid Price']);
      const ask = parseFloat(rate['9. Ask Price']);
      const spread = ask - bid;

      return {
        bid: bid,
        ask: ask,
        spread: spread,
        lastRefreshed: rate['6. Last Refreshed']
      };
    } catch (error) {
      console.warn(`⚠️ Alpha Vantage Bid/Ask ошибка: ${error.message}`);
      return null;
    }
  }

  /**
   * Получить данные из кеша
   */
  _getFromCache(key) {
    const cached = this.cache.get(key);
    
    if (!cached) return null;
    
    // Проверяем не истек ли кеш
    if (Date.now() - cached.timestamp > this.cacheTimeout) {
      this.cache.delete(key);
      return null;
    }
    
    return cached.data;
  }

  /**
   * Сохранить в кеш
   */
  _saveToCache(key, data) {
    this.cache.set(key, {
      data: data,
      timestamp: Date.now()
    });
  }

  /**
   * Очистить кеш
   */
  clearCache() {
    this.cache.clear();
    console.log('🗑️ Кеш очищен');
  }

  /**
   * Получить список популярных активов
   */
  getPopularAssets() {
    return {
      crypto: [
        { symbol: 'BTC', name: 'Bitcoin' },
        { symbol: 'ETH', name: 'Ethereum' },
        { symbol: 'BNB', name: 'Binance Coin' },
        { symbol: 'XRP', name: 'Ripple' },
        { symbol: 'ADA', name: 'Cardano' },
        { symbol: 'SOL', name: 'Solana' },
        { symbol: 'DOT', name: 'Polkadot' },
        { symbol: 'DOGE', name: 'Dogecoin' }
      ],
      stocks: [
        { symbol: 'AAPL.US', name: 'Apple' },
        { symbol: 'TSLA.US', name: 'Tesla' },
        { symbol: 'MSFT.US', name: 'Microsoft' },
        { symbol: 'GOOGL.US', name: 'Google' },
        { symbol: 'AMZN.US', name: 'Amazon' },
        { symbol: 'META.US', name: 'Meta' },
        { symbol: 'NVDA.US', name: 'NVIDIA' }
      ],
      forex: [
        { symbol: 'EUR/USD', name: 'Euro / US Dollar', hasBidAsk: true },
        { symbol: 'GBP/USD', name: 'British Pound / US Dollar', hasBidAsk: true },
        { symbol: 'USD/JPY', name: 'US Dollar / Japanese Yen', hasBidAsk: true },
        { symbol: 'AUD/USD', name: 'Australian Dollar / US Dollar', hasBidAsk: true }
      ],
      indices: [
        { symbol: 'SPX.INDX', name: 'S&P 500' },
        { symbol: 'DJI.INDX', name: 'Dow Jones' },
        { symbol: 'IXIC.INDX', name: 'NASDAQ' }
      ]
    };
  }
}

module.exports = DataLoader;
