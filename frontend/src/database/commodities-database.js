// commodities-database.js - База данных товаров: металлы, нефть, газ и др.
const COMMODITIES_DATABASE = [
    // Драгоценные металлы (Precious Metals)
    { symbol: 'XAUUSD', name: 'Gold / US Dollar', category: 'Precious Metals', type: 'forex' },
    { symbol: 'XAGUSD', name: 'Silver / US Dollar', category: 'Precious Metals', type: 'forex' },
    { symbol: 'XPTUSD', name: 'Platinum / US Dollar', category: 'Precious Metals', type: 'forex' },
    { symbol: 'XPDUSD', name: 'Palladium / US Dollar', category: 'Precious Metals', type: 'forex' },
    
    // ETF на золото и серебро
    { symbol: 'GLD', name: 'SPDR Gold Trust', category: 'Gold ETF', type: 'stock' },
    { symbol: 'SLV', name: 'iShares Silver Trust', category: 'Silver ETF', type: 'stock' },
    { symbol: 'GDX', name: 'VanEck Gold Miners ETF', category: 'Gold Miners ETF', type: 'stock' },
    { symbol: 'GDXJ', name: 'VanEck Junior Gold Miners ETF', category: 'Junior Gold Miners ETF', type: 'stock' },
    { symbol: 'IAU', name: 'iShares Gold Trust', category: 'Gold ETF', type: 'stock' },
    { symbol: 'PPLT', name: 'Aberdeen Standard Platinum Shares ETF', category: 'Platinum ETF', type: 'stock' },
    { symbol: 'PALL', name: 'Aberdeen Standard Palladium Shares ETF', category: 'Palladium ETF', type: 'stock' },
    
    // Энергоносители (Energy)
    { symbol: 'USOIL', name: 'US Crude Oil', category: 'Energy', type: 'forex' },
    { symbol: 'UKOIL', name: 'Brent Crude Oil', category: 'Energy', type: 'forex' },
    { symbol: 'NGAS', name: 'Natural Gas', category: 'Energy', type: 'forex' },
    
    // ETF на нефть и газ
    { symbol: 'USO', name: 'United States Oil Fund', category: 'Oil ETF', type: 'stock' },
    { symbol: 'UNG', name: 'United States Natural Gas Fund', category: 'Gas ETF', type: 'stock' },
    { symbol: 'XLE', name: 'Energy Select Sector SPDR Fund', category: 'Energy Sector ETF', type: 'stock' },
    { symbol: 'XOP', name: 'SPDR S&P Oil & Gas Exploration & Production ETF', category: 'Oil & Gas ETF', type: 'stock' },
    
    // Промышленные металлы (Industrial Metals)
    { symbol: 'XCUUSD', name: 'Copper / US Dollar', category: 'Industrial Metals', type: 'forex' },
    { symbol: 'COPX', name: 'Global X Copper Miners ETF', category: 'Copper ETF', type: 'stock' },
    
    // Сельскохозяйственные товары (Agricultural)
    { symbol: 'CORN', name: 'Teucrium Corn Fund', category: 'Agricultural ETF', type: 'stock' },
    { symbol: 'WEAT', name: 'Teucrium Wheat Fund', category: 'Agricultural ETF', type: 'stock' },
    { symbol: 'SOYB', name: 'Teucrium Soybean Fund', category: 'Agricultural ETF', type: 'stock' },
    { symbol: 'DBA', name: 'Invesco DB Agriculture Fund', category: 'Agricultural ETF', type: 'stock' },
    
    // Широкие товарные индексы (Broad Commodities)
    { symbol: 'DBC', name: 'Invesco DB Commodity Index Tracking Fund', category: 'Broad Commodities ETF', type: 'stock' },
    { symbol: 'GSG', name: 'iShares S&P GSCI Commodity-Indexed Trust', category: 'Broad Commodities ETF', type: 'stock' },
    { symbol: 'PDBC', name: 'Invesco Optimum Yield Diversified Commodity Strategy', category: 'Broad Commodities ETF', type: 'stock' },
    
    // Дополнительные товары (32-100)
    // Драгоценные металлы - дополнительные ETF
    { symbol: 'SGOL', name: 'abrdn Physical Gold Shares ETF', category: 'Gold ETF', type: 'stock' },
    { symbol: 'AAAU', name: 'Goldman Sachs Physical Gold ETF', category: 'Gold ETF', type: 'stock' },
    { symbol: 'BAR', name: 'GraniteShares Gold Trust', category: 'Gold ETF', type: 'stock' },
    { symbol: 'GLDM', name: 'SPDR Gold MiniShares Trust', category: 'Gold ETF', type: 'stock' },
    { symbol: 'SIVR', name: 'Aberdeen Standard Physical Silver Shares ETF', category: 'Silver ETF', type: 'stock' },
    { symbol: 'PSLV', name: 'Sprott Physical Silver Trust', category: 'Silver ETF', type: 'stock' },
    { symbol: 'PHYS', name: 'Sprott Physical Gold Trust', category: 'Gold ETF', type: 'stock' },
    { symbol: 'GLTR', name: 'Aberdeen Standard Physical Precious Metals Basket', category: 'Precious Metals ETF', type: 'stock' },
    
    // Энергоносители - дополнительные ETF
    { symbol: 'UCO', name: 'ProShares Ultra Bloomberg Crude Oil', category: 'Oil ETF', type: 'stock' },
    { symbol: 'DBO', name: 'Invesco DB Oil Fund', category: 'Oil ETF', type: 'stock' },
    { symbol: 'USL', name: 'United States 12 Month Oil Fund', category: 'Oil ETF', type: 'stock' },
    { symbol: 'BNO', name: 'United States Brent Oil Fund', category: 'Oil ETF', type: 'stock' },
    { symbol: 'BOIL', name: 'ProShares Ultra Bloomberg Natural Gas', category: 'Gas ETF', type: 'stock' },
    { symbol: 'KOLD', name: 'ProShares UltraShort Bloomberg Natural Gas', category: 'Gas ETF', type: 'stock' },
    { symbol: 'OIH', name: 'VanEck Oil Services ETF', category: 'Oil Services ETF', type: 'stock' },
    { symbol: 'IEO', name: 'iShares U.S. Oil & Gas Exploration & Production ETF', category: 'Oil & Gas ETF', type: 'stock' },
    { symbol: 'IEZ', name: 'iShares U.S. Oil Equipment & Services ETF', category: 'Oil Services ETF', type: 'stock' },
    { symbol: 'AMLP', name: 'Alerian MLP ETF', category: 'Energy Infrastructure ETF', type: 'stock' },
    { symbol: 'MLPA', name: 'Global X MLP ETF', category: 'Energy Infrastructure ETF', type: 'stock' },
    { symbol: 'AMJ', name: 'JPMorgan Alerian MLP Index ETN', category: 'Energy Infrastructure ETF', type: 'stock' },
    
    // Промышленные металлы - дополнительные
    { symbol: 'CPER', name: 'United States Copper Index Fund', category: 'Copper ETF', type: 'stock' },
    { symbol: 'JJC', name: 'iPath Series B Bloomberg Copper Subindex Total Return ETN', category: 'Copper ETF', type: 'stock' },
    { symbol: 'DBB', name: 'Invesco DB Base Metals Fund', category: 'Base Metals ETF', type: 'stock' },
    { symbol: 'JJM', name: 'iPath Series B Bloomberg Industrial Metals Subindex Total Return ETN', category: 'Industrial Metals ETF', type: 'stock' },
    { symbol: 'PICK', name: 'iShares MSCI Global Metals & Mining Producers ETF', category: 'Metals & Mining ETF', type: 'stock' },
    { symbol: 'XME', name: 'SPDR S&P Metals & Mining ETF', category: 'Metals & Mining ETF', type: 'stock' },
    { symbol: 'REMX', name: 'VanEck Rare Earth/Strategic Metals ETF', category: 'Rare Earth Metals ETF', type: 'stock' },
    { symbol: 'SIL', name: 'Global X Silver Miners ETF', category: 'Silver Miners ETF', type: 'stock' },
    
    // Сельскохозяйственные товары - дополнительные
    { symbol: 'TAGS', name: 'Teucrium Agricultural Fund', category: 'Agricultural ETF', type: 'stock' },
    { symbol: 'CANE', name: 'Teucrium Sugar Fund', category: 'Agricultural ETF', type: 'stock' },
    { symbol: 'COW', name: 'iPath Series B Bloomberg Livestock Subindex Total Return ETN', category: 'Livestock ETF', type: 'stock' },
    { symbol: 'JJA', name: 'iPath Series B Bloomberg Agriculture Subindex Total Return ETN', category: 'Agricultural ETF', type: 'stock' },
    { symbol: 'JJG', name: 'iPath Series B Bloomberg Grains Subindex Total Return ETN', category: 'Grains ETF', type: 'stock' },
    { symbol: 'JJS', name: 'iPath Series B Bloomberg Softs Subindex Total Return ETN', category: 'Softs ETF', type: 'stock' },
    { symbol: 'NIB', name: 'iPath Series B Bloomberg Cocoa Subindex Total Return ETN', category: 'Cocoa ETF', type: 'stock' },
    { symbol: 'JO', name: 'iPath Series B Bloomberg Coffee Subindex Total Return ETN', category: 'Coffee ETF', type: 'stock' },
    { symbol: 'BAL', name: 'iPath Series B Bloomberg Cotton Subindex Total Return ETN', category: 'Cotton ETF', type: 'stock' },
    { symbol: 'MOO', name: 'VanEck Agribusiness ETF', category: 'Agribusiness ETF', type: 'stock' },
    
    // Широкие товарные индексы - дополнительные
    { symbol: 'USCI', name: 'United States Commodity Index Fund', category: 'Broad Commodities ETF', type: 'stock' },
    { symbol: 'COMT', name: 'iShares Commodities Select Strategy ETF', category: 'Broad Commodities ETF', type: 'stock' },
    { symbol: 'GCC', name: 'WisdomTree Continuous Commodity Index Fund', category: 'Broad Commodities ETF', type: 'stock' },
    { symbol: 'CMDY', name: 'iShares Bloomberg Roll Select Commodity Strategy ETF', category: 'Broad Commodities ETF', type: 'stock' },
    { symbol: 'BCI', name: 'Aberdeen Standard Bloomberg All Commodity Strategy K-1 Free ETF', category: 'Broad Commodities ETF', type: 'stock' },
    { symbol: 'FTGC', name: 'First Trust Global Tactical Commodity Strategy Fund', category: 'Broad Commodities ETF', type: 'stock' },
    
    // Форекс пары с товарами (дополнительные)
    { symbol: 'XBRUSD', name: 'Brent Crude Oil / US Dollar', category: 'Energy', type: 'forex' },
    { symbol: 'XTIUSD', name: 'WTI Crude Oil / US Dollar', category: 'Energy', type: 'forex' },
    { symbol: 'XNGUSD', name: 'Natural Gas / US Dollar', category: 'Energy', type: 'forex' },
    { symbol: 'XALUSD', name: 'Aluminum / US Dollar', category: 'Industrial Metals', type: 'forex' },
    { symbol: 'XZNUSD', name: 'Zinc / US Dollar', category: 'Industrial Metals', type: 'forex' },
    { symbol: 'XNIUSD', name: 'Nickel / US Dollar', category: 'Industrial Metals', type: 'forex' },
    { symbol: 'XPBUSD', name: 'Lead / US Dollar', category: 'Industrial Metals', type: 'forex' },
    { symbol: 'XSNUSD', name: 'Tin / US Dollar', category: 'Industrial Metals', type: 'forex' },
    
    // Специализированные товарные ETF
    { symbol: 'WOOD', name: 'iShares Global Timber & Forestry ETF', category: 'Timber ETF', type: 'stock' },
    { symbol: 'GUNR', name: 'FlexShares Morningstar Global Upstream Natural Resources Index Fund', category: 'Natural Resources ETF', type: 'stock' },
    { symbol: 'IGE', name: 'iShares North American Natural Resources ETF', category: 'Natural Resources ETF', type: 'stock' },
    { symbol: 'PAVE', name: 'Global X U.S. Infrastructure Development ETF', category: 'Infrastructure ETF', type: 'stock' },
    { symbol: 'IFRA', name: 'iShares U.S. Infrastructure ETF', category: 'Infrastructure ETF', type: 'stock' },
    { symbol: 'KRBN', name: 'KraneShares Global Carbon Strategy ETF', category: 'Carbon Credits ETF', type: 'stock' },
    { symbol: 'URA', name: 'Global X Uranium ETF', category: 'Uranium ETF', type: 'stock' },
    { symbol: 'URNM', name: 'Sprott Uranium Miners ETF', category: 'Uranium Miners ETF', type: 'stock' },
    { symbol: 'BATT', name: 'Amplify Lithium & Battery Technology ETF', category: 'Battery Metals ETF', type: 'stock' }
];

// Делаем доступным глобально
if (typeof window !== 'undefined') {
    window.COMMODITIES_DATABASE = COMMODITIES_DATABASE;
}
