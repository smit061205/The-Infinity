const mongoose = require('mongoose');

// Enum values for crops
const cropTypes = ['Wheat', 'Rice', 'Corn', 'Cotton', 'Soybeans', 'Pulses', 'Vegetables', 'Fruits', 'Other'];

// Enum values for irrigation types
const irrigationTypes = ['Rainfed', 'Canal', 'Drip', 'Sprinkler', 'Groundwater', 'Other'];

// Enum values for soil types
const soilTypes = ['Alluvial', 'Black', 'Red', 'Laterite', 'Desert', 'Mountain', 'Other'];

// Define the schema for a farm
const farmSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true
    },
    size: {
        value: {
            type: Number,
            min: 0
        },
        unit: {
            type: String,
            enum: ['Acres', 'Hectares'],
            default: 'Acres'
        }
    },
    location: {
        address: {
            village: String,
            district: String,
            state: String,
            postalCode: String
        },
        coordinates: {
            type: [Number], // [longitude, latitude]
            index: '2dsphere'
        }
    },
    soilType: {
        type: String,
        enum: soilTypes
    },
    irrigationType: {
        type: String,
        enum: irrigationTypes
    },
    ownership: {
        type: String,
        enum: ['Owned', 'Leased', 'Shared', 'Other'],
        default: 'Owned'
    },
    images: [String]
});

// Define the schema for farmer profile
const farmerProfileSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    email: {
        type: String,
        trim: true,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Please provide a valid email address'
        ]
    },
    aadharNumber: {
        type: String, 
        trim: true,
        match: [/^\d{12}$/, 'Please provide a valid 12-digit Aadhar number']
    },
    panNumber: {
        type: String,
        trim: true,
        match: [/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'Please provide a valid PAN number']
    },
    dateOfBirth: Date,
    gender: {
        type: String,
        enum: ['Male', 'Female', 'Other']
    },
    farms: [farmSchema],
    primaryCrops: [{
        type: String,
        enum: cropTypes
    }],
    experience: {
        type: Number, // Years of farming experience
        min: 0
    },
    educationLevel: {
        type: String,
        enum: ['Primary', 'Secondary', 'Higher Secondary', 'Graduate', 'Post-Graduate', 'None']
    },
    familySize: {
        type: Number,
        min: 1
    },
    annualIncome: {
        amount: {
            type: Number,
            min: 0
        },
        year: Number
    },
    bankDetails: {
        accountNumber: String, 
        bankName: String,
        ifscCode: String,
        accountHolderName: String
    },
    hasInsurance: {
        type: Boolean,
        default: false
    },
    insuranceDetails: {
        provider: String,
        policyNumber: String,
        coverageAmount: Number,
        expiryDate: Date
    },
    governmentSchemes: [{
        name: String,
        id: String,
        joinedDate: Date
    }],
    creditHistory: [{
        lender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'InstitutionProfile'
        },
        loanType: String,
        amount: Number,
        interestRate: Number,
        startDate: Date,
        endDate: Date,
        status: {
            type: String,
            enum: ['Active', 'Completed', 'Defaulted', 'Rejected']
        },
        purpose: String
    }]
}, {
    timestamps: true
});

// Index for faster lookup
farmerProfileSchema.index({ userId: 1 });

// Virtual populated field for credit scores
farmerProfileSchema.virtual('creditScores', {
    ref: 'CreditScore',
    localField: '_id',
    foreignField: 'farmerId',
    options: { sort: { createdAt: -1 } } // Sort by most recent
});

// Virtual populated field for crops
farmerProfileSchema.virtual('cropHistory', {
    ref: 'Crop',
    localField: '_id',
    foreignField: 'farmerId'
});

// Get latest credit score
farmerProfileSchema.methods.getLatestCreditScore = async function() {
    await this.populate({
        path: 'creditScores',
        options: { limit: 1, sort: { createdAt: -1 } }
    });
    return this.creditScores.length > 0 ? this.creditScores[0] : null;
};

const FarmerProfile = mongoose.model('FarmerProfile', farmerProfileSchema);
module.exports = FarmerProfile; 