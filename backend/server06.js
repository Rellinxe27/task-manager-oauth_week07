const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Swagger configuration
const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Task Manager API',
            version: '1.0.0',
            description: 'A REST API for managing tasks with MongoDB',
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
                url: 'https://task-manager-week06.onrender.com',
                description: 'Production server'
            }
        ]
    },
    apis: ['./routes/*.js']
};

const swaggerSpecs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

// Routes
app.use('/api/tasks', require('./routes/tasks'));

// Root route
app.get('/', (req, res) => {
    res.json({
        message: 'Welcome to Task Manager API',
        documentation: '/api-docs',
        endpoints: {
            getAllTasks: 'GET /api/tasks',
            getTaskById: 'GET /api/tasks/:id',
            createTask: 'POST /api/tasks',
            updateTask: 'PUT /api/tasks/:id',
            deleteTask: 'DELETE /api/tasks/:id'
        }
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
    console.log(`API Documentation available at /api-docs`);

    // Connect to MongoDB after server starts
    mongoose.connect(process.env.MONGODB_URI)
        .then(() => console.log('MongoDB connected successfully'))
        .catch((err) => {
            console.error('MongoDB connection error:', err.message);
            console.log('Server running but database unavailable');
        });
});
