const mongoose = require('mongoose');
require('dotenv').config();
const connectDB = require('../db');
const User = require('../models/User');
const FarmerProfile = require('../models/FarmerProfile');
const InstitutionProfile = require('../models/InstitutionProfile');
const Crop = require('../models/Crop');
const CreditScore = require('../models/CreditScore');
const Loan = require('../models/Loan');
const Transaction = require('../models/Transaction');
const Notification = require('../models/Notification');
const bcrypt = require('bcryptjs');

// Clear existing data
const clearDatabase = async () => {
  try {
    console.log('Clearing existing data...');
    await User.deleteMany({});
    await FarmerProfile.deleteMany({});
    await InstitutionProfile.deleteMany({});
    await Crop.deleteMany({});
    await CreditScore.deleteMany({});
    await Loan.deleteMany({});
    await Transaction.deleteMany({});
    await Notification.deleteMany({});
    console.log('Database cleared successfully');
  } catch (error) {
    console.error('Error clearing database:', error);
    process.exit(1);
  }
};

// Create users
const createUsers = async () => {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash('password123', salt);
  
  const users = [
    {
      name: 'Rajesh Kumar',
      email: 'rajesh.kumar@example.com',
      password: hashedPassword,
      phone: '9876543210',
      role: 'farmer',
      address: {
        street: 'Gandhi Road',
        city: 'Patna',
        state: 'Bihar',
        postalCode: '800001',
        country: 'India'
      }
    },
    {
      name: 'Sunita Patel',
      email: 'sunita.patel@example.com',
      password: hashedPassword,
      phone: '9876543211',
      role: 'farmer',
      address: {
        street: 'Main Road',
        city: 'Ahmedabad',
        state: 'Gujarat',
        postalCode: '380001',
        country: 'India'
      }
    },
    {
      name: 'Manoj Singh',
      email: 'manoj.singh@example.com',
      password: hashedPassword,
      phone: '9876543212',
      role: 'farmer',
      address: {
        street: 'Village Road',
        city: 'Jaipur',
        state: 'Rajasthan',
        postalCode: '302001',
        country: 'India'
      }
    },
    {
      name: 'State Bank of India',
      email: 'agri.sbi@example.com',
      password: hashedPassword,
      phone: '9876543213',
      role: 'institution',
      address: {
        street: 'Financial District',
        city: 'Mumbai',
        state: 'Maharashtra',
        postalCode: '400001',
        country: 'India'
      }
    },
    {
      name: 'Cooperative Agricultural Bank',
      email: 'coop.agri@example.com',
      password: hashedPassword,
      phone: '9876543214',
      role: 'institution',
      address: {
        street: 'Rural Credit Road',
        city: 'Pune',
        state: 'Maharashtra',
        postalCode: '411001',
        country: 'India'
      }
    }
  ];

  console.log('Creating users...');
  const createdUsers = await User.insertMany(users);
  console.log(`Created ${createdUsers.length} users`);
  return createdUsers;
};

// Create farmer profiles
const createFarmerProfiles = async (users) => {
  const farmers = users.filter(user => user.role === 'farmer');
  const farmerProfiles = [];

  for (const farmer of farmers) {
    farmerProfiles.push({
      userId: farmer._id,
      email: farmer.email,
      aadharNumber: '123456789012',
      panNumber: 'ABCDE1234F',
      dateOfBirth: new Date('1980-01-01'),
      gender: 'Male',
      farms: [
        {
          name: `${farmer.name.split(' ')[0]}'s Farm`,
          size: {
            value: Math.floor(Math.random() * 10) + 2,
            unit: 'Acres'
          },
          location: {
            address: {
              village: 'Sample Village',
              district: farmer.address.city,
              state: farmer.address.state,
              postalCode: farmer.address.postalCode
            },
            coordinates: [77.216721, 28.644800] // Example coordinates
          },
          soilType: 'Alluvial',
          irrigationType: 'Rainfed',
          ownership: 'Owned',
          images: ['https://example.com/farm1.jpg']
        }
      ],
      primaryCrops: ['Wheat', 'Rice'],
      experience: Math.floor(Math.random() * 15) + 5,
      educationLevel: 'Secondary',
      familySize: Math.floor(Math.random() * 5) + 2,
      annualIncome: {
        amount: (Math.floor(Math.random() * 200) + 50) * 1000,
        year: 2023
      },
      bankDetails: {
        accountNumber: '1234567890',
        bankName: 'Sample Bank',
        ifscCode: 'SAMP1234567',
        accountHolderName: farmer.name
      },
      hasInsurance: Math.random() > 0.5,
      governmentSchemes: [
        {
          name: 'PM Kisan',
          id: 'PMKISAN' + Math.floor(Math.random() * 10000),
          joinedDate: new Date('2022-01-01')
        }
      ]
    });
  }

  console.log('Creating farmer profiles...');
  const createdFarmerProfiles = await FarmerProfile.insertMany(farmerProfiles);
  console.log(`Created ${createdFarmerProfiles.length} farmer profiles`);
  return createdFarmerProfiles;
};

