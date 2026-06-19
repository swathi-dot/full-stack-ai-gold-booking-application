const mongoose = require('mongoose');

const goldPriceSchema = new mongoose.Schema({
    price: { type: Number, required: true }, // price per gram
    date: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('GoldPrice', goldPriceSchema);
