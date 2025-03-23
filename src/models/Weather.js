const mongoose = require('mongoose');

const weatherSchema = new mongoose.Schema({
    location: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point'
        },
        coordinates: {
            type: [Number], // [longitude, latitude]
            required: true
        }
    },
    date: {
        type: Date,
        required: true
    },
    temperature: {
        type: Number,
        required: true
    },
    humidity: {
        type: Number,
        required: true,
        min: 0,
        max: 100
    },
    precipitation: {
        type: Number,
        required: true,
        min: 0
    },
    windSpeed: {
        type: Number,
        required: true,
        min: 0
    },
    forecast: {
        type: Boolean,
        default: false
    },
    weatherCondition: {
        type: String,
        required: true,
        enum: ['Clear', 'Cloudy', 'Rain', 'Storm', 'Snow']
    }
}, {
    timestamps: true
});

// Create a geospatial index on the location field
weatherSchema.index({ location: '2dsphere' });
// Create a compound index on date and forecast
weatherSchema.index({ date: 1, forecast: 1 });

const Weather = mongoose.model('Weather', weatherSchema);
module.exports = Weather; 