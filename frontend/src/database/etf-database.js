// etf-database.js - База данных ETF фондов
const ETF_DATABASE = [
    // Широкий рынок США (US Broad Market)
    { symbol: 'SPY', name: 'SPDR S&P 500 ETF Trust', category: 'Broad Market', focus: 'Large Cap' },
    { symbol: 'VOO', name: 'Vanguard S&P 500 ETF', category: 'Broad Market', focus: 'Large Cap' },
    { symbol: 'IVV', name: 'iShares Core S&P 500 ETF', category: 'Broad Market', focus: 'Large Cap' },
    { symbol: 'VTI', name: 'Vanguard Total Stock Market ETF', category: 'Broad Market', focus: 'Total Market' },
    { symbol: 'QQQ', name: 'Invesco QQQ Trust', category: 'Technology', focus: 'NASDAQ-100' },
    { symbol: 'DIA', name: 'SPDR Dow Jones Industrial Average ETF', category: 'Broad Market', focus: 'Dow Jones' },
    { symbol: 'IWM', name: 'iShares Russell 2000 ETF', category: 'Broad Market', focus: 'Small Cap' },
    
    // Технологии (Technology)
    { symbol: 'XLK', name: 'Technology Select Sector SPDR Fund', category: 'Technology', focus: 'Tech Sector' },
    { symbol: 'VGT', name: 'Vanguard Information Technology ETF', category: 'Technology', focus: 'IT' },
    { symbol: 'SOXX', name: 'iShares Semiconductor ETF', category: 'Technology', focus: 'Semiconductors' },
    { symbol: 'SMH', name: 'VanEck Semiconductor ETF', category: 'Technology', focus: 'Semiconductors' },
    { symbol: 'ARKK', name: 'ARK Innovation ETF', category: 'Technology', focus: 'Innovation' },
    { symbol: 'ARKW', name: 'ARK Next Generation Internet ETF', category: 'Technology', focus: 'Internet' },
    { symbol: 'WCLD', name: 'WisdomTree Cloud Computing Fund', category: 'Technology', focus: 'Cloud' },
    { symbol: 'HACK', name: 'ETFMG Prime Cyber Security ETF', category: 'Technology', focus: 'Cybersecurity' },
    
    // Финансы (Financials)
    { symbol: 'XLF', name: 'Financial Select Sector SPDR Fund', category: 'Financial', focus: 'Financials' },
    { symbol: 'VFH', name: 'Vanguard Financials ETF', category: 'Financial', focus: 'Financials' },
    { symbol: 'KRE', name: 'SPDR S&P Regional Banking ETF', category: 'Financial', focus: 'Regional Banks' },
    
    // Здравоохранение (Healthcare)
    { symbol: 'XLV', name: 'Health Care Select Sector SPDR Fund', category: 'Healthcare', focus: 'Healthcare' },
    { symbol: 'VHT', name: 'Vanguard Health Care ETF', category: 'Healthcare', focus: 'Healthcare' },
    { symbol: 'IBB', name: 'iShares Biotechnology ETF', category: 'Healthcare', focus: 'Biotech' },
    { symbol: 'XBI', name: 'SPDR S&P Biotech ETF', category: 'Healthcare', focus: 'Biotech' },
    
    // Энергия (Energy)
    { symbol: 'XLE', name: 'Energy Select Sector SPDR Fund', category: 'Energy', focus: 'Energy' },
    { symbol: 'VDE', name: 'Vanguard Energy ETF', category: 'Energy', focus: 'Energy' },
    { symbol: 'USO', name: 'United States Oil Fund', category: 'Commodities', focus: 'Oil' },
    { symbol: 'UNG', name: 'United States Natural Gas Fund', category: 'Commodities', focus: 'Natural Gas' },
    
    // Потребительский сектор (Consumer)
    { symbol: 'XLY', name: 'Consumer Discretionary Select Sector SPDR', category: 'Consumer', focus: 'Discretionary' },
    { symbol: 'XLP', name: 'Consumer Staples Select Sector SPDR Fund', category: 'Consumer', focus: 'Staples' },
    { symbol: 'VCR', name: 'Vanguard Consumer Discretionary ETF', category: 'Consumer', focus: 'Discretionary' },
    { symbol: 'VDC', name: 'Vanguard Consumer Staples ETF', category: 'Consumer', focus: 'Staples' },
    
    // Промышленность (Industrials)
    { symbol: 'XLI', name: 'Industrial Select Sector SPDR Fund', category: 'Industrial', focus: 'Industrials' },
    { symbol: 'VIS', name: 'Vanguard Industrials ETF', category: 'Industrial', focus: 'Industrials' },
    
    // Недвижимость (Real Estate)
    { symbol: 'XLRE', name: 'Real Estate Select Sector SPDR Fund', category: 'Real Estate', focus: 'REITs' },
    { symbol: 'VNQ', name: 'Vanguard Real Estate ETF', category: 'Real Estate', focus: 'REITs' },
    { symbol: 'IYR', name: 'iShares U.S. Real Estate ETF', category: 'Real Estate', focus: 'REITs' },
    
    // Коммуникации (Communications)
    { symbol: 'XLC', name: 'Communication Services Select Sector SPDR', category: 'Communication', focus: 'Communications' },
    { symbol: 'VOX', name: 'Vanguard Communication Services ETF', category: 'Communication', focus: 'Communications' },
    
    // Материалы (Materials)
    { symbol: 'XLB', name: 'Materials Select Sector SPDR Fund', category: 'Materials', focus: 'Materials' },
    { symbol: 'VAW', name: 'Vanguard Materials ETF', category: 'Materials', focus: 'Materials' },
    
    // Утилиты (Utilities)
    { symbol: 'XLU', name: 'Utilities Select Sector SPDR Fund', category: 'Utilities', focus: 'Utilities' },
    { symbol: 'VPU', name: 'Vanguard Utilities ETF', category: 'Utilities', focus: 'Utilities' },
    
    // Драгоценные металлы (Precious Metals)
    { symbol: 'GLD', name: 'SPDR Gold Trust', category: 'Commodities', focus: 'Gold' },
    { symbol: 'SLV', name: 'iShares Silver Trust', category: 'Commodities', focus: 'Silver' },
    { symbol: 'GDX', name: 'VanEck Gold Miners ETF', category: 'Commodities', focus: 'Gold Miners' },
    { symbol: 'GDXJ', name: 'VanEck Junior Gold Miners ETF', category: 'Commodities', focus: 'Junior Miners' },
    
    // Облигации (Bonds)
    { symbol: 'AGG', name: 'iShares Core U.S. Aggregate Bond ETF', category: 'Bonds', focus: 'Aggregate' },
    { symbol: 'BND', name: 'Vanguard Total Bond Market ETF', category: 'Bonds', focus: 'Total Bond' },
    { symbol: 'TLT', name: 'iShares 20+ Year Treasury Bond ETF', category: 'Bonds', focus: 'Long Treasury' },
    { symbol: 'IEF', name: 'iShares 7-10 Year Treasury Bond ETF', category: 'Bonds', focus: 'Mid Treasury' },
    { symbol: 'SHY', name: 'iShares 1-3 Year Treasury Bond ETF', category: 'Bonds', focus: 'Short Treasury' },
    { symbol: 'LQD', name: 'iShares iBoxx Investment Grade Corporate Bond', category: 'Bonds', focus: 'Corporate' },
    { symbol: 'HYG', name: 'iShares iBoxx High Yield Corporate Bond', category: 'Bonds', focus: 'High Yield' },
    
    // Международные (International)
    { symbol: 'EFA', name: 'iShares MSCI EAFE ETF', category: 'International', focus: 'Developed Markets' },
    { symbol: 'VEA', name: 'Vanguard FTSE Developed Markets ETF', category: 'International', focus: 'Developed Markets' },
    { symbol: 'EEM', name: 'iShares MSCI Emerging Markets ETF', category: 'International', focus: 'Emerging Markets' },
    { symbol: 'VWO', name: 'Vanguard FTSE Emerging Markets ETF', category: 'International', focus: 'Emerging Markets' },
    { symbol: 'FXI', name: 'iShares China Large-Cap ETF', category: 'International', focus: 'China' },
    { symbol: 'EWJ', name: 'iShares MSCI Japan ETF', category: 'International', focus: 'Japan' },
    { symbol: 'EWZ', name: 'iShares MSCI Brazil ETF', category: 'International', focus: 'Brazil' },
    
    // Дивиденды (Dividends)
    { symbol: 'VYM', name: 'Vanguard High Dividend Yield ETF', category: 'Dividends', focus: 'High Yield' },
    { symbol: 'SCHD', name: 'Schwab U.S. Dividend Equity ETF', category: 'Dividends', focus: 'Dividend Growth' },
    { symbol: 'DVY', name: 'iShares Select Dividend ETF', category: 'Dividends', focus: 'Dividends' },
    { symbol: 'SDY', name: 'SPDR S&P Dividend ETF', category: 'Dividends', focus: 'Dividend Aristocrats' },
    
    // Рост и Стоимость (Growth & Value)
    { symbol: 'VUG', name: 'Vanguard Growth ETF', category: 'Growth', focus: 'Growth' },
    { symbol: 'IWF', name: 'iShares Russell 1000 Growth ETF', category: 'Growth', focus: 'Large Cap Growth' },
    { symbol: 'VTV', name: 'Vanguard Value ETF', category: 'Value', focus: 'Value' },
    { symbol: 'IWD', name: 'iShares Russell 1000 Value ETF', category: 'Value', focus: 'Large Cap Value' },
    
    // Тематические (Thematic)
    { symbol: 'ICLN', name: 'iShares Global Clean Energy ETF', category: 'Thematic', focus: 'Clean Energy' },
    { symbol: 'TAN', name: 'Invesco Solar ETF', category: 'Thematic', focus: 'Solar' },
    { symbol: 'LIT', name: 'Global X Lithium & Battery Tech ETF', category: 'Thematic', focus: 'Lithium' },
    { symbol: 'BOTZ', name: 'Global X Robotics & AI ETF', category: 'Thematic', focus: 'Robotics & AI' },
    { symbol: 'ROBO', name: 'ROBO Global Robotics and Automation ETF', category: 'Thematic', focus: 'Automation' },
    { symbol: 'ESPO', name: 'VanEck Video Gaming and eSports ETF', category: 'Thematic', focus: 'Gaming' },
    { symbol: 'JETS', name: 'U.S. Global Jets ETF', category: 'Thematic', focus: 'Airlines' },
    { symbol: 'XHB', name: 'SPDR S&P Homebuilders ETF', category: 'Thematic', focus: 'Homebuilders' },
    
    // Дополнительные ETF (46-100)
    // Широкие рыночные индексы
    { symbol: 'ITOT', name: 'iShares Core S&P Total U.S. Stock Market ETF', category: 'Broad Market', focus: 'Total Market' },
    { symbol: 'SCHB', name: 'Schwab U.S. Broad Market ETF', category: 'Broad Market', focus: 'Total Market' },
    { symbol: 'SPTM', name: 'SPDR Portfolio S&P 1500 Composite Stock Market ETF', category: 'Broad Market', focus: 'Total Market' },
    { symbol: 'SCHX', name: 'Schwab U.S. Large-Cap ETF', category: 'Broad Market', focus: 'Large Cap' },
    { symbol: 'SCHM', name: 'Schwab U.S. Mid-Cap ETF', category: 'Broad Market', focus: 'Mid Cap' },
    { symbol: 'SCHA', name: 'Schwab U.S. Small-Cap ETF', category: 'Broad Market', focus: 'Small Cap' },
    
    // Международные рынки
    { symbol: 'IEFA', name: 'iShares Core MSCI EAFE ETF', category: 'International', focus: 'Developed Markets' },
    { symbol: 'IEMG', name: 'iShares Core MSCI Emerging Markets ETF', category: 'International', focus: 'Emerging Markets' },
    { symbol: 'IXUS', name: 'iShares Core MSCI Total International Stock ETF', category: 'International', focus: 'Ex-US' },
    { symbol: 'SCHF', name: 'Schwab International Equity ETF', category: 'International', focus: 'Developed Markets' },
    { symbol: 'SCHE', name: 'Schwab Emerging Markets Equity ETF', category: 'International', focus: 'Emerging Markets' },
    { symbol: 'VEU', name: 'Vanguard FTSE All-World ex-US ETF', category: 'International', focus: 'Ex-US' },
    { symbol: 'VWO', name: 'Vanguard FTSE Emerging Markets ETF', category: 'International', focus: 'Emerging Markets' },
    { symbol: 'VEA', name: 'Vanguard FTSE Developed Markets ETF', category: 'International', focus: 'Developed Markets' },
    { symbol: 'EFA', name: 'iShares MSCI EAFE ETF', category: 'International', focus: 'Developed Markets' },
    { symbol: 'EEM', name: 'iShares MSCI Emerging Markets ETF', category: 'International', focus: 'Emerging Markets' },
    
    // Облигации (Bonds)
    { symbol: 'AGG', name: 'iShares Core U.S. Aggregate Bond ETF', category: 'Bonds', focus: 'Aggregate' },
    { symbol: 'BND', name: 'Vanguard Total Bond Market ETF', category: 'Bonds', focus: 'Total Bond' },
    { symbol: 'SCHZ', name: 'Schwab U.S. Aggregate Bond ETF', category: 'Bonds', focus: 'Aggregate' },
    { symbol: 'LQD', name: 'iShares iBoxx $ Investment Grade Corporate Bond ETF', category: 'Bonds', focus: 'Corporate' },
    { symbol: 'HYG', name: 'iShares iBoxx $ High Yield Corporate Bond ETF', category: 'Bonds', focus: 'High Yield' },
    { symbol: 'JNK', name: 'SPDR Bloomberg High Yield Bond ETF', category: 'Bonds', focus: 'High Yield' },
    { symbol: 'TLT', name: 'iShares 20+ Year Treasury Bond ETF', category: 'Bonds', focus: 'Long Treasury' },
    { symbol: 'IEF', name: 'iShares 7-10 Year Treasury Bond ETF', category: 'Bonds', focus: 'Mid Treasury' },
    { symbol: 'SHY', name: 'iShares 1-3 Year Treasury Bond ETF', category: 'Bonds', focus: 'Short Treasury' },
    { symbol: 'TIP', name: 'iShares TIPS Bond ETF', category: 'Bonds', focus: 'Inflation Protected' },
    { symbol: 'MUB', name: 'iShares National Muni Bond ETF', category: 'Bonds', focus: 'Municipal' },
    { symbol: 'BNDX', name: 'Vanguard Total International Bond ETF', category: 'Bonds', focus: 'International' },
    
    // Дивидендные ETF
    { symbol: 'SCHD', name: 'Schwab U.S. Dividend Equity ETF', category: 'Dividend', focus: 'High Dividend' },
    { symbol: 'DVY', name: 'iShares Select Dividend ETF', category: 'Dividend', focus: 'Dividend' },
    { symbol: 'SDY', name: 'SPDR S&P Dividend ETF', category: 'Dividend', focus: 'Dividend Aristocrats' },
    { symbol: 'NOBL', name: 'ProShares S&P 500 Dividend Aristocrats ETF', category: 'Dividend', focus: 'Aristocrats' },
    { symbol: 'DGRO', name: 'iShares Core Dividend Growth ETF', category: 'Dividend', focus: 'Dividend Growth' },
    { symbol: 'VIG', name: 'Vanguard Dividend Appreciation ETF', category: 'Dividend', focus: 'Dividend Growth' },
    
    // Тематические и секторальные
    { symbol: 'ICLN', name: 'iShares Global Clean Energy ETF', category: 'Thematic', focus: 'Clean Energy' },
    { symbol: 'TAN', name: 'Invesco Solar ETF', category: 'Thematic', focus: 'Solar' },
    { symbol: 'QCLN', name: 'First Trust NASDAQ Clean Edge Green Energy', category: 'Thematic', focus: 'Green Energy' },
    { symbol: 'PBW', name: 'Invesco WilderHill Clean Energy ETF', category: 'Thematic', focus: 'Clean Energy' },
    { symbol: 'DRIV', name: 'Global X Autonomous & Electric Vehicles ETF', category: 'Thematic', focus: 'EV & Autonomous' },
    { symbol: 'IDRV', name: 'iShares Self-Driving EV and Tech ETF', category: 'Thematic', focus: 'Self-Driving' },
    { symbol: 'FINX', name: 'Global X FinTech ETF', category: 'Thematic', focus: 'FinTech' },
    { symbol: 'IPAY', name: 'ETFMG Prime Mobile Payments ETF', category: 'Thematic', focus: 'Digital Payments' },
    { symbol: 'CLOU', name: 'Global X Cloud Computing ETF', category: 'Thematic', focus: 'Cloud Computing' },
    { symbol: 'SKYY', name: 'First Trust Cloud Computing ETF', category: 'Thematic', focus: 'Cloud' },
    { symbol: 'HACK', name: 'ETFMG Prime Cyber Security ETF', category: 'Thematic', focus: 'Cybersecurity' },
    { symbol: 'CIBR', name: 'First Trust NASDAQ Cybersecurity ETF', category: 'Thematic', focus: 'Cybersecurity' },
    { symbol: 'BLOK', name: 'Amplify Transformational Data Sharing ETF', category: 'Thematic', focus: 'Blockchain' },
    { symbol: 'BITO', name: 'ProShares Bitcoin Strategy ETF', category: 'Crypto', focus: 'Bitcoin Futures' },
    { symbol: 'GBTC', name: 'Grayscale Bitcoin Trust', category: 'Crypto', focus: 'Bitcoin' }
];

// Делаем доступным глобально
if (typeof window !== 'undefined') {
    window.ETF_DATABASE = ETF_DATABASE;
}
