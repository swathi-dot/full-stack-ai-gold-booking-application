const express = require('express');
const router = express.Router();
const GoldPrice = require('../models/GoldPrice');
const mockDB = require('../models/mockDB');
const ss = require('simple-statistics');
const { getLiveGoldPrice, getHistoricalPriceData } = require('../utils/priceService');

// Helper to get real combined history (Market History + Live Price)
const getRealMarketHistory = async () => {
    try {
        const history = await getHistoricalPriceData();
        const live = await getLiveGoldPrice();
        
        if (!history) return mockDB.goldPrices; // Fallback

        // Check if latest history is from today
        const lastHistDate = new Date(history[history.length - 1].date).toLocaleDateString();
        const nowDate = new Date().toLocaleDateString();

        if (lastHistDate !== nowDate) {
            history.push({ price: live.price, date: live.timestamp });
        } else {
            // Update today's last point with live price
            history[history.length - 1].price = live.price;
        }
        
        return history;
    } catch (err) {
        console.error('History Sync Error:', err);
        return mockDB.goldPrices;
    }
};

// @route   GET api/gold/current
// @desc    Get latest gold price
router.get('/current', async (req, res) => {
    try {
        const liveData = await getLiveGoldPrice();
        return res.json(liveData);
    } catch (err) {
        console.error('Current Price Error:', err);
        res.status(500).json({ msg: 'Server error' });
    }
});

// @route   GET api/gold/history
// @desc    Get historical gold prices
router.get('/history', async (req, res) => {
    try {
        const history = await getRealMarketHistory();
        res.json(history);
    } catch (err) {
        console.error('History API Error:', err);
        res.status(500).json({ msg: 'Server error' });
    }
});

// @route   GET api/gold/predict
// @desc    Predict future gold price using linear regression
router.get('/predict', async (req, res) => {
    try {
        const history = await getRealMarketHistory();

        if (history.length < 2) {
            return res.status(400).json({ msg: 'Not enough data for prediction' });
        }

        // Prepare data for linear regression
        const data = history.map((item, index) => [index, item.price]);
        const regression = ss.linearRegression(data);
        const predictFunc = ss.linearRegressionLine(regression);

        // Predict next 7 entries
        const lastIndex = history.length - 1;
        const predictions = [];
        for (let i = 1; i <= 7; i++) {
            predictions.push({
                index: lastIndex + i,
                predictedPrice: Math.round(predictFunc(lastIndex + i)),
                date: new Date(Date.now() + i * 24 * 60 * 60 * 1000)
            });
        }

        res.json(predictions);
    } catch (err) {
        console.error('Prediction API Error:', err);
        res.status(500).json({ msg: 'Server error' });
    }
});

module.exports = router;
