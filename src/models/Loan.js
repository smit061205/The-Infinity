const mongoose = require('mongoose');

// Define the schema for loan repayments
const repaymentSchema = new mongoose.Schema({
    amount: {
        type: Number,
        required: true,
        min: 0
    },
    dueDate: {
        type: Date,
        required: true
    },
    paidDate: Date,
    paidAmount: {
        type: Number,
        min: 0
    },
    status: {
        type: String,
        enum: ['Pending', 'Partial', 'Paid', 'Overdue', 'Defaulted'],
        default: 'Pending'
    },
    paymentMethod: {
        type: String,
        enum: ['Cash', 'Bank Transfer', 'Check', 'Digital Wallet', 'Auto Debit', 'Other']
    },
    transactionId: String,
    notes: String
});

// Define the schema for loan documents
const loanDocumentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['ID Proof', 'Address Proof', 'Income Proof', 'Land Document', 'Crop Insurance', 'Bank Statement', 'Other']
    },
    fileUrl: {
        type: String,
        required: true
    },
    uploadedAt: {
        type: Date,
        default: Date.now
    },
    verifiedAt: Date,
    verifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    notes: String
});

// Define the schema for loan
const loanSchema = new mongoose.Schema({
    loanNumber: {
        type: String,
        required: true,
        unique: true
    },
    borrowerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'FarmerProfile',
        required: true
    },
    lenderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'InstitutionProfile',
        required: true
    },
    loanProductId: {
        type: mongoose.Schema.Types.ObjectId
        // This would reference a specific loan product from the lender
    },
    amount: {
        type: Number,
        required: true,
        min: 1000
    },
    interestRate: {
        type: Number,
        required: true,
        min: 0
    },
    interestType: {
        type: String,
        enum: ['Simple', 'Compound', 'Reducing Balance'],
        default: 'Reducing Balance'
    },
    term: {
        value: {
            type: Number,
            required: true,
            min: 1
        },
        unit: {
            type: String,
            enum: ['Days', 'Months', 'Years'],
            default: 'Months'
        }
    },
    disbursementDate: Date,
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    purpose: {
        type: String,
        required: true,
        enum: ['Crop Production', 'Equipment Purchase', 'Land Development', 'Infrastructure', 'Working Capital', 'Refinancing', 'Other']
    },
    purposeDescription: String,
    repaymentFrequency: {
        type: String,
        enum: ['Daily', 'Weekly', 'Biweekly', 'Monthly', 'Quarterly', 'Biannually', 'Annually', 'Custom', 'Bullet'],
        default: 'Monthly'
    },
    totalRepayments: {
        type: Number,
        min: 1
    },
    processingFee: {
        amount: Number,
        type: {
            type: String,
            enum: ['Fixed', 'Percentage'],
            default: 'Percentage'
        }
    },
    loanStatus: {
        type: String,
        enum: ['Applied', 'Under Review', 'Approved', 'Rejected', 'Disbursed', 'Active', 'Closed', 'Defaulted', 'Restructured'],
        default: 'Applied'
    },
    rejectionReason: String,
    collateral: {
        required: {
            type: Boolean,
            default: false
        },
        type: {
            type: String,
            enum: ['Land', 'Property', 'Equipment', 'Crop', 'Gold', 'Guarantor', 'Other']
        },
        value: Number,
        description: String,
        documents: [loanDocumentSchema]
    },
    creditScoreId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CreditScore'
    },
    repayments: [repaymentSchema],
    documents: [loanDocumentSchema],
    disbursementMethod: {
        type: String,
        enum: ['Bank Transfer', 'Cash', 'Check', 'Digital Wallet', 'Other']
    },
    disbursementDetails: {
        accountNumber: String,
        bankName: String,
        ifscCode: String,
        accountHolderName: String,
        transactionId: String
    },
    totalPaid: {
        type: Number,
        default: 0
    },
    totalOutstanding: Number,
    overdueDays: {
        type: Number,
        default: 0
    },
    overduePenalty: {
        rate: Number,
        amount: {
            type: Number,
            default: 0
        }
    },
    creditOfficerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    approvedAt: Date,
    closedAt: Date,
    closedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    statusHistory: [{
        status: {
            type: String,
            enum: ['Applied', 'Under Review', 'Approved', 'Rejected', 'Disbursed', 'Active', 'Closed', 'Defaulted', 'Restructured']
        },
        date: {
            type: Date,
            default: Date.now
        },
        changedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        notes: String
    }],
    notes: String
}, {
    timestamps: true
});

