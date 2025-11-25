// server/middleware/errorHandler.js
module.exports = (err, req, res, next) => {
    // Log detailed error information
    console.error('=== ERROR OCCURRED ===');
    console.error('Timestamp:', new Date().toISOString());
    console.error('Method:', req.method);
    console.error('Path:', req.path);
    console.error('Body:', req.body);
    console.error('Error Message:', err.message);
    console.error('Error Stack:', err.stack);
    console.error('Error Code:', err.code);
    console.error('=====================');

    // Determine status code
    const statusCode = err.statusCode || 500;

    // Send appropriate error response
    res.status(statusCode).json({
        error: err.message || 'Server error',
        code: err.code,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
};
