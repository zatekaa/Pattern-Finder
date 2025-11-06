# 🌟 БЕСПЛАТНЫЕ API ДЛЯ АНАЛИЗА ТОВАРОВ (Золото, Медь, Нефть и т.д.)

## 📊 ЛУЧШИЕ БЕСПЛАТНЫЕ API ДЛЯ COMMODITIES

### 1. **Alpha Vantage** ⭐ РЕКОМЕНДУЕТСЯ
- **URL:** https://www.alphavantage.co/
- **Регистрация:** https://www.alphavantage.co/support/#api-key
- **Лимиты:** 5 запросов/минуту, 500 запросов/день (бесплатно)
- **Поддерживаемые товары:**
  - ✅ **WTI** (Нефть) - символ: `WTI`
  - ✅ **Brent** (Нефть) - символ: `BRENT_CRUDE_OIL`
  - ✅ **Natural Gas** - символ: `NATURAL_GAS`
  - ✅ **Copper** (Медь) - символ: `COPPER`
  - ✅ **Aluminum** - символ: `ALUMINUM`
  - ✅ **Wheat** (Пшеница) - символ: `WHEAT`
  - ✅ **Corn** (Кукуруза) - символ: `CORN`
  - ✅ **Cotton** - символ: `COTTON`
  - ✅ **Sugar** - символ: `SUGAR`
  - ✅ **Coffee** - символ: `COFFEE`

**Пример API запроса:**
```
https://www.alphavantage.co/query?function=WTI&interval=daily&apikey=YOUR_API_KEY
https://www.alphavantage.co/query?function=COPPER&interval=monthly&apikey=YOUR_API_KEY
```

**Интервалы:** daily, weekly, monthly

---

### 2. **Metals-API.com** ⭐⭐ ДЛЯ МЕТАЛЛОВ
- **URL:** https://metals-api.com/
- **Регистрация:** https://metals-api.com/signup/free
- **Лимиты:** 50 запросов/месяц (бесплатно)
- **Поддерживаемые металлы:**
  - ✅ **Золото (XAU)** - символ: `XAU`
  - ✅ **Серебро (XAG)** - символ: `XAG`
  - ✅ **Платина (XPT)** - символ: `XPT`
  - ✅ **Палладий (XPD)** - символ: `XPD`
  - ✅ **Медь (CU)** - символ: `COPPER`
  - ✅ **Алюминий (ALU)** - символ: `ALU`
  - ✅ **Никель (NI)** - символ: `NI`
  - ✅ **Цинк (ZNC)** - символ: `ZNC`
  - ✅ **Свинец (LEAD)** - символ: `LEAD`

**Пример API запроса:**
```
https://metals-api.com/api/latest?access_key=YOUR_API_KEY&base=USD&symbols=XAU,XAG,COPPER
https://metals-api.com/api/timeseries?access_key=YOUR_API_KEY&start_date=2024-01-01&end_date=2024-12-31&symbols=XAU
```

---

### 3. **Commodities-API.com**
- **URL:** https://commodities-api.com/
- **Регистрация:** https://commodities-api.com/signup/free
- **Лимиты:** 100 запросов/месяц (бесплатно)
- **Поддерживаемые товары:**
  - ✅ **Нефть WTI** - символ: `WTIOIL`
  - ✅ **Нефть Brent** - символ: `BRENTOIL`
  - ✅ **Природный газ** - символ: `NG`
  - ✅ **Пшеница** - символ: `WHEAT`
  - ✅ **Кукуруза** - символ: `CORN`
  - ✅ **Соевые бобы** - символ: `SOYBEAN`
  - ✅ **Сахар** - символ: `SUGAR`
  - ✅ **Кофе** - символ: `COFFEE`
  - ✅ **Хлопок** - символ: `COTTON`

**Пример API запроса:**
```
https://commodities-api.com/api/latest?access_key=YOUR_API_KEY&base=USD&symbols=WTIOIL,BRENTOIL
```

---

