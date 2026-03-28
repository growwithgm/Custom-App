const express = require('express');
const path = require('path');
const fs = require('fs');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { paymentValidationRules, validate } = require('../middleware/validation');
const verifyShopifyProxy = require('../middleware/shopifyProxy');

// 1. Serve the Premium HTML Interface via App Proxy
router.get('/', verifyShopifyProxy, (req, res) => {
    const htmlPath = path.join(__dirname, '../public/index.html');
    
    try {
        let html = fs.readFileSync(htmlPath, 'utf8');
        
        // Inject absolute backend URLs so CSS and JS never fail to load via Shopify Proxy
        const backendUrl = process.env.SHOPIFY_APP_URL || '';
        
        // Replace relative paths with absolute Render paths
        html = html.replace(/href="\/public/g, `href="${backendUrl}/public`);
        html = html.replace(/src="\/public/g, `src="${backendUrl}/public`);
        
        // Cleanup fallback paths just in case
        html = html.replace(/href="proxy\/public/g, `href="${backendUrl}/public`);
        html = html.replace(/src="proxy\/public/g, `src="${backendUrl}/public`);
        
        res.send(html);
    } catch (error) {
        console.error("Error reading index.html:", error);
        res.status(500).send("Error loading payment form.");
    }
});

// 2. Handle API Form Submission
router.post('/submit', verifyShopifyProxy, paymentValidationRules(), validate, paymentController.processPayment);

module.exports = router;