// Create institution profiles
const createInstitutionProfiles = async (users) => {
  const institutions = users.filter(user => user.role === 'institution');
  const institutionProfiles = [];

  for (const institution of institutions) {
    institutionProfiles.push({
      userId: institution._id,
      registrationNumber: 'REG' + Math.floor(Math.random() * 100000),
      institutionType: institution.name.includes('Bank') ? 'Bank' : 'MicroFinance',
      description: `${institution.name} provides agricultural loans to farmers.`,
      establishedYear: 1990 + Math.floor(Math.random() * 30),
      website: `https://www.${institution.name.toLowerCase().replace(/\s+/g, '')}.com`,
      branches: [
        {
          name: `${institution.name} - ${institution.address.city} Branch`,
          address: {
            street: institution.address.street,
            city: institution.address.city,
            state: institution.address.state,
            postalCode: institution.address.postalCode,
            country: institution.address.country
          },
          contactNumber: institution.phone,
          email: institution.email,
          manager: 'Branch Manager'
        }
      ],
      loanProducts: [
        {
          name: 'Crop Loan',
          description: 'Short-term loan for crop production',
          interestRate: 7 + Math.random() * 3,
          minAmount: 10000,
          maxAmount: 200000,
          termMonths: 12,
          requiresCollateral: false
        },
        {
          name: 'Equipment Loan',
          description: 'Loan for purchasing farm equipment',
          interestRate: 9 + Math.random() * 3,
          minAmount: 50000,
          maxAmount: 500000,
          termMonths: 36,
          requiresCollateral: true
        }
      ]
    });
  }

  console.log('Creating institution profiles...');
  const createdInstitutionProfiles = await InstitutionProfile.insertMany(institutionProfiles);
  console.log(`Created ${createdInstitutionProfiles.length} institution profiles`);
  return createdInstitutionProfiles;
};

