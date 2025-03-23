/**
 * This file documents the relationships between models and provides helper functions
 * for working with these relationships in the application.
 */

const mongoose = require('mongoose');
const { 
    User, 
    FarmerProfile, 
    InstitutionProfile, 
    Crop, 
    CreditScore, 
    Loan, 
    Transaction, 
    Notification 
} = require('../models');

/**
 * Model Relationships Overview:
 * 
 * User -> FarmerProfile (one-to-one, User.role === 'farmer')
 * User -> InstitutionProfile (one-to-one, User.role === 'institution')
 * FarmerProfile -> Crop (one-to-many)
 * FarmerProfile -> CreditScore (one-to-many)
 * FarmerProfile -> Loan (one-to-many, as borrower)
 * InstitutionProfile -> Loan (one-to-many, as lender)
 * Loan -> Transaction (one-to-many)
 * User -> Notification (one-to-many)
 */

/**
 * Helper functions for working with User and profile relationships
 */
const userHelpers = {
    /**
     * Get the profile associated with a user based on their role
     */
    async getProfile(userId) {
        const user = await User.findById(userId);
        if (!user) return null;
        
        if (user.role === 'farmer') {
            return await FarmerProfile.findOne({ userId: user._id });
        } else if (user.role === 'institution') {
            return await InstitutionProfile.findOne({ userId: user._id });
        }
        
        return null;
    },
    
    /**
     * Create a profile for a user based on their role
     */
    async createProfile(userId, profileData) {
        const user = await User.findById(userId);
        if (!user) throw new Error('User not found');
        
        if (user.role === 'farmer') {
            const farmerProfile = new FarmerProfile({
                userId: user._id,
                ...profileData
            });
            return await farmerProfile.save();
        } else if (user.role === 'institution') {
            const institutionProfile = new InstitutionProfile({
                userId: user._id,
                ...profileData
            });
            return await institutionProfile.save();
        }
        
        throw new Error('User role does not support profile creation');
    }
};

/**
 * Helper functions for working with Farmer relationships
 */
const farmerHelpers = {
    /**
     * Get all crops for a farmer
     */
    async getCrops(farmerId) {
        return await Crop.find({ farmerId }).sort({ plantingDate: -1 });
    },
    
    /**
     * Get all credit scores for a farmer
     */
    async getCreditScores(farmerId) {
        return await CreditScore.find({ farmerId }).sort({ createdAt: -1 });
    },
    
    /**
     * Get the latest credit score for a farmer
     */
    async getLatestCreditScore(farmerId) {
        return await CreditScore.findOne({ farmerId }).sort({ createdAt: -1 });
    },
    
    /**
     * Get all loans for a farmer
     */
    async getLoans(farmerId) {
        return await Loan.find({ borrowerId: farmerId }).sort({ createdAt: -1 });
    },
    
    /**
     * Get all transactions for a farmer
     */
    async getTransactions(farmerId) {
        return await Transaction.find({ farmerId }).sort({ date: -1 });
    }
};

/**
 * Helper functions for working with Institution relationships
 */
const institutionHelpers = {
    /**
     * Get all loans issued by an institution
     */
    async getLoans(institutionId) {
        return await Loan.find({ lenderId: institutionId }).sort({ createdAt: -1 });
    },
    
    /**
     * Get loans by status for an institution
     */
    async getLoansByStatus(institutionId, status) {
        return await Loan.find({ 
            lenderId: institutionId,
            loanStatus: status 
        }).sort({ createdAt: -1 });
    },
    
    /**
     * Get all transactions for an institution
     */
    async getTransactions(institutionId) {
        return await Transaction.find({ institutionId }).sort({ date: -1 });
    },
    
    /**
     * Get loan statistics for an institution
     */
    async getLoanStatistics(institutionId) {
        const results = await Loan.aggregate([
            { $match: { lenderId: mongoose.Types.ObjectId(institutionId) } },
            { 
                $group: {
                    _id: '$loanStatus',
                    count: { $sum: 1 },
                    totalAmount: { $sum: '$amount' }
                }
            }
        ]);
        
        // Format results into a more usable object
        const statistics = {};
        results.forEach(item => {
            statistics[item._id] = {
                count: item.count,
                totalAmount: item.totalAmount
            };
        });
        
        return statistics;
    }
};

