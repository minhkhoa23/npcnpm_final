require('dotenv').config();

module.exports = {
    port: process.env.PORT || 3000,
    mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/tournament_db',
    jwtSecret: process.env.JWT_SECRET || 'fallback_secret_key',
    jwtExpire: process.env.JWT_EXPIRE || '7d',
    nodeEnv: process.env.NODE_ENV || 'development'
};