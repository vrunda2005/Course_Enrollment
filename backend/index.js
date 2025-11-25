require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
const allowedOrigins = [
    process.env.FRONTEND_URL,
    'http://localhost:5173',
    'http://localhost:3000'
].filter(Boolean);

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) {
            var msg = 'The CORS policy for this site does not allow access from the specified Origin.';
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    },
    credentials: true
}));
app.use(express.json());

// Database Connection
const db = require('./db');

// Test DB Connection
db.pool.connect((err, client, release) => {
    if (err) {
        return console.error('Error acquiring client', err.stack);
    }
    console.log('Connected to PostgreSQL database');
    release();
});

// Controllers
const studentsRouter = require('./controllers/studentsController');
const coursesRouter = require('./controllers/coursesController');
const enrollmentsRouter = require('./controllers/enrollmentsController');
const departmentsRouter = require('./controllers/departmentsController');
const statsRouter = require('./controllers/statsController');
const { register, login } = require('./controllers/authController');
const { verifyToken, authorizeRoles } = require('./middleware/authMiddleware');
const errorHandler = require('./middleware/errorHandler');

// Public Routes
app.post('/api/auth/register', register);
app.post('/api/auth/login', login);

// Protected Routes
app.use('/api/students', verifyToken, studentsRouter); // All student routes require login
// Example of role-based protection (can be more granular inside controllers or specific routes)
// For now, let's say only admins can delete, but we'll enforce that in the specific router or here if we want global rules.
// For this task, let's protect everything with verifyToken first, and then we can add specific role checks.

app.use('/api/courses', verifyToken, coursesRouter);
app.use('/api/enrollments', verifyToken, enrollmentsRouter);
app.use('/api/departments', verifyToken, departmentsRouter);
app.use('/api/stats', verifyToken, statsRouter);

// Error handling middleware (must be after routes)
app.use(errorHandler);

const server = app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

server.on('error', (e) => {
    console.error('Server error:', e);
});

process.on('SIGTERM', () => {
    console.log('SIGTERM received');
    server.close(() => {
        console.log('Process terminated');
    });
});

// Keep alive check
setInterval(() => {
    // console.log('Heartbeat');
}, 10000);