// Create credit scores
const createCreditScores = async (farmerProfiles) => {
  const creditScores = [];

  for (const farmerProfile of farmerProfiles) {
    const score = Math.floor(Math.random() * 70) + 30; // Random score between 30-100
    let creditRating, riskCategory;

    if (score >= 80) {
      creditRating = 'A+';
      riskCategory = 'Very Low';
    } else if (score >= 70) {
      creditRating = 'A';
      riskCategory = 'Low';
    } else if (score >= 60) {
      creditRating = 'B+';
      riskCategory = 'Low';
    } else if (score >= 50) {
      creditRating = 'B';
      riskCategory = 'Moderate';
    } else if (score >= 40) {
      creditRating = 'C+';
      riskCategory = 'Moderate';
    } else if (score >= 30) {
      creditRating = 'C';
      riskCategory = 'High';
    } else {
      creditRating = 'D';
      riskCategory = 'Very High';
    }

    creditScores.push({
      farmerId: farmerProfile._id,
      score,
      creditRating,
      riskCategory,
      scoreComponents: {
        paymentHistory: Math.floor(Math.random() * 100),
        creditUtilization: Math.floor(Math.random() * 100),
        creditAge: Math.floor(Math.random() * 100),
        newCredit: Math.floor(Math.random() * 100),
        farmPerformance: Math.floor(Math.random() * 100),
      },
      breakdown: {
        farmProductivity: {
          score: Math.floor(Math.random() * 25),
          cropYields: { score: Math.floor(Math.random() * 10), weight: 0.4, notes: 'Based on historical data' },
          cropDiversity: { score: Math.floor(Math.random() * 10), weight: 0.3, notes: 'Multiple crop types observed' },
          farmSize: { score: Math.floor(Math.random() * 10), weight: 0.2, notes: 'Adequate farm size' },
          landQuality: { score: Math.floor(Math.random() * 10), weight: 0.1, notes: 'Good soil quality' }
        },
        environmental: {
          score: Math.floor(Math.random() * 20),
          weatherPatterns: { score: Math.floor(Math.random() * 10), weight: 0.3, notes: 'Favorable weather' },
          soilHealth: { score: Math.floor(Math.random() * 10), weight: 0.3, notes: 'Good soil fertility' },
          waterAvailability: { score: Math.floor(Math.random() * 10), weight: 0.2, notes: 'Adequate water resources' },
          climateRiskMitigation: { score: Math.floor(Math.random() * 10), weight: 0.2, notes: 'Some risk mitigation in place' }
        },
        financial: {
          score: Math.floor(Math.random() * 30),
          profitMargins: { score: Math.floor(Math.random() * 10), weight: 0.3, notes: 'Acceptable margins' },
          debtServiceRatio: { score: Math.floor(Math.random() * 10), weight: 0.3, notes: 'Manageable debt' },
          financialRecords: { score: Math.floor(Math.random() * 10), weight: 0.2, notes: 'Basic records maintained' },
          repaymentHistory: { score: Math.floor(Math.random() * 10), weight: 0.1, notes: 'Good repayment history' },
          savingsBuffer: { score: Math.floor(Math.random() * 10), weight: 0.1, notes: 'Some savings available' }
        },
        personal: {
          score: Math.floor(Math.random() * 15),
          farmingExperience: { score: Math.floor(Math.random() * 10), weight: 0.4, notes: 'Experienced farmer' },
          educationLevel: { score: Math.floor(Math.random() * 10), weight: 0.2, notes: 'Adequate education' },
          localReputation: { score: Math.floor(Math.random() * 10), weight: 0.2, notes: 'Good standing in community' },
          communityEngagement: { score: Math.floor(Math.random() * 10), weight: 0.2, notes: 'Active in local farmer groups' }
        },
        innovation: {
          score: Math.floor(Math.random() * 10),
          techAdoption: { score: Math.floor(Math.random() * 10), weight: 0.4, notes: 'Adopts some new technologies' },
          sustainablePractices: { score: Math.floor(Math.random() * 10), weight: 0.3, notes: 'Uses sustainable methods' },
          farmModernization: { score: Math.floor(Math.random() * 10), weight: 0.3, notes: 'Some modern equipment' }
        }
      },
      recommendations: [
        {
          category: 'Farm Productivity',
          title: 'Increase Crop Diversity',
          description: 'Plant additional crop varieties to reduce risk',
          priorityLevel: 'Medium',
          potentialImpact: 5
        },
        {
          category: 'Financial',
          title: 'Improve Record Keeping',
          description: 'Maintain better financial records to track expenses and income',
          priorityLevel: 'High',
          potentialImpact: 8
        }
      ],
      history: [
        {
          score: score - 5,
          date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
          changeReason: 'Initial assessment'
        }
      ],
      evaluationType: 'Initial',
      evaluationMethod: 'Automated',
      dataCompleteness: Math.floor(Math.random() * 30) + 70, // 70-100%
      confidenceScore: Math.floor(Math.random() * 20) + 80, // 80-100%
      lastUpdated: new Date(),
      expiresAt: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000), // 180 days from now
    });
  }

  console.log('Creating credit scores...');
  const createdCreditScores = await CreditScore.insertMany(creditScores);
  console.log(`Created ${createdCreditScores.length} credit scores`);
  return createdCreditScores;
};

