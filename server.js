const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Connect to MongoDB with Fallback
mongoose.connect(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 5000
}).then(() => {
    console.log('Connected to MongoDB');
    process.env.USE_MOCK_DB = 'false';
}).catch(err => {
    console.warn('!!! MongoDB connection error. Switching to MOCK MODE (In-memory storage) !!!');
    console.warn('REASON:', err.message);
    process.env.USE_MOCK_DB = 'true';
});

// Routes Placeholder
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/gold', require('./routes/goldRoutes'));
app.use('/api/bookings', require('./routes/bookingRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
