const express = require('express');
const path = require('path');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { paymentValidationRules, validate } = require('../middleware/validation');
const verifyShopifyProxy = require('../middleware/shopifyProxy');

// 1. Serve the Premium HTML Interface via App Proxy
router.get('/', verifyShopifyProxy, (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

// 2. Handle API Form Submission
router.post('/submit', verifyShopifyProxy, paymentValidationRules(), validate, paymentController.processPayment);

module.exports = router;