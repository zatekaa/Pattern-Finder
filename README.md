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
│
├── .env.example         # Пример файла .env
├── package.json         # Зависимости Node.js
└── node_modules/        # Установленные пакеты
```

## 🛠️ Технологии

- **Backend:** Node.js, Express
- **Frontend:** React, Lightweight Charts, Plotly.js
- **Алгоритмы:** DTW, Pattern Fingerprint

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
