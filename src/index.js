require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const { z } = require('zod');
const connectDB = require('./db');

// Debug logging for environment variables
console.log('Environment variables loaded:', {
    JWT_SECRET: process.env.JWT_SECRET ? 'Present' : 'Missing',
    NODE_ENV: process.env.NODE_ENV,
    PORT: process.env.PORT
});

const app = express();

// Middleware
app.use(cors({
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000', 
             'http://localhost:5500', 'http://127.0.0.1:5500', 
             'http://localhost:8080', 'http://127.0.0.1:8080',
             'http://localhost:8081', 'http://127.0.0.1:8081'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));
app.use(express.json());

// JWT Configuration
const JWT_SECRET = process.env.JWT_SECRET || 'farmer_credit_system_secret_key_2024_secure_token';
const JWT_EXPIRY = process.env.JWT_EXPIRY || '7d';

// Schemas
const farmerSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minlength: 3
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    role: {
        type: String,
        enum: ['farmer', 'bank', 'nbfc'],
        default: 'farmer'
    },
    farmLocation: {
        name: String,
        coordinates: {
            type: [Number], // [longitude, latitude]
            required: true
        }
    },
    cropType: {
        type: String,
        required: true,
        enum: ['Wheat', 'Rice', 'Corn', 'Cotton', 'Soybeans', 'Other']
    },
    cropHistory: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Crop'
    }],
    creditScores: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CreditScore'
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

const cropSchema = new mongoose.Schema({
    farmerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Farmer',
        required: true
    },
    cropType: {
        type: String,
        required: true,
        enum: ['Wheat', 'Rice', 'Corn', 'Cotton', 'Soybeans', 'Other']
    },
    plantingDate: {
        type: Date,
        required: true
    },
    expectedYield: {
        type: Number,
        required: true,
        min: 0
    },
    actualYield: {
        type: Number,
        min: 0
    },
    status: {
        type: String,
        required: true,
        enum: ['Planted', 'Growing', 'Harvested', 'Failed'],
        default: 'Planted'
    },
    soilHealth: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Soil'
    },
    weatherData: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Weather'
    }]
}, {
    timestamps: true
});

const soilSchema = new mongoose.Schema({
    location: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point'
        },
        coordinates: {
            type: [Number], // [longitude, latitude]
            required: true
        }
    },
    pH: {
        type: Number,
        required: true,
        min: 0,
        max: 14
    },
    organicMatter: {
        type: Number,
        required: true,
        min: 0
    },
    nitrogen: {
        type: Number,
        required: true,
        min: 0
    },
    phosphorus: {
        type: Number,
        required: true,
        min: 0
    },
    potassium: {
        type: Number,
        required: true,
        min: 0
    },
    moisture: {
        type: Number,
        required: true,
        min: 0,
        max: 100
    },
    texture: {
        type: String,
        required: true,
        enum: ['Sandy', 'Loamy', 'Clay', 'Silt', 'Mixed']
    },
    lastTestedDate: {
        type: Date,
        required: true,
        default: Date.now
    }
}, {
    timestamps: true
});

const weatherSchema = new mongoose.Schema({
    location: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point'
        },
        coordinates: {
            type: [Number], // [longitude, latitude]
            required: true
        }
    },
    date: {
        type: Date,
        required: true
    },
    temperature: {
        type: Number,
        required: true
    },
    humidity: {
        type: Number,
        required: true,
        min: 0,
        max: 100
    },
    precipitation: {
        type: Number,
        required: true,
        min: 0
    },
    windSpeed: {
        type: Number,
        required: true,
        min: 0
    },
    forecast: {
        type: Boolean,
        default: false
    },
    weatherCondition: {
        type: String,
        required: true,
        enum: ['Clear', 'Cloudy', 'Rain', 'Storm', 'Snow']
    }
}, {
    timestamps: true
});

