const bcrypt = require('bcryptjs');

// In-memory mock database for when MongoDB is unavailable
const mockDB = {
    users: [],
    bookings: [],
    goldPrices: []
};

// Generate 30 days of realistic historical data
const seedMockData = async () => {
    let basePrice = 6500;
    const now = new Date();
    
    // Generate 30 points
    for (let i = 29; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(now.getDate() - i);
        
        // Use a random walk with smaller daily changes (approx 0.5% max)
        const change = (Math.random() - 0.5) * 40; // max +/- 20 INR
        basePrice += change;
        
        mockDB.goldPrices.unshift({
            price: Math.round(basePrice),
            date: date
        });
    }

    // Seed an admin user
    const hashedPassword = await bcrypt.hash('admin123', 10);
    mockDB.users.push({
        id: 'mock-admin-id',
        name: 'Mock Admin',
        email: 'admin@gold.com',
        password: hashedPassword,
        role: 'admin'
    });
};

seedMockData();

module.exports = mockDB;
