const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Define a schema for address information
const addressSchema = new mongoose.Schema({
    street: {
        type: String,
        trim: true
    },
    city: {
        type: String,
        trim: true
    },
    state: {
        type: String,
        trim: true
    },
    country: {
        type: String,
        default: 'India',
        trim: true
    },
    postalCode: {
        type: String,
        trim: true
    },
    coordinates: {
        type: [Number], // [longitude, latitude]
        default: [0, 0]
    }
});

// Define the user schema
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide your name'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Please provide an email address'],
        unique: true,
        trim: true,
        lowercase: true,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Please provide a valid email address'
        ]
    },
    phone: {
        type: String,
        trim: true
    },
    password: {
        type: String,
        required: [true, 'Please provide a password'],
        minlength: 6,
        select: false // Don't include password in query results by default
    },
    role: {
        type: String,
        enum: ['admin', 'farmer', 'institution', 'banker', 'analyst'],
        default: 'farmer'
    },
    profilePicture: String,
    address: addressSchema,
    isActive: {
        type: Boolean,
        default: true
    },
    lastLogin: Date,
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Add virtual for farmerProfile or institutionProfile based on role
userSchema.virtual('farmerProfile', {
    ref: 'FarmerProfile',
    localField: '_id',
    foreignField: 'userId',
    justOne: true
});

userSchema.virtual('institutionProfile', {
    ref: 'InstitutionProfile',
    localField: '_id',
    foreignField: 'userId',
    justOne: true
});

// Hash password before saving to database
userSchema.pre('save', async function(next) {
    // Only hash the password if it has been modified (or is new)
    if (!this.isModified('password')) return next();
    
    try {
        // Generate salt and hash the password
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Method to check if password matches
userSchema.methods.comparePassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Method to generate JWT token
userSchema.methods.getSignedToken = function() {
    // This would be implemented using jsonwebtoken
    // Kept here as a placeholder for implementation in authentication routes
    return null;
};

const User = mongoose.model('User', userSchema);
module.exports = User; 