const creditScoreSchema = new mongoose.Schema({
    farmerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Farmer',
        required: true
    },
    creditScore: {
        type: Number,
        required: true,
        min: 0,
        max: 100
    },
    riskCategory: {
        type: String,
        required: true,
        enum: ['Low Risk', 'Medium Risk', 'High Risk', 'Very High Risk']
    },
    breakdown: {
        weatherScore: {
            type: Number,
            required: true,
            min: 0,
            max: 100
        },
        soilScore: {
            type: Number,
            required: true,
            min: 0,
            max: 100
        },
        landScore: {
            type: Number,
            required: true,
            min: 0,
            max: 100
        },
        environmentalScore: {
            type: Number,
            required: true,
            min: 0,
            max: 100
        },
        marketScore: {
            type: Number,
            required: true,
            min: 0,
            max: 100
        },
        historicalScore: {
            type: Number,
            required: true,
            min: 0,
            max: 100
        }
    },
    recommendations: [{
        type: String
    }],
    validUntil: {
        type: Date,
        required: true
    }
}, {
    timestamps: true
});

const landSchema = new mongoose.Schema({
    farmerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Farmer',
        required: true
    },
    location: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point'
        },
        coordinates: {
            type: [Number], // [longitude, latitude]
            required: true
        }
    },
    totalArea: {
        type: Number,
        required: true,
        min: 0
    },
    soilType: {
        type: String,
        required: true,
        enum: ['Alluvial', 'Black', 'Red', 'Laterite', 'Desert']
    },
    irrigation: {
        type: {
            type: String,
            required: true,
            enum: ['Drip', 'Sprinkler', 'Flood', 'Rainfed', 'Other']
        },
        coverage: {
            type: Number,
            required: true,
            min: 0,
            max: 100
        },
        waterSource: {
            type: String,
            required: true,
            enum: ['Well', 'Canal', 'River', 'Rainwater', 'Groundwater']
        }
    },
    slope: {
        type: Number,
        required: true,
        min: 0,
        max: 90
    },
    drainage: {
        type: String,
        required: true,
        enum: ['Good', 'Moderate', 'Poor']
    },
    landUse: {
        type: String,
        required: true,
        enum: ['Agricultural', 'Fallow', 'Pasture']
    }
}, {
    timestamps: true
});

const yieldSchema = new mongoose.Schema({
    farmerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Farmer',
        required: true
    },
    landId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Land',
        required: true
    },
    cropType: {
        type: String,
        required: true,
        enum: ['Wheat', 'Rice', 'Corn', 'Cotton', 'Soybeans', 'Other']
    },
    season: {
        type: String,
        required: true,
        enum: ['Kharif', 'Rabi', 'Zaid']
    },
    year: {
        type: Number,
        required: true
    },
    yieldPerAcre: {
        type: Number,
        required: true,
        min: 0
    },
    totalProduction: {
        type: Number,
        required: true,
        min: 0
    },
    qualityGrade: {
        type: String,
        required: true,
        enum: ['A', 'B', 'C']
    },
    factors: {
        rainfall: {
            type: Number,
            required: true,
            min: 0
        },
        pestIncidence: {
            type: String,
            required: true,
            enum: ['Low', 'Medium', 'High']
        },
        diseaseIncidence: {
            type: String,
            required: true,
            enum: ['Low', 'Medium', 'High']
        },
        fertilizersUsed: [{
            type: String
        }]
    }
}, {
    timestamps: true
});

// Schema Methods and Middleware
farmerSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

