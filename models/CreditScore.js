const mongoose = require('mongoose');

// Define the schema for credit score
const creditScoreSchema = new mongoose.Schema({
    farmerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'FarmerProfile',
        required: true
    },
    score: {
        type: Number,
        required: true,
        min: 0,
        max: 100
    },
    creditRating: {
        type: String,
        enum: ['A+', 'A', 'B+', 'B', 'C+', 'C', 'D'],
        required: true
    },
    riskCategory: {
        type: String,
        enum: ['Very Low', 'Low', 'Moderate', 'High', 'Very High'],
        required: true
    },
    breakdown: {
        // Farm productivity factors (25%)
        farmProductivity: {
            score: {
                type: Number,
                min: 0,
                max: 25
            },
            cropYields: {
                score: Number,
                weight: Number,
                notes: String
            },
            cropDiversity: {
                score: Number,
                weight: Number,
                notes: String
            },
            farmSize: {
                score: Number,
                weight: Number,
                notes: String
            },
            landQuality: {
                score: Number,
                weight: Number,
                notes: String
            }
        },
        
        // Environmental factors (20%)
        environmental: {
            score: {
                type: Number,
                min: 0,
                max: 20
            },
            weatherPatterns: {
                score: Number,
                weight: Number,
                notes: String
            },
            soilHealth: {
                score: Number,
                weight: Number,
                notes: String
            },
            waterAvailability: {
                score: Number,
                weight: Number,
                notes: String
            },
            climateRiskMitigation: {
                score: Number,
                weight: Number,
                notes: String
            }
        },
        
        // Financial factors (30%)
        financial: {
            score: {
                type: Number,
                min: 0,
                max: 30
            },
            profitMargins: {
                score: Number,
                weight: Number,
                notes: String
            },
            debtServiceRatio: {
                score: Number,
                weight: Number,
                notes: String
            },
            financialRecords: {
                score: Number,
                weight: Number,
                notes: String
            },
            repaymentHistory: {
                score: Number,
                weight: Number,
                notes: String
            },
            savingsBuffer: {
                score: Number,
                weight: Number,
                notes: String
            }
        },
        
        // Personal factors (15%)
        personal: {
            score: {
                type: Number,
                min: 0,
                max: 15
            },
            farmingExperience: {
                score: Number,
                weight: Number,
                notes: String
            },
            educationLevel: {
                score: Number,
                weight: Number,
                notes: String
            },
            localReputation: {
                score: Number,
                weight: Number,
                notes: String
            },
            communityEngagement: {
                score: Number,
                weight: Number,
                notes: String
            }
        },
        
        // Innovation factors (10%)
        innovation: {
            score: {
                type: Number,
                min: 0,
                max: 10
            },
            techAdoption: {
                score: Number,
                weight: Number,
                notes: String
            },
            sustainablePractices: {
                score: Number,
                weight: Number,
                notes: String
            },
            farmModernization: {
                score: Number,
                weight: Number,
                notes: String
            }
        }
    },
    recommendations: [{
        category: {
            type: String,
            enum: ['Farm Productivity', 'Environmental', 'Financial', 'Personal', 'Innovation']
        },
        title: String,
        description: String,
        priorityLevel: {
            type: String,
            enum: ['Low', 'Medium', 'High', 'Critical']
        },
        potentialImpact: {
            type: Number, // Expected score improvement
            min: 0,
            max: 20
        }
    }],
    loanEligibility: {
        maxEligibleAmount: Number,
        recommendedInterestRate: {
            min: Number,
            max: Number
        },
        recommendedTerm: {
            min: Number,
            max: Number,
            unit: {
                type: String,
                enum: ['Months', 'Years'],
                default: 'Months'
            }
        },
        collateralRequirement: {
            type: Boolean,
            default: false
        }
    },
    evaluationType: {
        type: String,
        enum: ['Initial', 'Periodic Review', 'Post-Loan', 'Pre-Loan'],
        default: 'Initial'
    },
    evaluationMethod: {
        type: String,
        enum: ['Automated', 'Manual', 'Hybrid'],
        default: 'Hybrid'
    },
    dataCompleteness: {
        type: Number, // Percentage of data fields that had valid data
        min: 0,
        max: 100
    },
    confidenceScore: {
        type: Number, // How confident the system is in the score accuracy
        min: 0,
        max: 100
    },
    evaluatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User' // Could be an AI system or human analyst
    },
    verifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User' // Human verification if required
    },
    verifiedAt: Date,
    expiresAt: {
        type: Date,
        default: function() {
            // Default expiry 6 months from creation
            const now = new Date();
            return new Date(now.setMonth(now.getMonth() + 6));
        }
    },
    dataUsed: {
        cropHistory: {
            used: {
                type: Boolean,
                default: false
            },
            count: Number,
            timeRange: {
                start: Date,
                end: Date
            }
        },
        weatherData: {
            used: {
                type: Boolean,
                default: false
            },
            sources: [String]
        },
        soilData: {
            used: {
                type: Boolean,
                default: false
            },
            testDate: Date,
            source: String
        },
        financialRecords: {
            used: {
                type: Boolean,
                default: false
            },
            sources: [String],
            timeRange: {
                start: Date,
                end: Date
            }
        },
        repaymentHistory: {
            used: {
                type: Boolean,
                default: false
            },
            numLoans: Number,
            timeRange: {
                start: Date,
                end: Date
            }
        }
    },
    history: [{
        date: {
            type: Date,
            default: Date.now
        },
        changeType: {
            type: String,
            enum: ['Created', 'Updated', 'Verified', 'Expired']
        },
        previousScore: Number,
        newScore: Number,
        changedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        notes: String
    }]
}, {
    timestamps: true
});

