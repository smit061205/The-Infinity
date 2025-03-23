const mongoose = require('mongoose');

const soilSchema = new mongoose.Schema({
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
    pH: {
        type: Number,
        required: true,
        min: 0,
        max: 14
    },
    organicMatter: {
        type: Number,
        required: true,
        min: 0
    },
    nitrogen: {
        type: Number,
        required: true,
        min: 0
    },
    phosphorus: {
        type: Number,
        required: true,
        min: 0
    },
    potassium: {
        type: Number,
        required: true,
        min: 0
    },
    moisture: {
        type: Number,
        required: true,
        min: 0,
        max: 100
    },
    texture: {
        type: String,
        required: true,
        enum: ['Sandy', 'Loamy', 'Clay', 'Silt', 'Mixed']
    },
    lastTestedDate: {
        type: Date,
        required: true,
        default: Date.now
    }
}, {
    timestamps: true
});

// Create a geospatial index on the location field
soilSchema.index({ location: '2dsphere' });

const Soil = mongoose.model('Soil', soilSchema);
module.exports = Soil; 