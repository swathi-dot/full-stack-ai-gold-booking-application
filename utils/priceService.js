const axios = require('axios');

const getLiveGoldPrice = async () => {
    try {
        const goldRes = await axios.get('https://api.gold-api.com/price/XAU');
        const pricePerOunceUSD = goldRes.data.price;

        const rateRes = await axios.get('https://api.exchangerate-api.com/v4/latest/USD');
        const usdToInr = rateRes.data.rates.INR;

        const pricePerGramUSD = pricePerOunceUSD / 31.1034768;
        const pricePerGramINR = Math.round(pricePerGramUSD * usdToInr);

        return {
            price: pricePerGramINR,
            usdPrice: pricePerOunceUSD,
            rate: usdToInr,
            timestamp: new Date()
        };
    } catch (err) {
        console.error('Error fetching live market data:', err.message);
        return { price: 6520, timestamp: new Date(), error: true };
    }
};

const getHistoricalPriceData = async () => {
    try {
        // Fetch historical data from freegoldapi.com
        const res = await axios.get('https://freegoldapi.com/data/latest.json');
        const allData = res.data; // Array of {date, price, source}
        
        // Get USD to INR rate for conversion
        const rateRes = await axios.get('https://api.exchangerate-api.com/v4/latest/USD');
        const usdToInr = rateRes.data.rates.INR;

        // Take the last 30 days and convert to INR per gram
        const last30 = allData.slice(-30).map(item => ({
            price: Math.round((item.price / 31.1034768) * usdToInr),
            date: new Date(item.date)
        }));

        return last30;
    } catch (err) {
        console.error('Error fetching historical data:', err.message);
        return null;
    }
}

module.exports = { getLiveGoldPrice, getHistoricalPriceData };
