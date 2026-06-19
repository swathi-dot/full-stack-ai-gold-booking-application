const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const mockDB = require('../models/mockDB');

// @route   POST api/auth/register
// @desc    Register user
router.post('/register', async (req, res) => {
    const { name, email, password, role } = req.body;
    try {
        if (process.env.USE_MOCK_DB === 'true') {
            const userExists = mockDB.users.find(u => u.email === email);
            if (userExists) return res.status(400).json({ msg: 'User already exists (Mock)' });
            
            const newUser = { id: Date.now().toString(), name, email, password: await bcrypt.hash(password, 10), role: role || 'user' };
            mockDB.users.push(newUser);
            
            const payload = { user: { id: newUser.id, role: newUser.role } };
            const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
            return res.json({ token, user: { id: newUser.id, name: newUser.name, role: newUser.role }, mock: true });
        }

        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ msg: 'User already exists' });

        user = new User({ name, email, password, role });
        await user.save();

        const payload = { user: { id: user.id, role: user.role } };
        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' }, (err, token) => {
            if (err) throw err;
            res.json({ token, user: { id: user.id, name: user.name, role: user.role } });
        });
    } catch (err) {
        console.error('Registration Error:', err);
        res.status(500).json({ msg: 'Registration failed', error: err.message });
    }
});

// @route   POST api/auth/login
// @desc    Authenticate user & get token
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        if (process.env.USE_MOCK_DB === 'true') {
            const user = mockDB.users.find(u => u.email === email);
            if (!user) return res.status(400).json({ msg: 'Invalid credentials (Mock)' });

            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials (Mock)' });

            const payload = { user: { id: user.id, role: user.role } };
            const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
            return res.json({ token, user: { id: user.id, name: user.name, role: user.role }, mock: true });
        }

        let user = await User.findOne({ email });
        if (!user) return res.status(400).json({ msg: 'Invalid credentials' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });

        const payload = { user: { id: user.id, role: user.role } };
        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' }, (err, token) => {
            if (err) throw err;
            res.json({ token, user: { id: user.id, name: user.name, role: user.role } });
        });
    } catch (err) {
        console.error('Login Error:', err);
        res.status(500).json({ msg: 'Login failed', error: err.message });
    }
});

module.exports = router;
