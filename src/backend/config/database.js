const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
    try {
        // Connect to MongoDB
        const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/tournament_db', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 10000, // 10 seconds timeout
            connectTimeoutMS: 10000,
            socketTimeoutMS: 10000,
        });
        console.log(`MongoDB Connected: ${conn.connection.host}`);
        global.mockMode = false;
        return true;
    } catch (error) {
        console.error('MongoDB connection failed:', error.message);
        console.error('Server cannot start without MongoDB connection.');
        process.exit(1); // Exit if MongoDB connection fails
    }
};

module.exports = connectDB;