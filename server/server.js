const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/rooms', require('./routes/roomRoutes'));
app.use('/api/students', require('./routes/studentRoutes'));
app.use('/api/complaints', require('./routes/complaintRoutes'));
app.use('/api/fees', require('./routes/feeRoutes'));
app.use('/api/meals', require('./routes/mealRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));

// Seed endpoint (call once after deployment to populate database)
app.post('/api/seed', async (req, res) => {
    try {
        const User = require('./models/User');
        const existing = await User.countDocuments();
        if (existing > 0) {
            return res.json({ success: false, message: 'Database already seeded. Delete data first to re-seed.' });
        }
        const seedData = require('./utils/seed');
        await seedData();
        res.json({ success: true, message: 'Database seeded successfully!' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.statusCode || 500).json({
        success: false,
        message: err.message || 'Internal Server Error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});

const PORT = process.env.PORT || 5000;

// Start server after DB connection
const startServer = async () => {
    const isMemory = await connectDB();

    // Auto-seed only when using in-memory DB (local dev without MongoDB)
    if (isMemory) {
        console.log('📦 Seeding in-memory database...');
        const seedData = require('./utils/seed');
        await seedData();
    }

    app.listen(PORT, () => {
        console.log(`🚀 Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
    });
};

startServer();

module.exports = app;
