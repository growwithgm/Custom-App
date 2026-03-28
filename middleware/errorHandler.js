const errorHandler = (err, req, res, next) => {
    console.error("Backend Error:", err.message);

    // BULLETPROOF FIX: Hamesha 200 status bhejein taake Shopify Proxy HTML page na dikhaye
    res.status(200).json({ 
        error: err.message || 'An unexpected server error occurred.' 
    });
};

module.exports = errorHandler;