// Create crops
const createCrops = async (farmerProfiles) => {
  const crops = [];
  const cropTypes = ['Wheat', 'Rice', 'Corn', 'Cotton', 'Soybeans'];

  for (const farmerProfile of farmerProfiles) {
    // Add 2 crops per farmer
    for (let i = 0; i < 2; i++) {
      const plantingDate = new Date(2023, Math.floor(Math.random() * 6), Math.floor(Math.random() * 28) + 1);
      const harvestDate = new Date(plantingDate);
      harvestDate.setMonth(harvestDate.getMonth() + 4);

      crops.push({
        farmerId: farmerProfile._id,
        cropType: cropTypes[Math.floor(Math.random() * cropTypes.length)],
        cropVariety: 'Standard Variety',
        season: ['Kharif', 'Rabi'][Math.floor(Math.random() * 2)],
        year: 2023,
        plantingDate,
        harvestDate,
        farmId: farmerProfile.farms[0]._id,
        fieldSize: {
          value: Math.floor(Math.random() * 5) + 1,
          unit: 'Acres'
        },
        status: ['Planned', 'Planted', 'Growing', 'Harvested'][Math.floor(Math.random() * 4)],
        expectedYield: {
          value: Math.floor(Math.random() * 20) + 10,
          unit: 'Quintal'
        },
        actualYield: {
          value: Math.floor(Math.random() * 20) + 5,
          unit: 'Quintal'
        },
        seedDetails: {
          source: 'Local Agricultural Supply Store',
          cost: Math.floor(Math.random() * 5000) + 1000,
          quantity: Math.floor(Math.random() * 50) + 10,
          quality: 'Standard'
        },
        fertilizers: [
          {
            name: 'NPK Fertilizer',
            quantity: Math.floor(Math.random() * 100) + 50,
            applicationDate: new Date(plantingDate.getTime() + 15 * 24 * 60 * 60 * 1000),
            cost: Math.floor(Math.random() * 3000) + 1000
          }
        ],
        pesticides: [
          {
            name: 'General Insecticide',
            quantity: Math.floor(Math.random() * 20) + 5,
            applicationDate: new Date(plantingDate.getTime() + 30 * 24 * 60 * 60 * 1000),
            purpose: 'Pest Control',
            cost: Math.floor(Math.random() * 2000) + 500
          }
        ],
        labourCost: Math.floor(Math.random() * 10000) + 5000,
        otherCosts: [
          {
            description: 'Equipment Rental',
            amount: Math.floor(Math.random() * 4000) + 1000,
            date: new Date(plantingDate.getTime() + 10 * 24 * 60 * 60 * 1000)
          },
          {
            description: 'Transportation',
            amount: Math.floor(Math.random() * 3000) + 1000,
            date: new Date(harvestDate.getTime() + 5 * 24 * 60 * 60 * 1000)
          }
        ],
        saleDetails: [
          {
            date: new Date(harvestDate.getTime() + 10 * 24 * 60 * 60 * 1000),
            quantity: {
              value: Math.floor(Math.random() * 20) + 5,
              unit: 'Quintal'
            },
            pricePerUnit: Math.floor(Math.random() * 2000) + 1000,
            totalAmount: Math.floor(Math.random() * 50000) + 20000,
            buyer: 'Local Market',
            paymentReceived: true,
            paymentDate: new Date(harvestDate.getTime() + 15 * 24 * 60 * 60 * 1000),
            paymentMethod: 'Cash',
            receiptNumber: 'SALE' + Math.floor(Math.random() * 10000)
          }
        ],
        totalRevenue: Math.floor(Math.random() * 50000) + 20000,
        notes: 'Standard crop cultivation with regular care and maintenance.',
        images: ['https://example.com/crop1.jpg', 'https://example.com/crop2.jpg'],
        weatherData: [
          {
            date: new Date(plantingDate.getTime() + 20 * 24 * 60 * 60 * 1000),
            temperature: {
              min: 20,
              max: 35,
              unit: 'Celsius'
            },
            rainfall: {
              amount: Math.floor(Math.random() * 100),
              unit: 'mm'
            },
            humidity: 65,
            notes: 'Normal weather conditions'
          }
        ],
        qualityAssessment: {
          grade: ['A', 'B', 'C'][Math.floor(Math.random() * 3)],
          moistureContent: Math.floor(Math.random() * 20) + 10,
          purity: Math.floor(Math.random() * 20) + 80,
          damage: ['None', 'Slight', 'Moderate'][Math.floor(Math.random() * 3)],
          notes: 'Good quality crop with minimal damage'
        }
      });
    }
  }

  console.log('Creating crops...');
  const createdCrops = await Crop.insertMany(crops);
  console.log(`Created ${createdCrops.length} crops`);
  return createdCrops;
};

