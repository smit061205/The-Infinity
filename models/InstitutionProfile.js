const mongoose = require('mongoose');

// Define the schema for institution branches
const branchSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    branchCode: {
        type: String,
        trim: true
    },
    address: {
        street: String,
        city: String,
        state: String,
        postalCode: String,
        country: {
            type: String,
            default: 'India'
        },
        coordinates: {
            type: [Number], // [longitude, latitude]
            index: '2dsphere'
        }
    },
    contactNumber: String,
    email: String,
    manager: {
        name: String,
        contactNumber: String,
        email: String
    },
    isHeadOffice: {
        type: Boolean,
        default: false
    }
});

// Define the schema for loan products
const loanProductSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    code: String,
    description: String,
    interestRateMin: {
        type: Number,
        min: 0
    },
    interestRateMax: {
        type: Number,
        min: 0
    },
    termMin: {
        value: Number,
        unit: {
            type: String,
            enum: ['Days', 'Months', 'Years'],
            default: 'Months'
        }
    },
    termMax: {
        value: Number,
        unit: {
            type: String,
            enum: ['Days', 'Months', 'Years'],
            default: 'Months'
        }
    },
    loanAmountMin: Number,
    loanAmountMax: Number,
    eligibilityCriteria: String,
    documentRequirements: [String],
    processingFee: {
        type: Number,
        default: 0
    },
    processingFeeType: {
        type: String,
        enum: ['Fixed', 'Percentage'],
        default: 'Percentage'
    },
    collateralRequired: {
        type: Boolean,
        default: false
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Define the schema for institution profile
const institutionProfileSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    registrationNumber: {
        type: String,
        trim: true
    },
    taxId: {
        type: String,
        trim: true
    },
    institutionType: {
        type: String,
        enum: ['Bank', 'NBFC', 'MFI', 'Credit Union', 'Cooperative', 'Government', 'Other'],
        required: true
    },
    yearEstablished: Number,
    website: String,
    logo: String,
    description: String,
    headquarters: {
        address: {
            street: String,
            city: String,
            state: String,
            postalCode: String,
            country: {
                type: String,
                default: 'India'
            }
        },
        contactNumber: String,
        email: String
    },
    branches: [branchSchema],
    loanProducts: [loanProductSchema],
    servingStates: [String], // List of states where the institution operates
    farmersServed: {
        type: Number,
        default: 0
    },
    totalLoansDisbursed: {
        type: Number,
        default: 0
    },
    totalLoanAmount: {
        type: Number,
        default: 0
    },
    minimumCreditScoreRequired: {
        type: Number,
        min: 0,
        max: 100,
        default: 60
    },
    verificationStatus: {
        type: String,
        enum: ['Pending', 'Verified', 'Rejected'],
        default: 'Pending'
    },
    verifiedAt: Date,
    apiCredentials: {
        apiKey: String,
        secretKey: String,
        webhookUrl: String,
        ipWhitelist: [String]
    }
}, {
    timestamps: true
});

// Index for faster lookup
institutionProfileSchema.index({ userId: 1 });
institutionProfileSchema.index({ institutionType: 1 });
institutionProfileSchema.index({ 'branches.address.coordinates': '2dsphere' });

// Virtual for loans issued by this institution
institutionProfileSchema.virtual('loans', {
    ref: 'Loan',
    localField: '_id',
    foreignField: 'lenderId'
});

// Method to update loan statistics
institutionProfileSchema.methods.updateLoanStats = async function() {
    const Loan = mongoose.model('Loan');
    
    const stats = await Loan.aggregate([
        { $match: { lenderId: this._id } },
        { $group: {
            _id: null,
            totalLoans: { $sum: 1 },
            totalAmount: { $sum: '$amount' },
            uniqueFarmers: { $addToSet: '$borrowerId' }
        }}
    ]);
    
    if (stats.length > 0) {
        this.totalLoansDisbursed = stats[0].totalLoans;
        this.totalLoanAmount = stats[0].totalAmount;
        this.farmersServed = stats[0].uniqueFarmers.length;
        await this.save();
    }
    
    return {
        totalLoansDisbursed: this.totalLoansDisbursed,
        totalLoanAmount: this.totalLoanAmount,
        farmersServed: this.farmersServed
    };
};

const InstitutionProfile = mongoose.model('InstitutionProfile', institutionProfileSchema);
module.exports = InstitutionProfile; 