farmerSchema.methods.comparePassword = async function(candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

// Indexes
soilSchema.index({ location: '2dsphere' });
weatherSchema.index({ location: '2dsphere' });
weatherSchema.index({ date: 1, forecast: 1 });
creditScoreSchema.index({ farmerId: 1, validUntil: 1 });
landSchema.index({ location: '2dsphere' });
landSchema.index({ farmerId: 1 });
yieldSchema.index({ farmerId: 1, year: -1 });
yieldSchema.index({ landId: 1 });

// Models
const Farmer = mongoose.model('Farmer', farmerSchema);
const Crop = mongoose.model('Crop', cropSchema);
const Soil = mongoose.model('Soil', soilSchema);
const Weather = mongoose.model('Weather', weatherSchema);
const CreditScore = mongoose.model('CreditScore', creditScoreSchema);
const Land = mongoose.model('Land', landSchema);
const Yield = mongoose.model('Yield', yieldSchema);

// Validation schemas
const registerSchema = z.object({
    username: z.string().min(3).max(50),
    password: z.string().min(6).max(50),
    farmLocation: z.object({
        name: z.string(),
        coordinates: z.array(z.number()).length(2)
    }),
    cropType: z.enum(['Wheat', 'Rice', 'Corn', 'Cotton', 'Soybeans', 'Other'])
});

const loginSchema = z.object({
    username: z.string()
        .min(1, 'Username is required')
        .max(50, 'Username cannot exceed 50 characters'),
    password: z.string()
        .min(1, 'Password is required')
});

const cropValidationSchema = z.object({
    cropType: z.enum(['Wheat', 'Rice', 'Corn', 'Cotton', 'Soybeans', 'Other']),
    plantingDate: z.string().datetime(),
    expectedYield: z.number().positive(),
    status: z.enum(['Planted', 'Growing', 'Harvested', 'Failed']),
    actualYield: z.number().positive().optional()
});

const creditScoreCalculationSchema = z.object({
    includeHistoricalData: z.boolean().optional(),
    considerMarketTrends: z.boolean().optional(),
    dataRangeMonths: z.number().min(1).max(12).optional()
});

// Middleware
const validateRequest = (schema) => async (req, res, next) => {
    try {
        req.validatedData = await schema.parseAsync(req.body);
        next();
    } catch (error) {
        res.status(400).json({ message: 'Validation failed', errors: error.errors });
    }
};

const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        console.log('Auth Headers:', req.headers);

        if (!authHeader) {
            console.log('No auth header'); // Debug log
            return res.status(401).json({ message: 'No token provided' });
        }

        if (!authHeader.startsWith('Bearer ')) {
            console.log('Invalid token format'); // Debug log
            return res.status(401).json({ message: 'Invalid token format' });
        }

        const token = authHeader.split(' ')[1];
        console.log('Token received:', token); // Debug log

        if (!token) {
            console.log('Empty token'); // Debug log
            return res.status(401).json({ message: 'No token provided' });
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        console.log('Decoded token:', decoded); // Debug log
        
        const farmer = await Farmer.findById(decoded.id);
        if (!farmer) {
            console.log('Farmer not found for token'); // Debug log
            return res.status(401).json({ message: 'Invalid token' });
        }

        req.farmer = farmer;
        next();
    } catch (error) {
        console.error('Authentication error:', error);
        res.status(401).json({ message: 'Invalid token' });
    }
};

// Add role-based middleware
const checkRole = (roles) => {
    return (req, res, next) => {
        if (!req.farmer) {
            return res.status(401).json({ message: 'Authentication required' });
        }
        if (!roles.includes(req.farmer.role)) {
            return res.status(403).json({ message: 'Access denied' });
        }
        next();
    };
};

// Farmer Routes
app.post('/api/farmers/register', async (req, res) => {
    try {
        const { username, password, farmLocation, cropType, role } = req.body;

        // Validate required fields
        if (!username || !password) {
            return res.status(400).json({
                message: 'Validation failed',
                errors: [
                    { field: 'username', message: 'Username is required' },
                    { field: 'password', message: 'Password is required' }
                ]
            });
        }

        // Additional validation for farmers
        if (role === 'farmer' && (!farmLocation || !cropType)) {
            return res.status(400).json({
                message: 'Validation failed',
                errors: [
                    { field: 'farmLocation', message: 'Farm location is required for farmers' },
                    { field: 'cropType', message: 'Crop type is required for farmers' }
                ]
            });
        }

        // Check if username already exists
        const existingFarmer = await Farmer.findOne({ username }).lean().exec();
        if (existingFarmer) {
            return res.status(400).json({ message: 'Username already exists' });
        }

        // Create new user
        const farmer = new Farmer({
            username,
            password,
            role: role || 'farmer',
            farmLocation,
            cropType
        });

        const savedFarmer = await farmer.save();

        // Generate JWT token
        const token = jwt.sign(
            { id: savedFarmer._id, role: savedFarmer.role },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRY }
        );

        res.status(201).json({
            message: 'Registration successful',
            token,
            user: {
                id: savedFarmer._id,
                username: savedFarmer.username,
                role: savedFarmer.role,
                farmLocation: savedFarmer.farmLocation,
                cropType: savedFarmer.cropType
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Error registering farmer' });
    }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password, role } = req.body;
    
    console.log('Login attempt received:', { email, role });
    
    if (!email || !password) {
      console.log('Login failed: Missing email or password');
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find user by email (username field contains email)
    console.log('Searching for user with email:', email);
    const farmer = await mongoose.model('Farmer').findOne({ username: email });
    
    if (!farmer) {
      console.log('Login failed: User not found');
      
      // For easier testing, provide a debug login option
      if (email === 'test@example.com' && password === 'password') {
        console.log('Using debug/demo login path');
        
        // Create a mock token for demonstration
        const mockToken = 'demo-token-' + Date.now();
        
        return res.status(200).json({
          message: 'Debug login successful',
          token: mockToken,
          user: {
            _id: 'demo-user-123',
            name: 'Demo User',
            email: email,
            role: role || 'farmer'
          }
        });
      }
      
      return res.status(404).json({ message: 'User not found' });
    }
    
    console.log('User found, checking password');
    
    // Verify password - using direct bcrypt comparison for flexibility
    let isMatch = false;
    try {
      isMatch = await bcrypt.compare(password, farmer.password);
    } catch (err) {
      console.error('Password comparison error:', err);
    }
    
    if (!isMatch) {
      console.log('Login failed: Invalid password');
            return res.status(401).json({ message: 'Invalid credentials' });
        }

    // Skip role check for easier testing
    if (farmer.role !== role && !process.env.SKIP_ROLE_CHECK) {
      console.log(`Login failed: User role (${farmer.role}) doesn't match requested role (${role})`);
      return res.status(403).json({ message: `User is not registered as a ${role}` });
    }
    
    console.log('Login successful, generating token');
    
    // Generate JWT token
        const token = jwt.sign(
      { 
        id: farmer._id,
        username: farmer.username,
        role: farmer.role
      },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRY }
        );

    console.log('Sending successful login response');
    
    res.status(200).json({
            message: 'Login successful',
            token,
            user: {
        _id: farmer._id,
        name: farmer.username,
        email: farmer.username,
                role: farmer.role
            }
        });
    
    } catch (error) {
        console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login', error: error.message });
    }
});

