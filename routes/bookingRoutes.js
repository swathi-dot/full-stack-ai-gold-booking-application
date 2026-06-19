const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const mockDB = require('../models/mockDB');
const { auth } = require('../middleware/auth');

// @route   POST api/bookings/create
// @desc    Create a new booking
router.post('/create', auth, async (req, res) => {
    const { weight, priceAtBooking } = req.body;
    try {
        if (process.env.USE_MOCK_DB === 'true') {
            const newBooking = {
                id: Date.now().toString(),
                userId: req.user.id,
                weight,
                priceAtBooking,
                bookingDate: new Date(),
                status: 'pending'
            };
            mockDB.bookings.push(newBooking);
            return res.json(newBooking);
        }
        const newBooking = new Booking({
            userId: req.user.id,
            weight,
            priceAtBooking
        });
        await newBooking.save();
        res.json(newBooking);
    } catch (err) {
        console.error('Booking Create Error:', err);
        res.status(500).json({ msg: 'Server error' });
    }
});

// @route   GET api/bookings/user-bookings
// @desc    Get all bookings for a user
router.get('/user-bookings', auth, async (req, res) => {
    try {
        if (process.env.USE_MOCK_DB === 'true') {
            const userBookings = mockDB.bookings.filter(b => b.userId === req.user.id);
            return res.json(userBookings);
        }
        const bookings = await Booking.find({ userId: req.user.id }).sort({ createdAt: -1 });
        res.json(bookings);
    } catch (err) {
        console.error('Booking Fetch Error:', err);
        res.status(500).json({ msg: 'Server error' });
    }
});

module.exports = router;
