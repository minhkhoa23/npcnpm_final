const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
    try {
        // Connect to MongoDB
        const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/tournament_db', {
            serverSelectionTimeoutMS: 10000, // 10 seconds timeout
            connectTimeoutMS: 10000,
            socketTimeoutMS: 10000,
        });
        console.log(`MongoDB Connected: ${conn.connection.host}`);
        global.mockMode = false;
        return true;
    } catch (error) {
        console.error('MongoDB connection failed:', error.message);
        console.warn('Switching to mock mode using JSON files...');
        global.mockMode = true;
        return false; // Continue with mock mode
    }
};

module.exports = connectDB;