/**
 * Helper functions for working with Loan relationships
 */
const loanHelpers = {
    /**
     * Get all transactions for a loan
     */
    async getTransactions(loanId) {
        return await Transaction.find({ relatedLoanId: loanId }).sort({ date: -1 });
    },
    
    /**
     * Get detailed loan info with related entities
     */
    async getLoanWithDetails(loanId) {
        const loan = await Loan.findById(loanId);
        if (!loan) return null;
        
        const borrower = await FarmerProfile.findById(loan.borrowerId).populate('userId');
        const lender = await InstitutionProfile.findById(loan.lenderId).populate('userId');
        const creditScore = loan.creditScoreId ? await CreditScore.findById(loan.creditScoreId) : null;
        const transactions = await Transaction.find({ relatedLoanId: loan._id }).sort({ date: -1 });
        
        return {
            loan,
            borrower,
            lender,
            creditScore,
            transactions
        };
    }
};

/**
 * Helper functions for working with Notification relationships
 */
const notificationHelpers = {
    /**
     * Create a notification for loan events
     */
    async createLoanNotification(type, loanId, recipientId) {
        const loan = await Loan.findById(loanId);
        if (!loan) throw new Error('Loan not found');
        
        let title, message;
        
        switch (type) {
            case 'Loan_Application':
                title = 'New Loan Application';
                message = `A new loan application (#${loan.loanNumber}) has been submitted for ${loan.amount} INR.`;
                break;
            case 'Loan_Approved':
                title = 'Loan Approved';
                message = `Your loan application (#${loan.loanNumber}) for ${loan.amount} INR has been approved.`;
                break;
            case 'Loan_Rejected':
                title = 'Loan Rejected';
                message = `Your loan application (#${loan.loanNumber}) for ${loan.amount} INR has been rejected.`;
                break;
            case 'Loan_Disbursed':
                title = 'Loan Disbursed';
                message = `Your loan (#${loan.loanNumber}) for ${loan.amount} INR has been disbursed.`;
                break;
            case 'Repayment_Due':
                title = 'Loan Repayment Due';
                message = `Your loan repayment for ${loan.loanNumber} is due soon.`;
                break;
            case 'Repayment_Overdue':
                title = 'Loan Repayment Overdue';
                message = `Your loan repayment for ${loan.loanNumber} is overdue.`;
                break;
            default:
                title = 'Loan Update';
                message = `There has been an update to your loan (#${loan.loanNumber}).`;
        }
        
        return await Notification.createNotification({
            recipient: recipientId,
            type,
            title,
            message,
            relatedEntityType: 'Loan',
            relatedEntityId: loan._id,
            action: {
                text: 'View Loan',
                url: `/loans/${loan._id}`
            }
        });
    },
    
    /**
     * Create a notification for credit score events
     */
    async createCreditScoreNotification(creditScoreId, recipientId) {
        const creditScore = await CreditScore.findById(creditScoreId);
        if (!creditScore) throw new Error('Credit score not found');
        
        return await Notification.createNotification({
            recipient: recipientId,
            type: 'Credit_Score_Updated',
            title: 'Credit Score Updated',
            message: `Your credit score has been updated to ${creditScore.score}.`,
            relatedEntityType: 'CreditScore',
            relatedEntityId: creditScore._id,
            action: {
                text: 'View Credit Score',
                url: `/credit-score/${creditScore._id}`
            }
        });
    }
};

module.exports = {
    userHelpers,
    farmerHelpers,
    institutionHelpers,
    loanHelpers,
    notificationHelpers
}; 