### 4. **Twelve Data** ⭐
- **URL:** https://twelvedata.com/
- **Регистрация:** https://twelvedata.com/pricing
- **Лимиты:** 800 запросов/день (бесплатно)
- **Поддерживаемые товары:**
  - ✅ Золото, Серебро через CFD
  - ✅ Нефть (WTI, Brent)
  - ✅ Природный газ
  - ✅ Медь и другие металлы

**Пример API запроса:**
```
https://api.twelvedata.com/time_series?symbol=XAU/USD&interval=1day&apikey=YOUR_API_KEY
https://api.twelvedata.com/time_series?symbol=CL&interval=1h&apikey=YOUR_API_KEY
```

---

### 5. **Finnhub (Commodities через CFD)**
- **URL:** https://finnhub.io/
- **Регистрация:** https://finnhub.io/register
- **Лимиты:** 60 запросов/минуту (бесплатно)
- **Поддерживаемые товары:**
  - ✅ **OANDA:XAU_USD** (Золото)
  - ✅ **OANDA:XAG_USD** (Серебро)
  - ✅ **OANDA:BCO_USD** (Нефть Brent)
  - ✅ **OANDA:WTICO_USD** (Нефть WTI)
  - ✅ **OANDA:NATGAS_USD** (Природный газ)
  - ✅ **OANDA:CORN_USD** (Кукуруза)
  - ✅ **OANDA:WHEAT_USD** (Пшеница)

**Пример API запроса:**
```
https://finnhub.io/api/v1/forex/candle?symbol=OANDA:XAU_USD&resolution=D&from=1672531200&to=1704067200&token=YOUR_API_KEY
```

---

### 6. **Yahoo Finance** (Бесплатно, без ключа!)
- **URL:** https://query1.finance.yahoo.com
- **Лимиты:** Нет официального лимита
- **Поддерживаемые товары через ETF:**
  - ✅ **GLD** - SPDR Gold Trust (Золото)
  - ✅ **SLV** - iShares Silver Trust (Серебро)
  - ✅ **USO** - United States Oil Fund (Нефть)
  - ✅ **UNG** - United States Natural Gas Fund
  - ✅ **COPX** - Global X Copper Miners ETF (Медь)
  - ✅ **PALL** - Aberdeen Physical Palladium Shares ETF
  - ✅ **PPLT** - Aberdeen Physical Platinum Shares ETF
  - ✅ **DBA** - Invesco DB Agriculture Fund
  - ✅ **CORN** - Teucrium Corn Fund
  - ✅ **WEAT** - Teucrium Wheat Fund

**Пример API запроса:**
```
https://query1.finance.yahoo.com/v8/finance/chart/GLD?interval=1d&range=1y
https://query1.finance.yahoo.com/v8/finance/chart/COPX?interval=1h&range=1mo
```

---

### 7. **World Bank Commodities API** (Бесплатно!)
- **URL:** https://www.worldbank.org/en/research/commodity-markets
- **API Endpoint:** https://api.worldbank.org/v2/
- **Лимиты:** Без ограничений
- **Поддерживаемые товары:** Месячные данные по всем основным товарам

**Пример:**
```
https://api.worldbank.org/v2/country/all/indicator/PGOLD?format=json&date=2020:2024
```

---

### 8. **Polygon.io** 
- **URL:** https://polygon.io/
- **Лимиты:** 5 запросов/минуту (бесплатно)
- **Поддерживаемые товары:**
  - ✅ Золото (X:XAUUSD)
  - ✅ Серебро (X:XAGUSD)
  - ✅ Нефть (X:CLNOUSD)
  - ✅ Медь и другие

---

## 📋 СРАВНИТЕЛЬНАЯ ТАБЛИЦА

| API | Лимиты (бесплатно) | Золото | Серебро | Медь | Нефть | Газ | Зерно |
|-----|-------------------|---------|----------|-------|--------|-----|-------|
| **Alpha Vantage** | 500/день | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ |
| **Metals-API** | 50/месяц | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Commodities-API** | 100/месяц | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ |
| **Twelve Data** | 800/день | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| **Finnhub** | 60/мин | ✅ | ✅ | ❌ | ✅ | ✅ | ✅ |
| **Yahoo Finance** | Безлимит* | ✅ (ETF) | ✅ (ETF) | ✅ (ETF) | ✅ (ETF) | ✅ (ETF) | ✅ (ETF) |

