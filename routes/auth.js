const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Entry point for Shopify App Installation
router.get('/', authController.login);

// Shopify OAuth Callback
router.get('/callback', authController.callback);

module.exports = router;