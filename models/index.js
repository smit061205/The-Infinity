// Export all models for easier imports throughout the application
const User = require('./User');
const FarmerProfile = require('./FarmerProfile');
const InstitutionProfile = require('./InstitutionProfile');
const Crop = require('./Crop');
const CreditScore = require('./CreditScore');
const Loan = require('./Loan');
const Transaction = require('./Transaction');
const Notification = require('./Notification');

module.exports = {
    User,
    FarmerProfile,
    InstitutionProfile,
    Crop,
    CreditScore,
    Loan,
    Transaction,
    Notification
}; 