// Indexes for faster querying
loanSchema.index({ borrowerId: 1 });
loanSchema.index({ lenderId: 1 });
loanSchema.index({ loanStatus: 1 });
loanSchema.index({ startDate: 1, endDate: 1 });
loanSchema.index({ 'repayments.dueDate': 1, 'repayments.status': 1 });

// Virtual for total repayable amount
loanSchema.virtual('totalRepayable').get(function() {
    // Simple interest calculation
    if (this.interestType === 'Simple') {
        const principal = this.amount;
        const ratePerYear = this.interestRate / 100;
        const termInYears = this.term.unit === 'Years' 
            ? this.term.value 
            : this.term.unit === 'Months' 
                ? this.term.value / 12 
                : this.term.value / 365;
                
        return principal + (principal * ratePerYear * termInYears);
    }
    
    // For other interest types, sum up scheduled repayments
    let total = 0;
    if (this.repayments && this.repayments.length > 0) {
        this.repayments.forEach(repayment => {
            total += repayment.amount;
        });
    }
    return total;
});

// Pre-save hook to update loan status history
loanSchema.pre('save', function(next) {
    // If this is a new loan or status has changed
    if (this.isNew || this.isModified('loanStatus')) {
        const newStatus = {
            status: this.loanStatus,
            date: new Date()
        };
        
        if (!this.statusHistory) {
            this.statusHistory = [];
        }
        
        this.statusHistory.push(newStatus);
    }
    
    next();
});

// Method to calculate current loan status
loanSchema.methods.calculateStatus = async function() {
    const now = new Date();
    
    // Check if the loan is closed or defaulted already
    if (['Closed', 'Defaulted'].includes(this.loanStatus)) {
        return this.loanStatus;
    }
    
    // Check if the loan has been disbursed
    if (!this.disbursementDate) {
        return this.loanStatus; // Return whatever the current status is
    }
    
    // Calculate overdue days and outstanding amount
    let totalPaid = 0;
    let overdueAmount = 0;
    let maxOverdueDays = 0;
    
    if (this.repayments && this.repayments.length > 0) {
        this.repayments.forEach(repayment => {
            if (repayment.paidAmount) {
                totalPaid += repayment.paidAmount;
            }
            
            // Check if repayment is overdue
            if (['Pending', 'Partial', 'Overdue'].includes(repayment.status) && repayment.dueDate < now) {
                const daysOverdue = Math.floor((now - repayment.dueDate) / (1000 * 60 * 60 * 24));
                
                if (daysOverdue > maxOverdueDays) {
                    maxOverdueDays = daysOverdue;
                }
                
                const unpaidAmount = repayment.amount - (repayment.paidAmount || 0);
                overdueAmount += unpaidAmount;
            }
        });
    }
    
    // Update loan fields
    this.totalPaid = totalPaid;
    this.totalOutstanding = (this.totalRepayable || this.amount) - totalPaid;
    this.overdueDays = maxOverdueDays;
    
    // Update status based on conditions
    if (this.totalOutstanding <= 0 && this.loanStatus === 'Active') {
        this.loanStatus = 'Closed';
        this.closedAt = now;
    } else if (maxOverdueDays >= 90 && this.loanStatus === 'Active') {
        this.loanStatus = 'Defaulted';
    } else if (this.disbursementDate && this.loanStatus !== 'Active' && this.loanStatus !== 'Closed' && this.loanStatus !== 'Defaulted') {
        this.loanStatus = 'Active';
    }
    
    await this.save();
    return this.loanStatus;
};

