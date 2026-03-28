const express = require('express');
const path = require('path');
const fs = require('fs');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { paymentValidationRules, validate } = require('../middleware/validation');
const verifyShopifyProxy = require('../middleware/shopifyProxy');

// 1. Serve the Premium HTML Interface via App Proxy
router.get('/', verifyShopifyProxy, (req, res) => {
    try {
        const htmlPath = path.join(__dirname, '../public/index.html');
        const cssPath = path.join(__dirname, '../public/css/style.css');
        const jsPath = path.join(__dirname, '../public/js/app.js');
        
        let html = fs.readFileSync(htmlPath, 'utf8');
        const css = fs.readFileSync(cssPath, 'utf8');
        const js = fs.readFileSync(jsPath, 'utf8');
        
        html = html.replace('<link rel="stylesheet" href="/public/css/style.css">', `<style>\n${css}\n</style>`);
        html = html.replace('<script src="/public/js/app.js"></script>', `<script>\n${js}\n</script>`);
        
        res.send(html);
    } catch (error) {
        console.error("Error reading frontend files:", error);
        res.status(200).send("Error loading payment form.");
    }
});

// Create an array of middlewares for cleanliness
const processPaymentMiddlewares = [
    verifyShopifyProxy, 
    paymentValidationRules(), 
    validate, 
    paymentController.processPayment
];

// 2. Handle API Form Submission (Catch both root and /submit paths)
router.post('/', processPaymentMiddlewares);
router.post('/submit', processPaymentMiddlewares);

module.exports = router;