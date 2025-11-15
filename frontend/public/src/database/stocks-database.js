// stocks-database.js - База данных акций (150+ компаний)
const STOCKS_DATABASE = [
    // Tech Giants - FAANG+
    { symbol: 'AAPL', name: 'Apple Inc.', sector: 'Technology' },
    { symbol: 'MSFT', name: 'Microsoft Corporation', sector: 'Technology' },
    { symbol: 'GOOGL', name: 'Alphabet Inc.', sector: 'Technology' },
    { symbol: 'GOOG', name: 'Alphabet Inc. Class C', sector: 'Technology' },
    { symbol: 'AMZN', name: 'Amazon.com Inc.', sector: 'Consumer' },
    { symbol: 'META', name: 'Meta Platforms Inc.', sector: 'Technology' },
    { symbol: 'NVDA', name: 'NVIDIA Corporation', sector: 'Technology' },
    { symbol: 'TSLA', name: 'Tesla Inc.', sector: 'Automotive' },
    { symbol: 'NFLX', name: 'Netflix Inc.', sector: 'Entertainment' },
    
    // Semiconductors & Hardware
    { symbol: 'AMD', name: 'Advanced Micro Devices', sector: 'Technology' },
    { symbol: 'INTC', name: 'Intel Corporation', sector: 'Technology' },
    { symbol: 'QCOM', name: 'Qualcomm Inc.', sector: 'Technology' },
    { symbol: 'TXN', name: 'Texas Instruments', sector: 'Technology' },
    { symbol: 'AMAT', name: 'Applied Materials', sector: 'Technology' },
    { symbol: 'MU', name: 'Micron Technology', sector: 'Technology' },
    { symbol: 'AVGO', name: 'Broadcom Inc.', sector: 'Technology' },
    { symbol: 'TSM', name: 'Taiwan Semiconductor', sector: 'Technology' },
    { symbol: 'ASML', name: 'ASML Holding', sector: 'Technology' },
    { symbol: 'LRCX', name: 'Lam Research Corp.', sector: 'Technology' },
    { symbol: 'KLAC', name: 'KLA Corporation', sector: 'Technology' },
    { symbol: 'MRVL', name: 'Marvell Technology', sector: 'Technology' },
    { symbol: 'NXPI', name: 'NXP Semiconductors', sector: 'Technology' },
    { symbol: 'ADI', name: 'Analog Devices Inc.', sector: 'Technology' },
    
    // Software & Cloud
    { symbol: 'ORCL', name: 'Oracle Corporation', sector: 'Technology' },
    { symbol: 'CRM', name: 'Salesforce Inc.', sector: 'Technology' },
    { symbol: 'ADBE', name: 'Adobe Inc.', sector: 'Technology' },
    { symbol: 'NOW', name: 'ServiceNow Inc.', sector: 'Technology' },
    { symbol: 'SNOW', name: 'Snowflake Inc.', sector: 'Technology' },
    { symbol: 'WDAY', name: 'Workday Inc.', sector: 'Technology' },
    { symbol: 'TEAM', name: 'Atlassian Corporation', sector: 'Technology' },
    { symbol: 'DOCU', name: 'DocuSign Inc.', sector: 'Technology' },
    { symbol: 'ZM', name: 'Zoom Video Communications', sector: 'Technology' },
    { symbol: 'TWLO', name: 'Twilio Inc.', sector: 'Technology' },
    { symbol: 'OKTA', name: 'Okta Inc.', sector: 'Technology' },
    { symbol: 'MDB', name: 'MongoDB Inc.', sector: 'Technology' },
    { symbol: 'SPLK', name: 'Splunk Inc.', sector: 'Technology' },
    
    // Cybersecurity
    { symbol: 'PANW', name: 'Palo Alto Networks', sector: 'Technology' },
    { symbol: 'CRWD', name: 'CrowdStrike Holdings', sector: 'Technology' },
    { symbol: 'ZS', name: 'Zscaler Inc.', sector: 'Technology' },
    { symbol: 'FTNT', name: 'Fortinet Inc.', sector: 'Technology' },
    
    // Networking & Infrastructure
    { symbol: 'CSCO', name: 'Cisco Systems Inc.', sector: 'Technology' },
    { symbol: 'NET', name: 'Cloudflare Inc.', sector: 'Technology' },
    { symbol: 'DDOG', name: 'Datadog Inc.', sector: 'Technology' },
    
    // AI & Data
    { symbol: 'PLTR', name: 'Palantir Technologies', sector: 'Technology' },
    { symbol: 'AI', name: 'C3.ai Inc.', sector: 'Technology' },
    
    // Financial Services
    { symbol: 'JPM', name: 'JPMorgan Chase & Co.', sector: 'Financial' },
    { symbol: 'BAC', name: 'Bank of America Corp.', sector: 'Financial' },
    { symbol: 'WFC', name: 'Wells Fargo & Company', sector: 'Financial' },
    { symbol: 'GS', name: 'Goldman Sachs Group', sector: 'Financial' },
    { symbol: 'MS', name: 'Morgan Stanley', sector: 'Financial' },
    { symbol: 'C', name: 'Citigroup Inc.', sector: 'Financial' },
    { symbol: 'BLK', name: 'BlackRock Inc.', sector: 'Financial' },
    { symbol: 'SCHW', name: 'Charles Schwab Corp.', sector: 'Financial' },
    { symbol: 'AXP', name: 'American Express Co.', sector: 'Financial' },
    { symbol: 'V', name: 'Visa Inc.', sector: 'Financial' },
    { symbol: 'MA', name: 'Mastercard Inc.', sector: 'Financial' },
    { symbol: 'PYPL', name: 'PayPal Holdings Inc.', sector: 'Financial' },
    { symbol: 'SQ', name: 'Block Inc.', sector: 'Financial' },
    { symbol: 'COIN', name: 'Coinbase Global', sector: 'Financial' },
    
    // Healthcare & Pharma
    { symbol: 'JNJ', name: 'Johnson & Johnson', sector: 'Healthcare' },
    { symbol: 'UNH', name: 'UnitedHealth Group', sector: 'Healthcare' },
    { symbol: 'PFE', name: 'Pfizer Inc.', sector: 'Healthcare' },
    { symbol: 'ABBV', name: 'AbbVie Inc.', sector: 'Healthcare' },
    { symbol: 'TMO', name: 'Thermo Fisher Scientific', sector: 'Healthcare' },
    { symbol: 'ABT', name: 'Abbott Laboratories', sector: 'Healthcare' },
    { symbol: 'DHR', name: 'Danaher Corporation', sector: 'Healthcare' },
    { symbol: 'MRK', name: 'Merck & Co. Inc.', sector: 'Healthcare' },
    { symbol: 'LLY', name: 'Eli Lilly and Co.', sector: 'Healthcare' },
    { symbol: 'BMY', name: 'Bristol-Myers Squibb', sector: 'Healthcare' },
    { symbol: 'AMGN', name: 'Amgen Inc.', sector: 'Healthcare' },
    { symbol: 'GILD', name: 'Gilead Sciences Inc.', sector: 'Healthcare' },
    { symbol: 'CVS', name: 'CVS Health Corporation', sector: 'Healthcare' },
    { symbol: 'CI', name: 'Cigna Corporation', sector: 'Healthcare' },
    { symbol: 'ISRG', name: 'Intuitive Surgical', sector: 'Healthcare' },
    { symbol: 'VRTX', name: 'Vertex Pharmaceuticals', sector: 'Healthcare' },
    { symbol: 'REGN', name: 'Regeneron Pharmaceuticals', sector: 'Healthcare' },
    
    // Consumer - Retail & E-commerce
    { symbol: 'WMT', name: 'Walmart Inc.', sector: 'Consumer' },
    { symbol: 'HD', name: 'Home Depot Inc.', sector: 'Consumer' },
    { symbol: 'COST', name: 'Costco Wholesale Corp.', sector: 'Consumer' },
    { symbol: 'TGT', name: 'Target Corporation', sector: 'Consumer' },
    { symbol: 'LOW', name: 'Lowe\'s Companies Inc.', sector: 'Consumer' },
    { symbol: 'NKE', name: 'Nike Inc.', sector: 'Consumer' },
    { symbol: 'SBUX', name: 'Starbucks Corporation', sector: 'Consumer' },
    { symbol: 'MCD', name: 'McDonald\'s Corporation', sector: 'Consumer' },
    { symbol: 'BABA', name: 'Alibaba Group', sector: 'Consumer' },
    { symbol: 'JD', name: 'JD.com Inc.', sector: 'Consumer' },
    { symbol: 'PDD', name: 'PDD Holdings Inc.', sector: 'Consumer' },
    { symbol: 'SHOP', name: 'Shopify Inc.', sector: 'Technology' },
    { symbol: 'MELI', name: 'MercadoLibre Inc.', sector: 'Consumer' },
    { symbol: 'EBAY', name: 'eBay Inc.', sector: 'Consumer' },
    { symbol: 'ETSY', name: 'Etsy Inc.', sector: 'Consumer' },
    
    // Consumer Goods
    { symbol: 'PG', name: 'Procter & Gamble Co.', sector: 'Consumer' },
    { symbol: 'KO', name: 'Coca-Cola Company', sector: 'Consumer' },
    { symbol: 'PEP', name: 'PepsiCo Inc.', sector: 'Consumer' },
    { symbol: 'PM', name: 'Philip Morris International', sector: 'Consumer' },
    { symbol: 'MO', name: 'Altria Group Inc.', sector: 'Consumer' },
    
    // Entertainment & Media
    { symbol: 'DIS', name: 'Walt Disney Company', sector: 'Entertainment' },
    { symbol: 'CMCSA', name: 'Comcast Corporation', sector: 'Communication' },
    { symbol: 'SPOT', name: 'Spotify Technology', sector: 'Entertainment' },
    { symbol: 'RBLX', name: 'Roblox Corporation', sector: 'Entertainment' },
    { symbol: 'U', name: 'Unity Software Inc.', sector: 'Technology' },
    { symbol: 'EA', name: 'Electronic Arts Inc.', sector: 'Entertainment' },
    { symbol: 'TTWO', name: 'Take-Two Interactive', sector: 'Entertainment' },
    { symbol: 'ATVI', name: 'Activision Blizzard', sector: 'Entertainment' },
    
    // Telecommunications
    { symbol: 'VZ', name: 'Verizon Communications', sector: 'Communication' },
    { symbol: 'T', name: 'AT&T Inc.', sector: 'Communication' },
    { symbol: 'TMUS', name: 'T-Mobile US Inc.', sector: 'Communication' },
    
    // Industrial & Manufacturing
    { symbol: 'BA', name: 'Boeing Company', sector: 'Industrial' },
    { symbol: 'CAT', name: 'Caterpillar Inc.', sector: 'Industrial' },
    { symbol: 'GE', name: 'General Electric Co.', sector: 'Industrial' },
    { symbol: 'MMM', name: '3M Company', sector: 'Industrial' },
    { symbol: 'HON', name: 'Honeywell International', sector: 'Industrial' },
    { symbol: 'UPS', name: 'United Parcel Service', sector: 'Industrial' },
    { symbol: 'FDX', name: 'FedEx Corporation', sector: 'Industrial' },
    { symbol: 'LMT', name: 'Lockheed Martin Corp.', sector: 'Industrial' },
    { symbol: 'RTX', name: 'Raytheon Technologies', sector: 'Industrial' },
    { symbol: 'DE', name: 'Deere & Company', sector: 'Industrial' },
    
    // Energy
    { symbol: 'XOM', name: 'Exxon Mobil Corporation', sector: 'Energy' },
    { symbol: 'CVX', name: 'Chevron Corporation', sector: 'Energy' },
    { symbol: 'COP', name: 'ConocoPhillips', sector: 'Energy' },
    { symbol: 'SLB', name: 'Schlumberger Limited', sector: 'Energy' },
    { symbol: 'EOG', name: 'EOG Resources Inc.', sector: 'Energy' },
    { symbol: 'PXD', name: 'Pioneer Natural Resources', sector: 'Energy' },
    { symbol: 'MPC', name: 'Marathon Petroleum Corp.', sector: 'Energy' },
    
    // Automotive & EV
    { symbol: 'F', name: 'Ford Motor Company', sector: 'Automotive' },
    { symbol: 'GM', name: 'General Motors Company', sector: 'Automotive' },
    { symbol: 'RIVN', name: 'Rivian Automotive', sector: 'Automotive' },
    { symbol: 'LCID', name: 'Lucid Group Inc.', sector: 'Automotive' },
    { symbol: 'NIO', name: 'NIO Inc.', sector: 'Automotive' },
    { symbol: 'XPEV', name: 'XPeng Inc.', sector: 'Automotive' },
    { symbol: 'LI', name: 'Li Auto Inc.', sector: 'Automotive' },
    
    // Transportation & Logistics
    { symbol: 'UBER', name: 'Uber Technologies', sector: 'Technology' },
    { symbol: 'LYFT', name: 'Lyft Inc.', sector: 'Technology' },
    { symbol: 'ABNB', name: 'Airbnb Inc.', sector: 'Consumer' },
    { symbol: 'DASH', name: 'DoorDash Inc.', sector: 'Technology' },
    
    // Real Estate & REITs
    { symbol: 'AMT', name: 'American Tower Corp.', sector: 'Real Estate' },
    { symbol: 'PLD', name: 'Prologis Inc.', sector: 'Real Estate' },
    { symbol: 'CCI', name: 'Crown Castle Inc.', sector: 'Real Estate' },
    { symbol: 'EQIX', name: 'Equinix Inc.', sector: 'Real Estate' },
    { symbol: 'SPG', name: 'Simon Property Group', sector: 'Real Estate' },
    { symbol: 'O', name: 'Realty Income Corporation', sector: 'Real Estate' },
    
    // Materials & Chemicals
    { symbol: 'LIN', name: 'Linde plc', sector: 'Materials' },
    { symbol: 'APD', name: 'Air Products and Chemicals', sector: 'Materials' },
    { symbol: 'SHW', name: 'Sherwin-Williams Company', sector: 'Materials' },
    { symbol: 'NEM', name: 'Newmont Corporation', sector: 'Materials' },
    { symbol: 'FCX', name: 'Freeport-McMoRan Inc.', sector: 'Materials' },
    
    // Дополнительные акции (147-200)
    // Technology & Software
    { symbol: 'SHOP', name: 'Shopify Inc.', sector: 'Technology' },
    { symbol: 'SQ', name: 'Block Inc. (Square)', sector: 'Technology' },
    { symbol: 'TWLO', name: 'Twilio Inc.', sector: 'Technology' },
    { symbol: 'ZM', name: 'Zoom Video Communications', sector: 'Technology' },
    { symbol: 'DOCU', name: 'DocuSign Inc.', sector: 'Technology' },
    { symbol: 'DDOG', name: 'Datadog Inc.', sector: 'Technology' },
    { symbol: 'NET', name: 'Cloudflare Inc.', sector: 'Technology' },
    { symbol: 'CRWD', name: 'CrowdStrike Holdings', sector: 'Technology' },
    { symbol: 'ZS', name: 'Zscaler Inc.', sector: 'Technology' },
    { symbol: 'PANW', name: 'Palo Alto Networks', sector: 'Technology' },
    { symbol: 'FTNT', name: 'Fortinet Inc.', sector: 'Technology' },
    { symbol: 'WDAY', name: 'Workday Inc.', sector: 'Technology' },
    { symbol: 'TEAM', name: 'Atlassian Corporation', sector: 'Technology' },
    { symbol: 'SPLK', name: 'Splunk Inc.', sector: 'Technology' },
    { symbol: 'OKTA', name: 'Okta Inc.', sector: 'Technology' },
    
    // E-commerce & Consumer
    { symbol: 'ETSY', name: 'Etsy Inc.', sector: 'Consumer' },
    { symbol: 'W', name: 'Wayfair Inc.', sector: 'Consumer' },
    { symbol: 'CHWY', name: 'Chewy Inc.', sector: 'Consumer' },
    { symbol: 'DASH', name: 'DoorDash Inc.', sector: 'Consumer' },
    { symbol: 'ABNB', name: 'Airbnb Inc.', sector: 'Consumer' },
    { symbol: 'UBER', name: 'Uber Technologies', sector: 'Consumer' },
    { symbol: 'LYFT', name: 'Lyft Inc.', sector: 'Consumer' },
    
    // Healthcare & Biotech
    { symbol: 'REGN', name: 'Regeneron Pharmaceuticals', sector: 'Healthcare' },
    { symbol: 'VRTX', name: 'Vertex Pharmaceuticals', sector: 'Healthcare' },
    { symbol: 'BIIB', name: 'Biogen Inc.', sector: 'Healthcare' },
    { symbol: 'ILMN', name: 'Illumina Inc.', sector: 'Healthcare' },
    { symbol: 'ALNY', name: 'Alnylam Pharmaceuticals', sector: 'Healthcare' },
    { symbol: 'SRPT', name: 'Sarepta Therapeutics', sector: 'Healthcare' },
    { symbol: 'BMRN', name: 'BioMarin Pharmaceutical', sector: 'Healthcare' },
    { symbol: 'EXAS', name: 'Exact Sciences Corp.', sector: 'Healthcare' },
    { symbol: 'DXCM', name: 'DexCom Inc.', sector: 'Healthcare' },
    { symbol: 'PODD', name: 'Insulet Corporation', sector: 'Healthcare' },
    { symbol: 'ALGN', name: 'Align Technology', sector: 'Healthcare' },
    { symbol: 'IDXX', name: 'IDEXX Laboratories', sector: 'Healthcare' },
    
    // Financial Services
    { symbol: 'AXP', name: 'American Express Company', sector: 'Financial' },
    { symbol: 'BLK', name: 'BlackRock Inc.', sector: 'Financial' },
    { symbol: 'SCHW', name: 'Charles Schwab Corp.', sector: 'Financial' },
    { symbol: 'USB', name: 'U.S. Bancorp', sector: 'Financial' },
    { symbol: 'PNC', name: 'PNC Financial Services', sector: 'Financial' },
    { symbol: 'TFC', name: 'Truist Financial Corp.', sector: 'Financial' },
    { symbol: 'COF', name: 'Capital One Financial', sector: 'Financial' },
    { symbol: 'AFL', name: 'Aflac Incorporated', sector: 'Financial' },
    { symbol: 'MET', name: 'MetLife Inc.', sector: 'Financial' },
    { symbol: 'PRU', name: 'Prudential Financial', sector: 'Financial' },
    
    // Media & Entertainment
    { symbol: 'DIS', name: 'The Walt Disney Company', sector: 'Media' },
    { symbol: 'CMCSA', name: 'Comcast Corporation', sector: 'Media' },
    { symbol: 'NFLX', name: 'Netflix Inc.', sector: 'Media' },
    { symbol: 'PARA', name: 'Paramount Global', sector: 'Media' },
    { symbol: 'WBD', name: 'Warner Bros. Discovery', sector: 'Media' },
    { symbol: 'SPOT', name: 'Spotify Technology', sector: 'Media' },
    { symbol: 'RBLX', name: 'Roblox Corporation', sector: 'Media' }
];

// Делаем доступным глобально
if (typeof window !== 'undefined') {
    window.STOCKS_DATABASE = STOCKS_DATABASE;
    window.stocksDatabase = STOCKS_DATABASE; // Для AssetService
}
