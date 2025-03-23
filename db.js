const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
    try {
        // Close any existing connections first
        if (mongoose.connection.readyState !== 0) {
            await mongoose.connection.close();
        }

        // Configure Mongoose settings globally
        mongoose.set('strictQuery', true);

        const options = {
            maxPoolSize: 50,
            minPoolSize: 10,
            serverSelectionTimeoutMS: 30000,
            socketTimeoutMS: 45000,
            family: 4
        };

        const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/farm_finance_db', {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        
        console.log(`MongoDB Connected: ${conn.connection.host}`);

        // Set up connection event handlers
        mongoose.connection.on('error', err => {
            console.error('MongoDB connection error:', err);
        });

        mongoose.connection.on('disconnected', () => {
            console.log('MongoDB disconnected');
        });

        mongoose.connection.on('connected', () => {
            console.log('MongoDB connected event fired');
        });

        return conn;
    } catch (error) {
        console.error(`Error connecting to MongoDB: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;