// Method to make a repayment
loanSchema.methods.makeRepayment = async function(repaymentData) {
    // Find the repayment by ID or due date
    let repayment;
    
    if (repaymentData.repaymentId) {
        repayment = this.repayments.id(repaymentData.repaymentId);
    } else if (repaymentData.dueDate) {
        repayment = this.repayments.find(r => 
            r.dueDate.toISOString().split('T')[0] === new Date(repaymentData.dueDate).toISOString().split('T')[0] && 
            ['Pending', 'Partial', 'Overdue'].includes(r.status)
        );
    }
    
    if (!repayment) {
        throw new Error('Repayment not found or already paid');
    }
    
    // Update the repayment
    const paidAmount = repaymentData.amount;
    repayment.paidDate = repaymentData.paidDate || new Date();
    repayment.paidAmount = (repayment.paidAmount || 0) + paidAmount;
    repayment.paymentMethod = repaymentData.paymentMethod;
    repayment.transactionId = repaymentData.transactionId;
    repayment.notes = repaymentData.notes;
    
    // Update status
    if (repayment.paidAmount >= repayment.amount) {
        repayment.status = 'Paid';
    } else if (repayment.paidAmount > 0) {
        repayment.status = 'Partial';
    }
    
    // Update loan statistics
    await this.calculateStatus();
    
    return this.save();
};

// Method to generate repayment schedule
loanSchema.methods.generateRepaymentSchedule = async function() {
    // Clear any existing repayments
    this.repayments = [];
    
    const principal = this.amount;
    const interestRate = this.interestRate / 100;
    const numPayments = this.totalRepayments;
    
    let paymentAmount = 0;
    
    // Calculate payment amount based on interest type
    if (this.interestType === 'Reducing Balance') {
        // PMT formula: PMT = P * r * (1 + r)^n / ((1 + r)^n - 1)
        const ratePerPeriod = interestRate / 12; // Monthly rate
        paymentAmount = principal * ratePerPeriod * Math.pow(1 + ratePerPeriod, numPayments) 
            / (Math.pow(1 + ratePerPeriod, numPayments) - 1);
    } else if (this.interestType === 'Simple') {
        // Simple interest: total interest = P * r * t
        const termInYears = this.term.unit === 'Years' 
            ? this.term.value 
            : this.term.unit === 'Months' 
                ? this.term.value / 12 
                : this.term.value / 365;
                
        const totalInterest = principal * interestRate * termInYears;
        const totalAmount = principal + totalInterest;
        paymentAmount = totalAmount / numPayments;
    }
    
    // Generate the schedule
    let currentDate = new Date(this.startDate);
    let remainingPrincipal = principal;
    
    for (let i = 0; i < numPayments; i++) {
        let interestPayment = 0;
        let principalPayment = 0;
        
        if (this.interestType === 'Reducing Balance') {
            interestPayment = remainingPrincipal * (interestRate / 12);
            principalPayment = paymentAmount - interestPayment;
            remainingPrincipal -= principalPayment;
        } else {
            // For simple interest, equal payments
            principalPayment = principal / numPayments;
            interestPayment = paymentAmount - principalPayment;
        }
        
        const repayment = {
            amount: paymentAmount,
            dueDate: new Date(currentDate),
            status: 'Pending'
        };
        
        this.repayments.push(repayment);
        
        // Move to next payment date based on frequency
        if (this.repaymentFrequency === 'Monthly') {
            currentDate.setMonth(currentDate.getMonth() + 1);
        } else if (this.repaymentFrequency === 'Weekly') {
            currentDate.setDate(currentDate.getDate() + 7);
        } else if (this.repaymentFrequency === 'Biweekly') {
            currentDate.setDate(currentDate.getDate() + 14);
        } else if (this.repaymentFrequency === 'Quarterly') {
            currentDate.setMonth(currentDate.getMonth() + 3);
        }
    }
    
    return this.save();
};

const Loan = mongoose.model('Loan', loanSchema);
module.exports = Loan; 