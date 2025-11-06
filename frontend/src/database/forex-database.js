// forex-database.js - База данных форекс пар (50+ пар)
const FOREX_DATABASE = [
    // Мажорные пары (Major Pairs)
    { symbol: 'EURUSD', name: 'Euro / US Dollar', category: 'Major' },
    { symbol: 'GBPUSD', name: 'British Pound / US Dollar', category: 'Major' },
    { symbol: 'USDJPY', name: 'US Dollar / Japanese Yen', category: 'Major' },
    { symbol: 'USDCHF', name: 'US Dollar / Swiss Franc', category: 'Major' },
    { symbol: 'AUDUSD', name: 'Australian Dollar / US Dollar', category: 'Major' },
    { symbol: 'USDCAD', name: 'US Dollar / Canadian Dollar', category: 'Major' },
    { symbol: 'NZDUSD', name: 'New Zealand Dollar / US Dollar', category: 'Major' },
    
    // Кросс-пары EUR (EUR Cross Pairs)
    { symbol: 'EURGBP', name: 'Euro / British Pound', category: 'Cross' },
    { symbol: 'EURJPY', name: 'Euro / Japanese Yen', category: 'Cross' },
    { symbol: 'EURCHF', name: 'Euro / Swiss Franc', category: 'Cross' },
    { symbol: 'EURAUD', name: 'Euro / Australian Dollar', category: 'Cross' },
    { symbol: 'EURCAD', name: 'Euro / Canadian Dollar', category: 'Cross' },
    { symbol: 'EURNZD', name: 'Euro / New Zealand Dollar', category: 'Cross' },
    { symbol: 'EURSEK', name: 'Euro / Swedish Krona', category: 'Cross' },
    { symbol: 'EURNOK', name: 'Euro / Norwegian Krone', category: 'Cross' },
    { symbol: 'EURDKK', name: 'Euro / Danish Krone', category: 'Cross' },
    
    // Кросс-пары GBP (GBP Cross Pairs)
    { symbol: 'GBPJPY', name: 'British Pound / Japanese Yen', category: 'Cross' },
    { symbol: 'GBPCHF', name: 'British Pound / Swiss Franc', category: 'Cross' },
    { symbol: 'GBPAUD', name: 'British Pound / Australian Dollar', category: 'Cross' },
    { symbol: 'GBPCAD', name: 'British Pound / Canadian Dollar', category: 'Cross' },
    { symbol: 'GBPNZD', name: 'British Pound / New Zealand Dollar', category: 'Cross' },
    { symbol: 'GBPSEK', name: 'British Pound / Swedish Krona', category: 'Cross' },
    { symbol: 'GBPNOK', name: 'British Pound / Norwegian Krone', category: 'Cross' },
    
    // Кросс-пары JPY (JPY Cross Pairs)
    { symbol: 'AUDJPY', name: 'Australian Dollar / Japanese Yen', category: 'Cross' },
    { symbol: 'CADJPY', name: 'Canadian Dollar / Japanese Yen', category: 'Cross' },
    { symbol: 'CHFJPY', name: 'Swiss Franc / Japanese Yen', category: 'Cross' },
    { symbol: 'NZDJPY', name: 'New Zealand Dollar / Japanese Yen', category: 'Cross' },
    
    // Кросс-пары AUD (AUD Cross Pairs)
    { symbol: 'AUDCAD', name: 'Australian Dollar / Canadian Dollar', category: 'Cross' },
    { symbol: 'AUDCHF', name: 'Australian Dollar / Swiss Franc', category: 'Cross' },
    { symbol: 'AUDNZD', name: 'Australian Dollar / New Zealand Dollar', category: 'Cross' },
    
    // Кросс-пары NZD (NZD Cross Pairs)
    { symbol: 'NZDCAD', name: 'New Zealand Dollar / Canadian Dollar', category: 'Cross' },
    { symbol: 'NZDCHF', name: 'New Zealand Dollar / Swiss Franc', category: 'Cross' },
    
    // Кросс-пары CAD (CAD Cross Pairs)
    { symbol: 'CADCHF', name: 'Canadian Dollar / Swiss Franc', category: 'Cross' },
    
    // Экзотические пары (Exotic Pairs)
    { symbol: 'USDTRY', name: 'US Dollar / Turkish Lira', category: 'Exotic' },
    { symbol: 'USDZAR', name: 'US Dollar / South African Rand', category: 'Exotic' },
    { symbol: 'USDMXN', name: 'US Dollar / Mexican Peso', category: 'Exotic' },
    { symbol: 'USDBRL', name: 'US Dollar / Brazilian Real', category: 'Exotic' },
    { symbol: 'USDRUB', name: 'US Dollar / Russian Ruble', category: 'Exotic' },
    { symbol: 'USDINR', name: 'US Dollar / Indian Rupee', category: 'Exotic' },
    { symbol: 'USDKRW', name: 'US Dollar / South Korean Won', category: 'Exotic' },
    { symbol: 'USDSGD', name: 'US Dollar / Singapore Dollar', category: 'Exotic' },
    { symbol: 'USDHKD', name: 'US Dollar / Hong Kong Dollar', category: 'Exotic' },
    { symbol: 'USDCNH', name: 'US Dollar / Chinese Yuan', category: 'Exotic' },
    { symbol: 'USDTHB', name: 'US Dollar / Thai Baht', category: 'Exotic' },
    { symbol: 'USDIDR', name: 'US Dollar / Indonesian Rupiah', category: 'Exotic' },
    { symbol: 'USDPLN', name: 'US Dollar / Polish Zloty', category: 'Exotic' },
    { symbol: 'USDHUF', name: 'US Dollar / Hungarian Forint', category: 'Exotic' },
    { symbol: 'USDCZK', name: 'US Dollar / Czech Koruna', category: 'Exotic' },
    { symbol: 'USDILS', name: 'US Dollar / Israeli Shekel', category: 'Exotic' },
    { symbol: 'USDCLP', name: 'US Dollar / Chilean Peso', category: 'Exotic' },
    { symbol: 'USDPHP', name: 'US Dollar / Philippine Peso', category: 'Exotic' },
    { symbol: 'USDAED', name: 'US Dollar / UAE Dirham', category: 'Exotic' },
    { symbol: 'USDSAR', name: 'US Dollar / Saudi Riyal', category: 'Exotic' },
    
    // Дополнительные валютные пары (71-100)
    { symbol: 'EURNOK', name: 'Euro / Norwegian Krone', category: 'Cross' },
    { symbol: 'EURSEK', name: 'Euro / Swedish Krona', category: 'Cross' },
    { symbol: 'EURDKK', name: 'Euro / Danish Krone', category: 'Cross' },
    { symbol: 'EURPLN', name: 'Euro / Polish Zloty', category: 'Cross' },
    { symbol: 'EURHUF', name: 'Euro / Hungarian Forint', category: 'Cross' },
    { symbol: 'EURCZK', name: 'Euro / Czech Koruna', category: 'Cross' },
    { symbol: 'EURTRY', name: 'Euro / Turkish Lira', category: 'Cross' },
    { symbol: 'GBPNOK', name: 'British Pound / Norwegian Krone', category: 'Cross' },
    { symbol: 'GBPSEK', name: 'British Pound / Swedish Krona', category: 'Cross' },
    { symbol: 'GBPDKK', name: 'British Pound / Danish Krone', category: 'Cross' },
    { symbol: 'GBPPLN', name: 'British Pound / Polish Zloty', category: 'Cross' },
    { symbol: 'GBPTRY', name: 'British Pound / Turkish Lira', category: 'Cross' },
    { symbol: 'CHFNOK', name: 'Swiss Franc / Norwegian Krone', category: 'Cross' },
    { symbol: 'CHFSEK', name: 'Swiss Franc / Swedish Krona', category: 'Cross' },
    { symbol: 'AUDNZD', name: 'Australian Dollar / New Zealand Dollar', category: 'Cross' },
    { symbol: 'NZDCAD', name: 'New Zealand Dollar / Canadian Dollar', category: 'Cross' },
    { symbol: 'NZDCHF', name: 'New Zealand Dollar / Swiss Franc', category: 'Cross' },
    { symbol: 'CADCHF', name: 'Canadian Dollar / Swiss Franc', category: 'Cross' },
    { symbol: 'USDKWD', name: 'US Dollar / Kuwaiti Dinar', category: 'Exotic' },
    { symbol: 'USDBHD', name: 'US Dollar / Bahraini Dinar', category: 'Exotic' },
    { symbol: 'USDOMR', name: 'US Dollar / Omani Rial', category: 'Exotic' },
    { symbol: 'USDQAR', name: 'US Dollar / Qatari Riyal', category: 'Exotic' },
    { symbol: 'USDEGP', name: 'US Dollar / Egyptian Pound', category: 'Exotic' },
    { symbol: 'USDKES', name: 'US Dollar / Kenyan Shilling', category: 'Exotic' },
    { symbol: 'USDNGN', name: 'US Dollar / Nigerian Naira', category: 'Exotic' },
    { symbol: 'USDGHS', name: 'US Dollar / Ghanaian Cedi', category: 'Exotic' },
    { symbol: 'USDUGX', name: 'US Dollar / Ugandan Shilling', category: 'Exotic' },
    { symbol: 'USDTZS', name: 'US Dollar / Tanzanian Shilling', category: 'Exotic' },
    { symbol: 'USDZMW', name: 'US Dollar / Zambian Kwacha', category: 'Exotic' },
    { symbol: 'USDBDT', name: 'US Dollar / Bangladeshi Taka', category: 'Exotic' }
];

// Делаем доступным глобально
if (typeof window !== 'undefined') {
    window.FOREX_DATABASE = FOREX_DATABASE;
}
