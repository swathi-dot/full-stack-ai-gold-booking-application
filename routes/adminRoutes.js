const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Booking = require('../models/Booking');
const GoldPrice = require('../models/GoldPrice');
const mockDB = require('../models/mockDB');
const { auth, admin } = require('../middleware/auth');

// @route   GET api/admin/users
// @desc    Get all users
router.get('/users', auth, admin, async (req, res) => {
    try {
        if (process.env.USE_MOCK_DB === 'true') {
            return res.json(mockDB.users.map(u => ({ ...u, password: '' })));
        }
        const users = await User.find().select('-password');
        res.json(users);
    } catch (err) {
        console.error('Admin Users Error:', err);
        res.status(500).json({ msg: 'Server error' });
    }
});

// @route   GET api/admin/bookings
// @desc    Get all bookings
router.get('/bookings', auth, admin, async (req, res) => {
    try {
        if (process.env.USE_MOCK_DB === 'true') {
            const bookingsWithUsers = mockDB.bookings.map(b => {
                const user = mockDB.users.find(u => u.id === b.userId);
                return { ...b, userId: user ? { name: user.name, email: user.email } : null };
            });
            return res.json(bookingsWithUsers);
        }
        const bookings = await Booking.find().populate('userId', 'name email').sort({ createdAt: -1 });
        res.json(bookings);
    } catch (err) {
        console.error('Admin Bookings Error:', err);
        res.status(500).json({ msg: 'Server error' });
    }
});

// @route   POST api/admin/update-price
// @desc    Update gold price
router.post('/update-price', auth, admin, async (req, res) => {
    const { price } = req.body;
    try {
        if (process.env.USE_MOCK_DB === 'true') {
            const newPrice = { price, date: new Date() };
            mockDB.goldPrices.unshift(newPrice);
            return res.json(newPrice);
        }
        const newPrice = new GoldPrice({ price });
        await newPrice.save();
        res.json(newPrice);
    } catch (err) {
        console.error('Admin Update Price Error:', err);
        res.status(500).json({ msg: 'Server error' });
    }
});

module.exports = router;