// Indexes for faster querying
creditScoreSchema.index({ farmerId: 1, createdAt: -1 });
creditScoreSchema.index({ score: 1 });
creditScoreSchema.index({ creditRating: 1 });
creditScoreSchema.index({ riskCategory: 1 });
creditScoreSchema.index({ expiresAt: 1 });

// Static method to get latest credit score for a farmer
creditScoreSchema.statics.getLatestScore = async function(farmerId) {
    return this.findOne({ farmerId })
        .sort({ createdAt: -1 })
        .exec();
};

// Method to update score history
creditScoreSchema.methods.addToHistory = async function(changeData) {
    this.history.push({
        date: new Date(),
        changeType: changeData.changeType,
        previousScore: changeData.previousScore,
        newScore: changeData.newScore,
        changedBy: changeData.changedBy,
        notes: changeData.notes
    });
    
    return this.save();
};

// Method to check if score is expired
creditScoreSchema.methods.isExpired = function() {
    return new Date() > this.expiresAt;
};

// Method to extend expiry date
creditScoreSchema.methods.extendExpiry = async function(months = 6) {
    const currentExpiry = this.expiresAt || new Date();
    this.expiresAt = new Date(currentExpiry.setMonth(currentExpiry.getMonth() + months));
    
    await this.addToHistory({
        changeType: 'Updated',
        previousScore: this.score,
        newScore: this.score,
        notes: `Expiry date extended by ${months} months`
    });
    
    return this.save();
};

// Pre-save middleware to determine credit rating based on score
creditScoreSchema.pre('save', function(next) {
    // Set credit rating based on score
    if (this.score >= 90) {
        this.creditRating = 'A+';
        this.riskCategory = 'Very Low';
    } else if (this.score >= 80) {
        this.creditRating = 'A';
        this.riskCategory = 'Low';
    } else if (this.score >= 70) {
        this.creditRating = 'B+';
        this.riskCategory = 'Low';
    } else if (this.score >= 60) {
        this.creditRating = 'B';
        this.riskCategory = 'Moderate';
    } else if (this.score >= 50) {
        this.creditRating = 'C+';
        this.riskCategory = 'Moderate';
    } else if (this.score >= 40) {
        this.creditRating = 'C';
        this.riskCategory = 'High';
    } else {
        this.creditRating = 'D';
        this.riskCategory = 'Very High';
    }
    
    next();
});

const CreditScore = mongoose.model('CreditScore', creditScoreSchema);
module.exports = CreditScore; 