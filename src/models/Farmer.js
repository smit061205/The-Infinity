const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const farmerSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['farmer', 'lender', 'bank', 'nbfc'],
        default: 'farmer'
    },
    farmLocation: {
        name: String,
        coordinates: {
            type: [Number], // [longitude, latitude]
            required: true
        }
    },
    cropType: {
        type: String,
        required: true,
        enum: ['Wheat', 'Rice', 'Corn', 'Cotton', 'Soybeans', 'Other']
    },
    cropHistory: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Crop'
    }],
    creditScores: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CreditScore'
    }]
}, {
    timestamps: true
});

// Hash password before saving
farmerSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Method to compare password
farmerSchema.methods.comparePassword = async function(candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

const Farmer = mongoose.model('Farmer', farmerSchema);
module.exports = Farmer; 