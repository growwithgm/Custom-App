const errorHandler = (err, req, res, next) => {
    // Only log the stack trace if we are not in production to prevent secret leakage
    if (process.env.NODE_ENV !== 'production') {
        console.error(err.stack);
    } else {
        console.error(err.message);
    }

    const statusCode = err.statusCode || 500;
    const message = statusCode === 500 ? 'An unexpected server error occurred.' : err.message;

    res.status(statusCode).json({ error: message });
};

module.exports = errorHandler;