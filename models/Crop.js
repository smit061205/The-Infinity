const mongoose = require('mongoose');

// Define the schema for crop
const cropSchema = new mongoose.Schema({
    farmerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'FarmerProfile',
        required: true
    },
    farmId: {
        type: mongoose.Schema.Types.ObjectId
        // This refers to a specific farm from the farmer's farms array
    },
    cropType: {
        type: String,
        required: true,
        enum: ['Wheat', 'Rice', 'Corn', 'Cotton', 'Soybeans', 'Pulses', 'Vegetables', 'Fruits', 'Other']
    },
    cropVariety: {
        type: String,
        trim: true
    },
    season: {
        type: String,
        enum: ['Kharif', 'Rabi', 'Zaid', 'Year-round'],
        required: true
    },
    year: {
        type: Number,
        required: true
    },
    plantingDate: {
        type: Date,
        required: true
    },
    harvestDate: Date,
    fieldSize: {
        value: {
            type: Number,
            min: 0,
            required: true
        },
        unit: {
            type: String,
            enum: ['Acres', 'Hectares'],
            default: 'Acres'
        }
    },
    status: {
        type: String,
        enum: ['Planned', 'Planted', 'Growing', 'Harvested', 'Failed'],
        default: 'Planned'
    },
    expectedYield: {
        value: {
            type: Number,
            min: 0
        },
        unit: {
            type: String,
            enum: ['Kg', 'Quintal', 'Tonnes'],
            default: 'Quintal'
        }
    },
    actualYield: {
        value: {
            type: Number,
            min: 0
        },
        unit: {
            type: String,
            enum: ['Kg', 'Quintal', 'Tonnes'],
            default: 'Quintal'
        }
    },
    seedDetails: {
        source: String, // Where seeds were purchased from
        cost: Number,
        quantity: Number,
        quality: {
            type: String,
            enum: ['Standard', 'Certified', 'Foundation', 'Hybrid', 'GM', 'Organic', 'Heritage']
        }
    },
    fertilizers: [{
        name: String,
        quantity: Number,
        applicationDate: Date,
        cost: Number
    }],
    pesticides: [{
        name: String,
        quantity: Number,
        applicationDate: Date,
        purpose: String,
        cost: Number
    }],
    irrigationSchedule: [{
        date: Date,
        duration: Number, // in hours
        method: {
            type: String,
            enum: ['Drip', 'Sprinkler', 'Flood', 'Furrow', 'Rain', 'Other']
        },
        cost: Number
    }],
    labourCost: Number,
    otherCosts: [{
        description: String,
        amount: Number,
        date: Date
    }],
    totalCost: Number, // Calculated field
    saleDetails: [{
        date: Date,
        quantity: {
            value: Number,
            unit: {
                type: String,
                enum: ['Kg', 'Quintal', 'Tonnes'],
                default: 'Quintal'
            }
        },
        pricePerUnit: Number,
        totalAmount: Number,
        buyer: String,
        paymentReceived: {
            type: Boolean,
            default: false
        },
        paymentDate: Date,
        paymentMethod: {
            type: String,
            enum: ['Cash', 'Bank Transfer', 'Check', 'Digital Wallet', 'Credit', 'Other']
        },
        receiptNumber: String
    }],
    totalRevenue: {
        type: Number,
        default: 0
    },
    profit: {
        type: Number,
        default: 0
    },
    profitPercentage: {
        type: Number,
        default: 0
    },
    notes: String,
    images: [String], // URLs to images of the crop
    weatherData: [{
        date: Date,
        temperature: {
            min: Number,
            max: Number,
            unit: {
                type: String,
                enum: ['Celsius', 'Fahrenheit'],
                default: 'Celsius'
            }
        },
        rainfall: {
            amount: Number,
            unit: {
                type: String,
                enum: ['mm', 'inches'],
                default: 'mm'
            }
        },
        humidity: Number, // percentage
        notes: String
    }],
    diseases: [{
        name: String,
        detectedDate: Date,
        severity: {
            type: String,
            enum: ['Low', 'Medium', 'High']
        },
        treatmentApplied: String,
        treatmentDate: Date,
        resolved: {
            type: Boolean,
            default: false
        },
        notes: String
    }],
    qualityAssessment: {
        grade: {
            type: String,
            enum: ['A', 'B', 'C', 'D', 'Ungraded']
        },
        moistureContent: Number, // percentage
        purity: Number, // percentage
        damage: {
            type: String,
            enum: ['None', 'Slight', 'Moderate', 'Severe']
        },
        notes: String
    }
}, {
    timestamps: true
});

// Indexes for faster querying
cropSchema.index({ farmerId: 1, season: 1, year: 1 });
cropSchema.index({ cropType: 1 });
cropSchema.index({ plantingDate: 1 });
cropSchema.index({ status: 1 });

// Pre-save hook to calculate derived fields
cropSchema.pre('save', function(next) {
    // Calculate total cost
    let totalCost = 0;
    
    // Add seed cost
    if (this.seedDetails && this.seedDetails.cost) {
        totalCost += this.seedDetails.cost;
    }
    
    // Add fertilizer costs
    if (this.fertilizers && this.fertilizers.length > 0) {
        this.fertilizers.forEach(fertilizer => {
            if (fertilizer.cost) totalCost += fertilizer.cost;
        });
    }
    
    // Add pesticide costs
    if (this.pesticides && this.pesticides.length > 0) {
        this.pesticides.forEach(pesticide => {
            if (pesticide.cost) totalCost += pesticide.cost;
        });
    }
    
    // Add irrigation costs
    if (this.irrigationSchedule && this.irrigationSchedule.length > 0) {
        this.irrigationSchedule.forEach(irrigation => {
            if (irrigation.cost) totalCost += irrigation.cost;
        });
    }
    
    // Add labour cost
    if (this.labourCost) {
        totalCost += this.labourCost;
    }
    
    // Add other costs
    if (this.otherCosts && this.otherCosts.length > 0) {
        this.otherCosts.forEach(cost => {
            if (cost.amount) totalCost += cost.amount;
        });
    }
    
    this.totalCost = totalCost;
    
    // Calculate total revenue
    let totalRevenue = 0;
    if (this.saleDetails && this.saleDetails.length > 0) {
        this.saleDetails.forEach(sale => {
            if (sale.totalAmount) totalRevenue += sale.totalAmount;
        });
    }
    this.totalRevenue = totalRevenue;
    
    // Calculate profit
    const profit = totalRevenue - totalCost;
    this.profit = profit;
    
    // Calculate profit percentage
    if (totalCost > 0) {
        this.profitPercentage = (profit / totalCost) * 100;
    }
    
    next();
});

const Crop = mongoose.model('Crop', cropSchema);
module.exports = Crop; 