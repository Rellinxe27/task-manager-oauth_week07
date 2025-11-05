const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const session = require('express-session');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
require('dotenv').config();

// Import passport configuration
const passport = require('./config/passport');

const app = express();

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration (required for passport)
app.use(session({
    secret: process.env.SESSION_SECRET || 'bb2a4debe08259c3e57587164e7f9ceed1fc35a7be58448781c8203ec53c7cf7',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production', // true in prod, false in dev
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000,
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
    }
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Swagger configuration
const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Task Manager API with OAuth',
            version: '1.0.0',
            description: 'A REST API for managing tasks with MongoDB and Google OAuth authentication',
            contact: {
                name: 'API Support'
            }
        },
        servers: [
            {
                url: 'http://localhost:3000',
                description: 'Development server'
            },
            {
                url: 'http://localhost:8080',
                description: 'Test server'
            },
            {
                url: 'https://task-manager-oauth-week07.onrender.com',
                description: 'Production server'
            }
        ],
        components: {
            securitySchemes: {
                OAuth2: {
                    type: 'oauth2',
                    flows: {
                        authorizationCode: {
                            authorizationUrl: '/auth/google',
                            tokenUrl: '/auth/google/callback',
                            scopes: {
                                'profile': 'Access user profile',
                                'email': 'Access user email'
                            }
                        }
                    }
                }
            }
        }
    },
    apis: ['./routes/*.js']
};

const swaggerSpecs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

// Routes
app.use('/auth', require('./routes/auth'));
app.use('/api/tasks', require('./routes/tasks'));

// Root route
app.get('/', (req, res) => {
    res.json({
        message: 'Welcome to Task Manager API with OAuth',
        documentation: '/api-docs',
        authentication: {
            login: 'GET /auth/google',
            logout: 'GET /auth/logout',
            status: 'GET /auth/status',
            profile: 'GET /auth/profile'
        },
        endpoints: {
            getAllTasks: 'GET /api/tasks (requires authentication)',
            getTaskById: 'GET /api/tasks/:id (requires authentication)',
            createTask: 'POST /api/tasks (requires authentication)',
            updateTask: 'PUT /api/tasks/:id (requires authentication)',
            deleteTask: 'DELETE /api/tasks/:id (requires authentication)'
        },
        note: 'All /api/tasks endpoints require Google OAuth authentication'
    });
});

// Dashboard route (protected)
app.get('/dashboard', (req, res) => {
    if (!req.isAuthenticated()) {
        return res.status(401).json({
            success: false,
            message: 'Please login to access dashboard',
            loginUrl: '/auth/google'
        });
    }

    res.json({
        success: true,
        message: `Welcome ${req.user.displayName}!`,
        user: {
            email: req.user.email,
            displayName: req.user.displayName,
            picture: req.user.picture
        },
        links: {
            tasks: '/api/tasks',
            profile: '/auth/profile',
            logout: '/auth/logout'
        }
    });
});

// Login failed route
app.get('/login-failed', (req, res) => {
    res.status(401).json({
        success: false,
        message: 'Authentication failed. Please try again.',
        loginUrl: '/auth/google'
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

// Error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'Something went wrong!',
        error: err.message
    });
});

// Start server first, then connect to MongoDB
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`API Documentation available at http://localhost:${PORT}/api-docs`);
    console.log(`Login with Google at http://localhost:${PORT}/auth/google`);

    // Connect to MongoDB after server starts
    mongoose.connect(process.env.MONGODB_URI)
        .then(() => console.log('MongoDB connected successfully'))
        .catch((err) => {
            console.error('MongoDB connection error:', err.message);
            console.log('Server running but database unavailable');
        });
});