*Неофициально безлимит, но может блокировать при злоупотреблении

---

## 🎯 РЕКОМЕНДАЦИИ ДЛЯ ВАШЕГО ПРОЕКТА

### ДЛЯ ЗОЛОТА И СЕРЕБРА:
1. **Metals-API.com** - специализированный API для драгметаллов
2. **Yahoo Finance** через ETF (GLD, SLV) - бесплатно и без лимитов
3. **Finnhub** - OANDA:XAU_USD, OANDA:XAG_USD

### ДЛЯ МЕДИ:
1. **Alpha Vantage** - прямые данные
2. **Yahoo Finance** через COPX ETF
3. **Metals-API.com**

### ДЛЯ НЕФТИ И ГАЗА:
1. **Alpha Vantage** - WTI, Brent
2. **Commodities-API.com**
3. **Yahoo Finance** через USO, UNG

### ДЛЯ СЕЛЬХОЗПРОДУКЦИИ:
1. **Alpha Vantage** - Wheat, Corn, Cotton, Sugar, Coffee
2. **Commodities-API.com**
3. **Yahoo Finance** через DBA, CORN, WEAT

---

## 💡 КАК ДОБАВИТЬ В ВАШ ПРОЕКТ

### Шаг 1: Регистрация
Зарегистрируйтесь на:
- ✅ **Metals-API.com** (для золота/серебра/меди)
- ✅ **Alpha Vantage** (для всех товаров)
- ✅ **Commodities-API.com** (для нефти/газа/зерна)

### Шаг 2: Получите API ключи
Сохраните ключи в `.env`:
```bash
METALS_API_KEY=ваш_ключ
ALPHA_VANTAGE_API_KEY=ваш_ключ
COMMODITIES_API_KEY=ваш_ключ
```

### Шаг 3: Добавьте в Vercel Environment Variables
В Vercel Dashboard → Settings → Environment Variables добавьте эти ключи

### Шаг 4: Создайте API endpoints
Создайте файлы в `/api/`:
- `api/metals-api.js` - для Metals-API
- `api/commodities-api.js` - для Commodities-API

### Шаг 5: Обновите analyzer.js
Добавьте методы для получения данных о товарах через новые API

---

## 📌 ВАЖНЫЕ ЗАМЕЧАНИЯ

1. **Yahoo Finance** - ЛУЧШИЙ вариант для начала:
   - Бесплатно
   - Нет регистрации
   - Много ETF для товаров
   - Уже интегрирован в ваш проект!

2. **Metals-API** - Специально для металлов:
   - Лучшие данные по золоту/серебру/меди
   - Простой API
   - 50 запросов/месяц хватит для тестов

3. **Alpha Vantage** - Универсальный:
   - Много товаров
   - Хорошая документация
   - 500 запросов/день достаточно

4. **Комбинируйте API:**
   - Metals-API для драгметаллов
   - Alpha Vantage для энергоносителей
   - Yahoo Finance как fallback

---

## 🚀 БЫСТРЫЙ СТАРТ

### Используйте Yahoo Finance (уже есть в проекте!)
Товары доступны через ETF символы:
```javascript
// В вашем analyzer.js уже работает:
await analyzer.getAssetData('GLD');    // Золото
await analyzer.getAssetData('SLV');    // Серебро  
await analyzer.getAssetData('COPX');   // Медь
await analyzer.getAssetData('USO');    // Нефть
await analyzer.getAssetData('UNG');    // Газ
```

Эти символы **УЖЕ РАБОТАЮТ** в вашем приложении!

---

## 📞 КОНТАКТЫ И ДОКУМЕНТАЦИЯ

- **Alpha Vantage Docs:** https://www.alphavantage.co/documentation/
- **Metals-API Docs:** https://metals-api.com/documentation
- **Commodities-API Docs:** https://commodities-api.com/documentation
- **Twelve Data Docs:** https://twelvedata.com/docs
- **Finnhub Docs:** https://finnhub.io/docs/api

---

**Примечание:** Для production рекомендуется использовать платные планы с большими лимитами, но для разработки и тестирования бесплатных версий более чем достаточно!
