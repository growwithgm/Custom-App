const crypto = require('crypto');

const verifyShopifyProxy = (req, res, next) => {
    const { signature } = req.query;
    if (!signature) {
        return res.status(401).json({ error: 'Unauthorized: Missing proxy signature.' });
    }

    // Reconstruct query parameters strictly according to Shopify Proxy requirements
    const queryParams = Object.keys(req.query)
        .filter(key => key !== 'signature')
        .sort()
        .map(key => {
            const value = Array.isArray(req.query[key]) ? req.query[key].join(',') : req.query[key];
            return `${key}=${value}`;
        })
        .join('');

    const calculatedSignature = crypto
        .createHmac('sha256', process.env.SHOPIFY_CLIENT_SECRET)
        .update(queryParams)
        .digest('hex');

    if (calculatedSignature !== signature) {
        return res.status(401).json({ error: 'Unauthorized: Invalid proxy signature.' });
    }

    next();
};

module.exports = verifyShopifyProxy;