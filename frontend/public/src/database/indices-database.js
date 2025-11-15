// indices-database.js - База данных индексов
const INDICES_DATABASE = [
    // США (US Indices)
    { symbol: '^GSPC', name: 'S&P 500', region: 'US', description: 'Standard & Poor\'s 500' },
    { symbol: '^DJI', name: 'Dow Jones Industrial Average', region: 'US', description: 'DJIA' },
    { symbol: '^IXIC', name: 'NASDAQ Composite', region: 'US', description: 'NASDAQ' },
    { symbol: '^RUT', name: 'Russell 2000', region: 'US', description: 'Small Cap Index' },
    { symbol: '^VIX', name: 'CBOE Volatility Index', region: 'US', description: 'Fear Index' },
    { symbol: '^NYA', name: 'NYSE Composite', region: 'US', description: 'NYSE' },
    
    // Европа (European Indices)
    { symbol: '^FTSE', name: 'FTSE 100', region: 'UK', description: 'Financial Times Stock Exchange' },
    { symbol: '^GDAXI', name: 'DAX', region: 'Germany', description: 'Deutscher Aktienindex' },
    { symbol: '^FCHI', name: 'CAC 40', region: 'France', description: 'Cotation Assistée en Continu' },
    { symbol: '^STOXX50E', name: 'EURO STOXX 50', region: 'Europe', description: 'Eurozone Blue Chip' },
    { symbol: '^AEX', name: 'AEX', region: 'Netherlands', description: 'Amsterdam Exchange Index' },
    { symbol: '^IBEX', name: 'IBEX 35', region: 'Spain', description: 'Spanish Stock Market Index' },
    { symbol: '^FTMIB', name: 'FTSE MIB', region: 'Italy', description: 'Milano Italia Borsa' },
    { symbol: '^SSMI', name: 'Swiss Market Index', region: 'Switzerland', description: 'SMI' },
    
    // Азия (Asian Indices)
    { symbol: '^N225', name: 'Nikkei 225', region: 'Japan', description: 'Tokyo Stock Exchange' },
    { symbol: '^HSI', name: 'Hang Seng Index', region: 'Hong Kong', description: 'HSI' },
    { symbol: '000001.SS', name: 'SSE Composite Index', region: 'China', description: 'Shanghai' },
    { symbol: '399001.SZ', name: 'Shenzhen Component', region: 'China', description: 'Shenzhen' },
    { symbol: '^KS11', name: 'KOSPI', region: 'South Korea', description: 'Korea Composite' },
    { symbol: '^TWII', name: 'Taiwan Weighted', region: 'Taiwan', description: 'TAIEX' },
    { symbol: '^STI', name: 'Straits Times Index', region: 'Singapore', description: 'STI' },
    { symbol: '^JKSE', name: 'Jakarta Composite', region: 'Indonesia', description: 'IDX' },
    { symbol: '^KLSE', name: 'FTSE Bursa Malaysia KLCI', region: 'Malaysia', description: 'KLCI' },
    { symbol: '^BSESN', name: 'S&P BSE SENSEX', region: 'India', description: 'Bombay Stock Exchange' },
    { symbol: '^NSEI', name: 'NIFTY 50', region: 'India', description: 'National Stock Exchange' },
    
    // Австралия и Океания (Australia & Oceania)
    { symbol: '^AXJO', name: 'S&P/ASX 200', region: 'Australia', description: 'Australian Securities Exchange' },
    { symbol: '^NZ50', name: 'S&P/NZX 50', region: 'New Zealand', description: 'New Zealand Exchange' },
    
    // Латинская Америка (Latin America)
    { symbol: '^BVSP', name: 'IBOVESPA', region: 'Brazil', description: 'Sao Paulo Stock Exchange' },
    { symbol: '^MXX', name: 'IPC Mexico', region: 'Mexico', description: 'Mexican Stock Exchange' },
    { symbol: '^MERV', name: 'MERVAL', region: 'Argentina', description: 'Buenos Aires Stock Exchange' },
    
    // Ближний Восток и Африка (Middle East & Africa)
    { symbol: '^TA125.TA', name: 'TA-125', region: 'Israel', description: 'Tel Aviv Stock Exchange' },
    { symbol: '^CASE30', name: 'EGX 30', region: 'Egypt', description: 'Egyptian Exchange' },
    { symbol: '^JN0U.JO', name: 'FTSE/JSE Top 40', region: 'South Africa', description: 'Johannesburg' },
    
    // Канада (Canada)
    { symbol: '^GSPTSE', name: 'S&P/TSX Composite', region: 'Canada', description: 'Toronto Stock Exchange' },
    
    // Дополнительные индексы (35-100)
    // США - Секторальные и тематические
    { symbol: '^NDX', name: 'NASDAQ-100', region: 'US', description: 'Top 100 Non-Financial NASDAQ' },
    { symbol: '^GSPC', name: 'S&P 500 Growth', region: 'US', description: 'S&P 500 Growth Index' },
    { symbol: '^SP500-45', name: 'S&P 500 Technology', region: 'US', description: 'Tech Sector' },
    { symbol: '^SP500-35', name: 'S&P 500 Healthcare', region: 'US', description: 'Healthcare Sector' },
    { symbol: '^SP500-25', name: 'S&P 500 Consumer Discretionary', region: 'US', description: 'Consumer Sector' },
    { symbol: '^SP500-15', name: 'S&P 500 Materials', region: 'US', description: 'Materials Sector' },
    { symbol: '^SP500-20', name: 'S&P 500 Industrials', region: 'US', description: 'Industrial Sector' },
    { symbol: '^SP500-10', name: 'S&P 500 Energy', region: 'US', description: 'Energy Sector' },
    { symbol: '^SP500-40', name: 'S&P 500 Financials', region: 'US', description: 'Financial Sector' },
    { symbol: '^SP500-60', name: 'S&P 500 Real Estate', region: 'US', description: 'Real Estate Sector' },
    { symbol: '^RUI', name: 'Russell 1000', region: 'US', description: 'Large Cap Index' },
    { symbol: '^RUA', name: 'Russell 3000', region: 'US', description: 'Broad Market Index' },
    { symbol: '^W5000', name: 'Wilshire 5000', region: 'US', description: 'Total Market Index' },
    { symbol: '^DJT', name: 'Dow Jones Transportation', region: 'US', description: 'Transportation Average' },
    { symbol: '^DJU', name: 'Dow Jones Utility', region: 'US', description: 'Utility Average' },
    
    // Европа - Дополнительные
    { symbol: '^FTMC', name: 'FTSE 250', region: 'UK', description: 'Mid Cap UK Index' },
    { symbol: '^FTLC', name: 'FTSE 350', region: 'UK', description: 'Large Cap UK Index' },
    { symbol: '^MDAXI', name: 'MDAX', region: 'Germany', description: 'Mid Cap Germany' },
    { symbol: '^SDAXI', name: 'SDAX', region: 'Germany', description: 'Small Cap Germany' },
    { symbol: '^TECDAX', name: 'TecDAX', region: 'Germany', description: 'Technology Germany' },
    { symbol: '^SBF120', name: 'SBF 120', region: 'France', description: 'French Stock Index' },
    { symbol: '^BFX', name: 'BEL 20', region: 'Belgium', description: 'Brussels Stock Exchange' },
    { symbol: '^ATX', name: 'ATX', region: 'Austria', description: 'Austrian Traded Index' },
    { symbol: '^OMXC25', name: 'OMX Copenhagen 25', region: 'Denmark', description: 'Danish Index' },
    { symbol: '^OMXS30', name: 'OMX Stockholm 30', region: 'Sweden', description: 'Swedish Index' },
    { symbol: '^OMXH25', name: 'OMX Helsinki 25', region: 'Finland', description: 'Finnish Index' },
    { symbol: '^OSEAX', name: 'Oslo Børs All-Share', region: 'Norway', description: 'Norwegian Index' },
    { symbol: '^PSI20', name: 'PSI 20', region: 'Portugal', description: 'Portuguese Index' },
    { symbol: '^ISEQ', name: 'ISEQ Overall', region: 'Ireland', description: 'Irish Stock Exchange' },
    { symbol: '^PX', name: 'PX Index', region: 'Czech Republic', description: 'Prague Stock Exchange' },
    { symbol: '^WIG', name: 'WIG', region: 'Poland', description: 'Warsaw Stock Exchange' },
    { symbol: '^BUX', name: 'BUX', region: 'Hungary', description: 'Budapest Stock Exchange' },
    { symbol: '^OMXR', name: 'OMX Riga', region: 'Latvia', description: 'Riga Stock Exchange' },
    { symbol: '^OMXT', name: 'OMX Tallinn', region: 'Estonia', description: 'Tallinn Stock Exchange' },
    { symbol: '^OMXV', name: 'OMX Vilnius', region: 'Lithuania', description: 'Vilnius Stock Exchange' },
    
    // Азия - Дополнительные
    { symbol: '^TOPX', name: 'TOPIX', region: 'Japan', description: 'Tokyo Stock Price Index' },
    { symbol: '^N300', name: 'Nikkei 300', region: 'Japan', description: 'Broad Japan Index' },
    { symbol: '^HSCE', name: 'Hang Seng China Enterprises', region: 'Hong Kong', description: 'H-Shares' },
    { symbol: '^HSTECH', name: 'Hang Seng TECH', region: 'Hong Kong', description: 'Tech Index HK' },
    { symbol: '000300.SS', name: 'CSI 300', region: 'China', description: 'China Securities Index' },
    { symbol: '000016.SH', name: 'SSE 50', region: 'China', description: 'Shanghai 50' },
    { symbol: '399006.SZ', name: 'ChiNext', region: 'China', description: 'Growth Enterprise Market' },
    { symbol: '^KS200', name: 'KOSPI 200', region: 'South Korea', description: 'Korea 200' },
    { symbol: '^KQ11', name: 'KOSDAQ', region: 'South Korea', description: 'Korea NASDAQ' },
    { symbol: '^TWSE', name: 'Taiwan Stock Exchange Weighted', region: 'Taiwan', description: 'TWSE' },
    { symbol: '^TWOII', name: 'Taiwan OTC', region: 'Taiwan', description: 'OTC Index' },
    { symbol: '^FTSTI', name: 'FTSE Straits Times', region: 'Singapore', description: 'Singapore Index' },
    { symbol: '^SET.BK', name: 'SET Index', region: 'Thailand', description: 'Stock Exchange of Thailand' },
    { symbol: '^PSEI', name: 'PSEi', region: 'Philippines', description: 'Philippine Stock Exchange' },
    { symbol: '^VNINDEX', name: 'VN-Index', region: 'Vietnam', description: 'Ho Chi Minh Stock Exchange' },
    { symbol: '^NSEBANK', name: 'Nifty Bank', region: 'India', description: 'Banking Index India' },
    { symbol: '^CNXIT', name: 'Nifty IT', region: 'India', description: 'IT Index India' },
    { symbol: '^CNXAUTO', name: 'Nifty Auto', region: 'India', description: 'Auto Index India' },
    
    // Ближний Восток - Дополнительные
    { symbol: '^TASI.SR', name: 'Tadawul All Share', region: 'Saudi Arabia', description: 'Saudi Stock Exchange' },
    { symbol: '^DFM', name: 'DFM General Index', region: 'UAE', description: 'Dubai Financial Market' },
    { symbol: '^ADI', name: 'ADX General Index', region: 'UAE', description: 'Abu Dhabi Securities Exchange' },
    { symbol: '^QSI', name: 'QE Index', region: 'Qatar', description: 'Qatar Exchange' },
    { symbol: '^KWSE', name: 'Kuwait All Share', region: 'Kuwait', description: 'Boursa Kuwait' },
    { symbol: '^TASI', name: 'Tadawul Index', region: 'Saudi Arabia', description: 'Saudi Index' },
    { symbol: '^DFMGI', name: 'DFM Index', region: 'UAE', description: 'Dubai Index' },
    
    // Латинская Америка - Дополнительные
    { symbol: '^IPSA', name: 'IPSA', region: 'Chile', description: 'Santiago Stock Exchange' },
    { symbol: '^COLCAP', name: 'COLCAP', region: 'Colombia', description: 'Colombian Stock Exchange' },
    { symbol: '^SPBLPGPT', name: 'S&P/BVL Peru General', region: 'Peru', description: 'Lima Stock Exchange' }
];

// Делаем доступным глобально
if (typeof window !== 'undefined') {
    window.INDICES_DATABASE = INDICES_DATABASE;
    window.indicesDatabase = INDICES_DATABASE; // Для AssetService
}