// Create loans
const createLoans = async (farmerProfiles, institutionProfiles) => {
  const loans = [];
  const loanPurposes = ['Crop Production', 'Equipment Purchase', 'Land Development', 'Working Capital'];

  for (const farmerProfile of farmerProfiles) {
    // Create 1-2 loans per farmer
    const numLoans = Math.floor(Math.random() * 2) + 1;
    
    for (let i = 0; i < numLoans; i++) {
      const institution = institutionProfiles[Math.floor(Math.random() * institutionProfiles.length)];
      const amount = 50000 + Math.floor(Math.random() * 150000); // Random amount between 50k and 200k
      const interestRate = 7 + Math.random() * 5; // Random interest rate between 7% and 12%
      const termMonths = 12; // 12 month term
      const startDate = new Date(2023, Math.floor(Math.random() * 6), Math.floor(Math.random() * 28) + 1);
      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + termMonths);
      
      // Generate repayment schedule
      const repayments = [];
      const monthlyPayment = amount / termMonths;
      
      for (let j = 0; j < termMonths; j++) {
        const dueDate = new Date(startDate);
        dueDate.setMonth(dueDate.getMonth() + j + 1);
        
        repayments.push({
          amount: monthlyPayment,
          dueDate,
          status: j < 2 ? 'Paid' : 'Pending', // First two payments are paid
          paidDate: j < 2 ? new Date(dueDate.getTime() - 5 * 24 * 60 * 60 * 1000) : null, // 5 days before due date
          paidAmount: j < 2 ? monthlyPayment : 0,
          paymentMethod: j < 2 ? 'Bank Transfer' : null
        });
      }
      
      loans.push({
        loanNumber: 'LOAN' + Math.floor(Math.random() * 100000),
        borrowerId: farmerProfile._id,
        lenderId: institution._id,
        amount,
        interestRate,
        interestType: 'Reducing Balance',
        term: {
          value: termMonths,
          unit: 'Months'
        },
        startDate,
        endDate,
        purpose: loanPurposes[Math.floor(Math.random() * loanPurposes.length)],
        purposeDescription: 'Funds for agricultural development and growth',
        repaymentFrequency: 'Monthly',
        totalRepayments: termMonths,
        processingFee: {
          amount: Math.round(amount * 0.01), // 1% processing fee
          type: 'Percentage'
        },
        loanStatus: 'Active',
        collateral: {
          required: true,
          type: 'Land',
          description: 'Agricultural land document',
          value: amount * 1.5,
          documentUrl: 'https://example.com/collateral123.pdf'
        },
        repayments,
        disbursementDate: new Date(startDate.getTime() - 7 * 24 * 60 * 60 * 1000), // 7 days before start date
        documents: [
          {
            name: 'Loan Agreement',
            type: 'Other',
            fileUrl: 'https://example.com/loan-agreement.pdf',
            uploadedAt: new Date(startDate.getTime() - 10 * 24 * 60 * 60 * 1000),
            isVerified: true
          }
        ]
      });
    }
  }

  console.log('Creating loans...');
  const createdLoans = await Loan.insertMany(loans);
  console.log(`Created ${createdLoans.length} loans`);
  return createdLoans;
};

