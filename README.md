# 🚀 Pattern Finder v4.0

Точный поиск паттернов на финансовых рынках с использованием алгоритма DTW (Dynamic Time Warping).

## 📁 Структура проекта

```
second version/
├── backend/              # Серверная часть (Node.js)
│   ├── server.js        # Основной сервер Express
│   ├── data-loader.js   # Загрузка данных с Binance/EOD
│   └── dtw-matcher.js   # Алгоритм поиска паттернов (DTW)
│
├── frontend/            # Клиентская часть
│   └── public/
│       ├── index.html   # Страница входа
│       ├── home.html    # Главная страница приложения
│       ├── src/
│       │   ├── components/  # React компоненты
│       │   ├── core/        # Основная логика (analyzer)
│       │   ├── utils/       # Утилиты и хелперы
│       │   └── database/    # Базы данных активов
│       └── assets/
│           └── css/         # Стили
│
├── docs/                # Документация
│   ├── README.md        # Основная документация
│   ├── SETUP.md         # Инструкции по установке
│   └── SUPPORTED_ASSETS.md  # Список поддерживаемых активов
│
├── .env                 # Переменные окружения (API ключи)
├── .env.example         # Пример файла .env
├── package.json         # Зависимости Node.js
└── node_modules/        # Установленные пакеты
```

## 🚀 Быстрый старт

```bash
# 1. Установить зависимости
npm install

# 2. Настроить .env файл
# Скопируйте .env.example в .env и добавьте API ключи

# 3. Запустить сервер
npm start

# 4. Открыть браузер
http://localhost:3000
```

## � API Ключи

Проект поддерживает несколько API для максимального покрытия активов:

### Для форекс (рекомендуется все 3):
1. **Twelve Data** (1436 пар) - https://twelvedata.com
2. **Alpha Vantage** (Bid/Ask спред) - https://www.alphavantage.co
3. **EOD Historical Data** (фоллбэк) - https://eodhistoricaldata.com

### Для криптовалют:
- **Binance API** - бесплатно, без ключа

Добавьте ключи в `.env` файл (см. `.env.example`)

## 🛠️ Технологии

- **Backend:** Node.js, Express
- **Frontend:** React, Lightweight Charts, Plotly.js
- **Алгоритмы:** DTW, Pattern Fingerprint
- **API:** Binance, Twelve Data, Alpha Vantage, EOD Historical Data

## 📊 Возможности

- ✅ Поиск похожих паттернов в исторических данных
- ✅ Поддержка криптовалют, акций, форекса, индексов
- ✅ Интерактивные графики с выделением областей
- ✅ Прогнозирование на основе исторических паттернов
- ✅ Автоматический анализ с ML алгоритмами

## 📝 Лицензия

MIT License - см. LICENSE файл

## 👨‍💻 Автор

MurodTrader
