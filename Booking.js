const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    weight: { type: Number, required: true }, // in grams
    priceAtBooking: { type: Number, required: true }, // price per gram
    bookingDate: { type: Date, default: Date.now },
    status: { type: String, default: 'pending' } // 'pending', 'confirmed', 'cancelled'
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);