// Create transactions
const createTransactions = async (farmerProfiles, institutionProfiles, loans) => {
  const transactions = [];
  const transactionTypes = ['Loan Disbursement', 'Loan Repayment', 'Crop Sale'];

  // Loan disbursements
  for (const loan of loans) {
    transactions.push({
      transactionId: 'TXN' + Math.floor(Math.random() * 1000000),
      farmerId: loan.borrowerId,
      institutionId: loan.lenderId,
      loanId: loan._id,
      amount: loan.amount,
      type: 'Loan Disbursement',
      date: loan.disbursementDate,
      description: `Disbursement for ${loan.purpose}`,
      status: 'Completed',
      paymentMethod: 'Bank Transfer',
      receipt: {
        receiptNumber: 'RCPT' + Math.floor(Math.random() * 100000),
        generatedDate: loan.disbursementDate,
        fileUrl: 'https://example.com/receipt.pdf'
      }
    });
  }

  // Loan repayments (for the first two repayments of each loan)
  for (const loan of loans) {
    const paidRepayments = loan.repayments.filter(r => r.status === 'Paid');
    
    for (const repayment of paidRepayments) {
      transactions.push({
        transactionId: 'TXN' + Math.floor(Math.random() * 1000000),
        farmerId: loan.borrowerId,
        institutionId: loan.lenderId,
        loanId: loan._id,
        amount: repayment.amount,
        type: 'Loan Repayment',
        date: repayment.paidDate,
        description: `Repayment for loan ${loan.loanNumber}`,
        status: 'Completed',
        paymentMethod: repayment.paymentMethod,
        receipt: {
          receiptNumber: 'RCPT' + Math.floor(Math.random() * 100000),
          generatedDate: repayment.paidDate,
          fileUrl: 'https://example.com/receipt.pdf'
        }
      });
    }
  }

  // Crop sales
  for (const farmerProfile of farmerProfiles) {
    transactions.push({
      transactionId: 'TXN' + Math.floor(Math.random() * 1000000),
      farmerId: farmerProfile._id,
      amount: Math.floor(Math.random() * 30000) + 10000,
      type: 'Crop Sale',
      date: new Date(2023, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
      description: 'Sale of harvested crops at local market',
      status: 'Completed',
      paymentMethod: 'Cash',
      receipt: {
        receiptNumber: 'RCPT' + Math.floor(Math.random() * 100000),
        generatedDate: new Date(),
        fileUrl: 'https://example.com/receipt.pdf'
      }
    });
  }

  console.log('Creating transactions...');
  const createdTransactions = await Transaction.insertMany(transactions);
  console.log(`Created ${createdTransactions.length} transactions`);
  return createdTransactions;
};

// Create notifications
const createNotifications = async (users, loans) => {
  const notifications = [];
  const notificationTypes = ['Loan Approved', 'Loan Disbursed', 'Payment Due', 'Payment Received', 'Credit Score Update'];
  
  // General notifications for all users
  for (const user of users) {
    notifications.push({
      recipient: user._id,
      type: 'System',
      title: 'Welcome to AgriFinance Platform',
      message: 'Thank you for joining our platform. We hope you find our services useful.',
      isRead: Math.random() > 0.5,
      priority: 'Low',
      date: new Date(2023, 0, 1)
    });
  }
  
  // Loan-related notifications
  for (const loan of loans) {
    // Notification for borrower
    notifications.push({
      recipient: loan.borrowerId,
      relatedEntityId: loan._id,
      relatedEntityType: 'Loan',
      type: 'Loan Approved',
      title: 'Your Loan Has Been Approved',
      message: `Your loan application (${loan.loanNumber}) for ${loan.amount} has been approved.`,
      isRead: Math.random() > 0.5,
      priority: 'High',
      date: new Date(loan.startDate.getTime() - 5 * 24 * 60 * 60 * 1000) // 5 days before start date
    });
    
    // Payment due notification
    const dueRepayment = loan.repayments.find(r => r.status === 'Pending');
    if (dueRepayment) {
      notifications.push({
        recipient: loan.borrowerId,
        relatedEntityId: loan._id,
        relatedEntityType: 'Loan',
        type: 'Payment Due',
        title: 'Upcoming Loan Payment',
        message: `Your loan payment of ${dueRepayment.amount} is due on ${dueRepayment.dueDate.toLocaleDateString()}.`,
        isRead: false,
        priority: 'Medium',
        date: new Date(dueRepayment.dueDate.getTime() - 7 * 24 * 60 * 60 * 1000), // 7 days before due date
        actions: [
          {
            label: 'Pay Now',
            url: '/payments/new'
          },
          {
            label: 'View Details',
            url: `/loans/${loan._id}`
          }
        ]
      });
    }
  }

  console.log('Creating notifications...');
  const createdNotifications = await Notification.insertMany(notifications);
  console.log(`Created ${createdNotifications.length} notifications`);
  return createdNotifications;
};

// Main function to seed the database
const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await connectDB();
    
    // Clear existing data
    await clearDatabase();
    
    // Create users
    const users = await createUsers();
    
    // Create farmer and institution profiles
    const farmerProfiles = await createFarmerProfiles(users);
    const institutionProfiles = await createInstitutionProfiles(users);
    
    // Create credit scores for farmers
    const creditScores = await createCreditScores(farmerProfiles);
    
    // Create crops
    const crops = await createCrops(farmerProfiles);
    
    // Create loans
    const loans = await createLoans(farmerProfiles, institutionProfiles);
    
    // Create transactions
    const transactions = await createTransactions(farmerProfiles, institutionProfiles, loans);
    
    // Create notifications
    const notifications = await createNotifications(users, loans);
    
    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
