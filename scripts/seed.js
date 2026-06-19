const mongoose = require('mongoose');
const dotenv = require('dotenv');
const GoldPrice = require('../models/GoldPrice');

dotenv.config();

const seedData = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB for seeding');

        // Clear existing prices
        await GoldPrice.deleteMany();

        const prices = [];
        let basePrice = 6000;
        const now = new Date();

        for (let i = 30; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(now.getDate() - i);
            basePrice += (Math.random() * 100 - 45); // Random fluctuation
            prices.push({
                price: Math.round(basePrice),
                date: date
            });
        }

        await GoldPrice.insertMany(prices);
        console.log('Seeded 30 days of historical gold prices');
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

seedData();
