const mongoose = require('mongoose');

// Define the transaction schema
const transactionSchema = new mongoose.Schema({
    transactionId: {
        type: String,
        required: true,
        unique: true
    },
    relatedLoanId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Loan'
    },
    relatedRepaymentId: mongoose.Schema.Types.ObjectId,
    farmerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'FarmerProfile',
        required: true
    },
    institutionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'InstitutionProfile'
    },
    type: {
        type: String,
        enum: ['Loan Disbursement', 'Loan Repayment', 'Processing Fee', 'Penalty Payment', 'Subsidy', 'Refund', 'Adjustment', 'Other'],
        required: true
    },
    subType: String,
    amount: {
        type: Number,
        required: true
    },
    currency: {
        type: String,
        default: 'INR'
    },
    date: {
        type: Date,
        default: Date.now,
        required: true
    },
    paymentMethod: {
        type: String,
        enum: ['Cash', 'Bank Transfer', 'Check', 'Digital Wallet', 'UPI', 'NEFT', 'RTGS', 'IMPS', 'Other'],
        required: true
    },
    paymentDetails: {
        bankName: String,
        accountNumber: String,
        ifscCode: String,
        accountHolderName: String,
        checkNumber: String,
        walletProvider: String,
        walletId: String,
        upiId: String,
        reference: String
    },
    status: {
        type: String,
        enum: ['Pending', 'Completed', 'Failed', 'Cancelled', 'Refunded', 'Disputed'],
        default: 'Pending'
    },
    statusHistory: [{
        status: {
            type: String,
            enum: ['Pending', 'Completed', 'Failed', 'Cancelled', 'Refunded', 'Disputed']
        },
        date: {
            type: Date,
            default: Date.now
        },
        updatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        notes: String
    }],
    description: String,
    externalRefNumber: String,
    processingFee: {
        type: Number,
        default: 0
    },
    taxes: {
        type: Number,
        default: 0
    },
    netAmount: Number,
    receiptUrl: String,
    metadata: {
        type: Map,
        of: String
    },
    tags: [String],
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    verifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    verifiedAt: Date,
    notes: String
}, {
    timestamps: true
});

// Indexes for faster querying
transactionSchema.index({ farmerId: 1, date: -1 });
transactionSchema.index({ institutionId: 1, date: -1 });
transactionSchema.index({ relatedLoanId: 1 });
transactionSchema.index({ type: 1, date: -1 });
transactionSchema.index({ status: 1 });
transactionSchema.index({ transactionId: 1 });

// Virtual field for transaction age in days
transactionSchema.virtual('ageInDays').get(function() {
    const now = new Date();
    const transactionDate = this.date || now;
    const diffTime = Math.abs(now - transactionDate);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Pre-save hook to generate transaction ID if not provided
transactionSchema.pre('save', function(next) {
    // Calculate net amount
    this.netAmount = this.amount - (this.processingFee || 0) - (this.taxes || 0);
    
    // Generate transaction ID if not provided
    if (!this.transactionId) {
        const prefix = this.type.slice(0, 3).toUpperCase();
        const timestamp = Date.now().toString();
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        this.transactionId = `${prefix}-${timestamp.slice(-8)}-${random}`;
    }
    
    // Update status history if status has changed
    if (this.isModified('status')) {
        const newStatus = {
            status: this.status,
            date: new Date()
        };
        
        if (!this.statusHistory) {
            this.statusHistory = [];
        }
        
        this.statusHistory.push(newStatus);
    }
    
    next();
});

// Method to update transaction status
transactionSchema.methods.updateStatus = async function(newStatus, updatedBy, notes) {
    if (!['Pending', 'Completed', 'Failed', 'Cancelled', 'Refunded', 'Disputed'].includes(newStatus)) {
        throw new Error('Invalid status value');
    }
    
    this.status = newStatus;
    
    const statusUpdate = {
        status: newStatus,
        date: new Date()
    };
    
    if (updatedBy) {
        statusUpdate.updatedBy = updatedBy;
    }
    
    if (notes) {
        statusUpdate.notes = notes;
    }
    
    if (!this.statusHistory) {
        this.statusHistory = [];
    }
    
    this.statusHistory.push(statusUpdate);
    
    // Special handling for status transitions
    if (newStatus === 'Completed') {
        this.verifiedAt = new Date();
        this.verifiedBy = updatedBy;
    }
    
    return this.save();
};

// Method to generate receipt
transactionSchema.methods.generateReceipt = async function() {
    // In a real application, this would generate a PDF receipt
    // and save it to a file storage service, then update the receiptUrl
    
    // For now, we'll just simulate the process
    const receiptId = `RCPT-${Date.now()}`;
    this.receiptUrl = `/receipts/${receiptId}.pdf`;
    
    return this.save();
};

// Static method to find transactions by date range
transactionSchema.statics.findByDateRange = function(startDate, endDate, filters = {}) {
    const query = { ...filters };
    
    if (startDate || endDate) {
        query.date = {};
        
        if (startDate) {
            query.date.$gte = new Date(startDate);
        }
        
        if (endDate) {
            query.date.$lte = new Date(endDate);
        }
    }
    
    return this.find(query).sort({ date: -1 });
};

// Transactions aggregation by type for a specific farmer
transactionSchema.statics.aggregateByTypeForFarmer = async function(farmerId, startDate, endDate) {
    const matchStage = {
        farmerId: mongoose.Types.ObjectId(farmerId)
    };
    
    if (startDate || endDate) {
        matchStage.date = {};
        
        if (startDate) {
            matchStage.date.$gte = new Date(startDate);
        }
        
        if (endDate) {
            matchStage.date.$lte = new Date(endDate);
        }
    }
    
    return this.aggregate([
        { $match: matchStage },
        { 
            $group: {
                _id: '$type',
                totalAmount: { $sum: '$amount' },
                count: { $sum: 1 },
                transactions: { 
                    $push: {
                        _id: '$_id',
                        transactionId: '$transactionId',
                        amount: '$amount',
                        date: '$date',
                        status: '$status'
                    }
                }
            }
        },
        {
            $sort: { totalAmount: -1 }
        }
    ]);
};

const Transaction = mongoose.model('Transaction', transactionSchema);
module.exports = Transaction; 