app.get('/api/farmers/me', authenticate, async (req, res) => {
    try {
        // Get farmer details with populated references
        const farmer = await Farmer.findById(req.farmer._id)
            .select('-password')
            .populate('cropHistory', 'cropType plantingDate status')
            .populate('creditScores', 'creditScore riskCategory validUntil');

        if (!farmer) {
            return res.status(404).json({ message: 'Farmer not found' });
        }

        // Get latest credit score
        const latestCreditScore = await CreditScore.findOne({
            farmerId: farmer._id,
            validUntil: { $gt: new Date() }
        }).sort({ createdAt: -1 });

        // Get recent crops
        const recentCrops = await Crop.find({ farmerId: farmer._id })
            .sort({ plantingDate: -1 })
            .limit(5);

        // Return comprehensive farmer details
        res.json({
            farmer: {
                id: farmer._id,
                username: farmer.username,
                farmLocation: farmer.farmLocation,
                cropType: farmer.cropType,
                cropHistory: farmer.cropHistory,
                creditScores: farmer.creditScores
            },
            currentCreditScore: latestCreditScore,
            recentCrops
        });
    } catch (error) {
        console.error('Error fetching farmer details:', error);
        res.status(500).json({ message: 'Failed to fetch farmer details' });
    }
});

// Crop Routes
app.post('/api/crops', authenticate, async (req, res) => {
    try {
        const validatedData = cropValidationSchema.parse(req.body);
        const crop = await Crop.create({
            ...validatedData,
            farmerId: req.farmer._id
        });
        await Farmer.findByIdAndUpdate(req.farmer._id, {
            $push: { cropHistory: crop._id }
        });
        res.status(201).json(crop);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

app.get('/api/crops', authenticate, async (req, res) => {
    try {
        const crops = await Crop.find({ farmerId: req.farmer._id })
            .populate('soilHealth')
            .populate('weatherData');
        res.json(crops);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

app.patch('/api/crops/:id', authenticate, async (req, res) => {
    try {
        const crop = await Crop.findOneAndUpdate(
            { _id: req.params.id, farmerId: req.farmer._id },
            req.body,
            { new: true }
        );
        if (!crop) {
            return res.status(404).json({ message: 'Crop not found' });
        }
        res.json(crop);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Credit Score Routes
app.post('/api/credit-score/calculate', authenticate, async (req, res) => {
    try {
        let farmerId;
        if (req.farmer.role === 'farmer') {
            farmerId = req.farmer._id;
        } else if (['bank', 'nbfc'].includes(req.farmer.role)) {
            farmerId = req.body.farmerId;
            if (!farmerId) {
                return res.status(400).json({ message: 'Farmer ID is required for bank/NBFC users' });
            }
        } else {
            return res.status(403).json({ message: 'Access denied' });
        }

        const farmer = await Farmer.findById(farmerId);
        if (!farmer) {
            return res.status(404).json({ message: 'Farmer not found' });
        }

        const creditScore = await calculateCreditScore(farmer);
        res.json(creditScore);
    } catch (error) {
        console.error('Error calculating credit score:', error);
        res.status(500).json({ message: 'Failed to calculate credit score' });
    }
});

app.get('/api/credit-score', authenticate, async (req, res) => {
    try {
        let farmerId;
        if (req.farmer.role === 'farmer') {
            farmerId = req.farmer._id;
        } else if (['bank', 'nbfc'].includes(req.farmer.role)) {
            farmerId = req.query.farmerId;
            if (!farmerId) {
                return res.status(400).json({ message: 'Farmer ID is required for bank/NBFC users' });
            }
        } else {
            return res.status(403).json({ message: 'Access denied' });
        }

        const creditScore = await CreditScore.findOne({ farmerId })
            .sort({ createdAt: -1 })
            .lean()
            .exec();

        if (!creditScore) {
            return res.status(404).json({ message: 'No valid credit score found' });
        }

        res.json(creditScore);
    } catch (error) {
        console.error('Error fetching credit score:', error);
        res.status(500).json({ message: 'Failed to fetch credit score' });
    }
});

// Farmer Routes
app.get('/api/farmers/:farmerId/land', authenticate, async (req, res) => {
    try {
        const land = await Land.find({ farmerId: req.farmer._id });
        res.json(land);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch land data' });
    }
});

app.get('/api/farmers/:farmerId/soil', authenticate, async (req, res) => {
    try {
        const soil = await Soil.find({
            location: {
                $near: {
                    $geometry: {
                        type: 'Point',
                        coordinates: req.farmer.farmLocation.coordinates
                    },
                    $maxDistance: 1000 // Within 1km
                }
            }
        });
        res.json(soil);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch soil data' });
    }
});

app.get('/api/farmers/:farmerId/weather', authenticate, async (req, res) => {
    try {
        const weather = await Weather.find({
            location: {
                $near: {
                    $geometry: {
                        type: 'Point',
                        coordinates: req.farmer.farmLocation.coordinates
                    },
                    $maxDistance: 5000 // Within 5km
                }
            }
        }).sort({ date: -1 }).limit(7); // Last 7 days
        res.json(weather);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch weather data' });
    }
});

app.get('/api/farmers/:farmerId/yields', authenticate, async (req, res) => {
    try {
        const yields = await Yield.find({ farmerId: req.farmer._id })
            .sort({ year: -1, season: -1 });
        res.json(yields);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch yield data' });
    }
});

app.post('/api/populate-dummy-data', authenticate, async (req, res) => {
    try {
        // Create dummy soil data
        const soil = new Soil({
            location: {
                type: 'Point',
                coordinates: req.farmer.farmLocation.coordinates
            },
            pH: 6.5,
            organicMatter: 3.5,
            nitrogen: 0.3,
            phosphorus: 15,
            potassium: 200,
            moisture: 60,
            texture: 'Loamy',
            lastTestedDate: new Date()
        });
        await soil.save();

        // Create dummy weather data
        const weather = new Weather({
            location: {
                type: 'Point',
                coordinates: req.farmer.farmLocation.coordinates
            },
            date: new Date(),
            temperature: 25,
            humidity: 65,
            precipitation: 2.5,
            windSpeed: 10,
            forecast: false,
            weatherCondition: 'Clear'
        });
        await weather.save();

        // Create dummy crop data
        const crop = new Crop({
            farmerId: req.farmer._id,
            cropType: req.farmer.cropType,
            plantingDate: new Date(),
            expectedYield: 4000,
            actualYield: 3800,
            status: 'Growing',
            soilHealth: soil._id,
            weatherData: [weather._id]
        });
        await crop.save();

        // Update farmer with crop history
        await Farmer.findByIdAndUpdate(req.farmer._id, {
            $push: { cropHistory: crop._id }
        });

        res.json({ 
            message: 'Dummy data populated successfully',
            data: {
                soil,
                weather,
                crop
            }
        });
    } catch (error) {
        console.error('Error populating dummy data:', error);
        res.status(500).json({ message: 'Failed to populate dummy data', error: error.message });
    }
});

// Add a simple health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    message: 'Server is running', 
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Add a root endpoint for simple connection checking
app.get('/api', (req, res) => {
  res.status(200).json({ 
    message: 'Farm Finance API', 
    endpoints: ['/api/auth/login', '/api/auth/register', '/api/farmers', '/api/credit-score'],
    docs: 'Documentation available at /api/docs'
  });
});

// Registration route
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, password, role, farmLocation, cropType } = req.body;
    
    // Validate input
    if (!username || !password || !role) {
      return res.status(400).json({ message: 'Username, password and role are required' });
    }
    
    // Check if user already exists
    const existingUser = await mongoose.model('Farmer').findOne({ username });
    
    if (existingUser) {
      return res.status(409).json({ message: 'User already exists' });
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Create new user
    const newFarmer = new mongoose.model('Farmer')({
      username,
      password: hashedPassword,
      role,
      farmLocation: farmLocation || { name: 'Default Location', coordinates: [0, 0] },
      cropType: cropType || 'Other'
    });
    
    await newFarmer.save();
    
    // Generate JWT token
    const token = jwt.sign(
      { 
        id: newFarmer._id,
        username: newFarmer.username,
        role: newFarmer.role
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRY }
    );
    
    res.status(201).json({
      message: 'Registration successful',
      token,
      userId: newFarmer._id,
      username: newFarmer.username,
      role: newFarmer.role
    });
    
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration', error: error.message });
    }
});

const startServer = async (port = 5001) => {
    try {
        // Ensure port is a number type and is in valid range
        port = Number(port);
        if (isNaN(port) || port < 1000 || port > 65535) {
            port = 5001; // Default to 5001 if port is invalid
        }

        // Connect to MongoDB first
        await connectDB();

        // Try to start the server
        app.listen(port, () => {
            console.log(`Server running on port ${port}`);
        }).on('error', async (err) => {
            if (err.code === 'EADDRINUSE') {
                console.log(`Port ${port} is busy, trying next port...`);
                
                // Try next port - ensure we increment by a number and not concatenate strings
                const nextPort = port + 1;
                
                // Safety check to avoid infinite loops
                if (nextPort > 65535) {
                    throw new Error('No available ports found in valid range');
                }
                
                // Try connecting to MongoDB again to ensure fresh connection
                await mongoose.connection.close();
                
                // Try with the next port
                await startServer(nextPort);
            } else {
                console.error('Server error:', err);
                throw err;
            }
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

// Start the server when this file is run directly
startServer(process.env.PORT || 5001);

function determineRiskCategory(creditScore) {
    if (creditScore >= 80) return 'Low Risk';
    if (creditScore >= 60) return 'Medium Risk';
    return 'High Risk';
}

function generateRecommendations(breakdown) {
    const recommendations = [];
    
    // Weather-based recommendations
    if (breakdown.weatherScore < 80) {
        recommendations.push(
            "Install rainwater harvesting systems to better manage water resources",
            "Consider implementing climate-smart agriculture practices",
            "Invest in weather monitoring equipment for better forecasting"
        );
    }

    // Soil-based recommendations
    if (breakdown.soilScore < 80) {
        recommendations.push(
            "Implement regular soil testing and pH monitoring",
            "Add organic matter to improve soil structure",
            "Consider crop rotation to maintain soil health"
        );
    }

    // Land-based recommendations
    if (breakdown.landScore < 80) {
        recommendations.push(
            "Improve irrigation efficiency through drip systems",
            "Implement terracing for better water management",
            "Consider land leveling for optimal water distribution"
        );
    }

    // Environmental recommendations
    if (breakdown.environmentalScore < 80) {
        recommendations.push(
            "Adopt integrated pest management practices",
            "Implement sustainable farming practices",
            "Consider organic certification"
        );
    }

    // Market-based recommendations
    if (breakdown.marketScore < 80) {
        recommendations.push(
            "Diversify crop portfolio to reduce market risk",
            "Join local farmer cooperatives for better market access",
            "Explore value-added processing opportunities"
        );
    }

    // Historical performance recommendations
    if (breakdown.historicalScore < 80) {
        recommendations.push(
            "Maintain detailed farm records",
            "Analyze past performance data for trends",
            "Seek agricultural extension services for guidance"
        );
    }

    // Always include some general recommendations
    recommendations.push(
        "Stay updated with latest agricultural technologies",
        "Consider crop insurance for risk management",
        "Network with successful farmers in your area"
    );

    // Return top 5 most relevant recommendations
    return recommendations
        .sort(() => Math.random() - 0.5) // Randomize for variety
        .slice(0, 5);
}

// Add this function after getCropYieldData
async function getSoilHealthData(latitude, longitude) {
    try {
        // In a real implementation, this would call a soil health API
        // For now, we'll return mock data
        return {
            soilType: 'Loamy',
            pH: 6.5,
            organicMatter: 2.5,
            nutrientLevels: {
                nitrogen: 'Medium',
                phosphorus: 'High',
                potassium: 'Medium'
            },
            drainage: 'Good',
            erosionRisk: 'Low'
        };
    } catch (error) {
        console.error('Error fetching soil health data:', error);
        return null;
    }
}

// Helper functions for credit score calculation
async function getWeatherData(longitude, latitude) {
    try {
        const weather = await Weather.findOne({
            location: {
                $near: {
                    $geometry: {
                        type: 'Point',
                        coordinates: [longitude, latitude]
                    },
                    $maxDistance: 5000 // Within 5km
                }
            }
        }).sort({ date: -1 });
        return weather;
    } catch (error) {
        console.error('Error fetching weather data:', error);
        return null;
    }
}

async function getGISData(longitude, latitude) {
    try {
        const land = await Land.findOne({
            location: {
                $near: {
                    $geometry: {
                        type: 'Point',
                        coordinates: [longitude, latitude]
                    },
                    $maxDistance: 1000 // Within 1km
                }
            }
        });
        return land;
    } catch (error) {
        console.error('Error fetching GIS data:', error);
        return null;
    }
}

async function getCropYieldData(longitude, latitude, cropType) {
    try {
        const yields = await Yield.find({
            'location.coordinates': {
                $near: {
                    $geometry: {
                        type: 'Point',
                        coordinates: [longitude, latitude]
                    },
                    $maxDistance: 5000 // Within 5km
                }
            },
            cropType
        }).sort({ year: -1, season: -1 }).limit(5);
        return yields;
    } catch (error) {
        console.error('Error fetching crop yield data:', error);
        return null;
    }
}

function calculateWeatherScore(weatherData) {
    let score = 0;
    
    // Temperature impact (30%)
    const temp = weatherData.temperature;
    if (temp >= 20 && temp <= 30) {
        score += 30;
    } else if (temp >= 15 && temp <= 35) {
        score += 20;
    } else {
        score += 10;
    }

    // Humidity impact (20%)
    const humidity = weatherData.humidity;
    if (humidity >= 40 && humidity <= 70) {
        score += 20;
    } else if (humidity >= 30 && humidity <= 80) {
        score += 15;
    } else {
        score += 10;
    }

    // Precipitation impact (30%)
    const precipitation = weatherData.precipitation;
    if (precipitation >= 2 && precipitation <= 5) {
        score += 30;
    } else if (precipitation >= 1 && precipitation <= 7) {
        score += 20;
    } else {
        score += 10;
    }

    // Wind speed impact (20%)
    const windSpeed = weatherData.windSpeed;
    if (windSpeed <= 15) {
        score += 20;
    } else if (windSpeed <= 25) {
        score += 10;
    }

    return score;
}

function calculateLocationScore(gisData) {
    let score = 0;
    
    // Soil type impact (40%)
    const soilType = gisData.soilType;
    if (['Alluvial', 'Black'].includes(soilType)) {
        score += 40;
    } else if (['Red', 'Laterite'].includes(soilType)) {
        score += 30;
    } else {
        score += 20;
    }

    // Irrigation impact (30%)
    const irrigation = gisData.irrigation;
    if (irrigation.coverage >= 80) {
        score += 30;
    } else if (irrigation.coverage >= 50) {
        score += 20;
    } else {
        score += 10;
    }

    // Drainage impact (30%)
    const drainage = gisData.drainage;
    if (drainage === 'Good') {
        score += 30;
    } else if (drainage === 'Moderate') {
        score += 20;
    } else {
        score += 10;
    }

    return score;
}

function calculateCropScore(cropYieldData) {
    if (!cropYieldData || cropYieldData.length === 0) return 50; // Default score

    let score = 0;
    const recentYield = cropYieldData[0];
    
    // Yield per acre impact (40%)
    const yieldPerAcre = recentYield.yieldPerAcre;
    const avgYieldPerAcre = cropYieldData.reduce((sum, y) => sum + y.yieldPerAcre, 0) / cropYieldData.length;
    
    if (yieldPerAcre >= avgYieldPerAcre * 1.1) {
        score += 40;
    } else if (yieldPerAcre >= avgYieldPerAcre) {
        score += 30;
    } else {
        score += 20;
    }

    // Quality grade impact (30%)
    if (recentYield.qualityGrade === 'A') {
        score += 30;
    } else if (recentYield.qualityGrade === 'B') {
        score += 20;
    } else {
        score += 10;
    }

    // Pest and disease management (30%)
    const pestIncidence = recentYield.factors.pestIncidence;
    const diseaseIncidence = recentYield.factors.diseaseIncidence;
    
    if (pestIncidence === 'Low' && diseaseIncidence === 'Low') {
        score += 30;
    } else if (pestIncidence === 'Medium' || diseaseIncidence === 'Medium') {
        score += 20;
    } else {
        score += 10;
    }

    return score;
}

// Update the calculateCreditScore function
async function calculateCreditScore(farmer) {
    try {
        const location = farmer.farmLocation.coordinates;
        const weatherData = await getWeatherData(location[0], location[1]);
        const gisData = await getGISData(location[0], location[1]);
        const cropYieldData = await getCropYieldData(location[0], location[1], farmer.cropType);
        const soilHealthData = await getSoilHealthData(location[0], location[1]);

        // Calculate component scores
        const weatherScore = weatherData ? calculateWeatherScore(weatherData) : 50;
        const locationScore = gisData ? calculateLocationScore(gisData) : 50;
        const cropScore = cropYieldData ? calculateCropScore(cropYieldData) : 50;
        const soilScore = soilHealthData ? calculateSoilScore(soilHealthData) : 50;

        // Calculate final score (0-100 scale)
        const finalScore = Math.round(
            (weatherScore * 0.25) +
            (locationScore * 0.25) +
            (cropScore * 0.25) +
            (soilScore * 0.25)
        );

        // Determine risk category
        const riskCategory = determineRiskCategory(finalScore);

        // Generate recommendations
        const recommendations = generateRecommendations({
            weatherScore,
            soilScore,
            landScore: locationScore,
            environmentalScore: cropScore,
            marketScore: 70, // Default market score
            historicalScore: cropScore
        });

        // Create credit score record
        const creditScore = new CreditScore({
            farmerId: farmer._id,
            creditScore: finalScore,
            riskCategory,
            breakdown: {
                weatherScore,
                soilScore,
                landScore: locationScore,
                environmentalScore: cropScore,
                marketScore: 70,
                historicalScore: cropScore
            },
            recommendations,
            validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // Valid for 30 days
        });

        await creditScore.save();

        // Update farmer's credit scores array
        await Farmer.findByIdAndUpdate(farmer._id, {
            $push: { creditScores: creditScore._id }
        });

        return creditScore;
    } catch (error) {
        console.error('Error calculating credit score:', error);
        throw error;
    }
}

// Add this function to calculate soil score
function calculateSoilScore(soilData) {
    let score = 0;
    
    // pH Score (30%)
    const pH = soilData.pH;
    if (pH >= 6.0 && pH <= 7.5) {
        score += 30;
    } else if (pH >= 5.5 && pH <= 8.0) {
        score += 20;
    } else {
        score += 10;
    }

    // Organic Matter Score (20%)
    const organicMatter = soilData.organicMatter;
    if (organicMatter >= 2.0) {
        score += 20;
    } else if (organicMatter >= 1.5) {
        score += 15;
    } else {
        score += 10;
    }

    // Nutrient Levels Score (30%)
    const nutrients = soilData.nutrientLevels;
    if (nutrients.nitrogen === 'High' && nutrients.phosphorus === 'High' && nutrients.potassium === 'High') {
        score += 30;
    } else if (nutrients.nitrogen === 'Medium' && nutrients.phosphorus === 'Medium' && nutrients.potassium === 'Medium') {
        score += 20;
    } else {
        score += 10;
    }

    // Drainage and Erosion Score (20%)
    if (soilData.drainage === 'Good' && soilData.erosionRisk === 'Low') {
        score += 20;
    } else if (soilData.drainage === 'Moderate' && soilData.erosionRisk === 'Medium') {
        score += 10;
    }

    return score;
}
