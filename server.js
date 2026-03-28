require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const path = require('path');
const rateLimit = require('express-rate-limit');

const authRoutes = require('./routes/auth');
const proxyRoutes = require('./routes/proxy');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 3000;

// Trust proxy for rate limiting (required for Render)
app.set('trust proxy', 1);

// Security Middleware
app.use(helmet({
  contentSecurityPolicy: false,
  frameguard: false
}));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate Limiting (Abuse protection)
const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 100, 
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many requests, please try again later.' }
});
app.use(globalLimiter);

// Static assets for frontend
app.use('/public', express.static(path.join(__dirname, 'public')));

// Routes
// 1. App Installation / OAuth Flow
app.use('/auth', authRoutes);

// 2. App Proxy Storefront Flow
app.use('/proxy', proxyRoutes);

// 3. Admin Dashboard Iframe Route (Fixes the Grey/Blank Screen Issue)
app.get('/', (req, res) => {
    res.send(`
        <div style="font-family: 'Inter', sans-serif; padding: 50px; text-align: center; color: #202223; background-color: #f4f6f8; height: 100vh;">
            <div style="background: white; padding: 40px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); display: inline-block; max-width: 600px;">
                <h2 style="margin-top: 0; color: #008060;">✅ Custom Payment App is Active!</h2>
                <p style="font-size: 16px;">Your backend server is running perfectly on Render.</p>
                <hr style="border: 0; border-top: 1px solid #e1e3e5; margin: 20px 0;">
                <p style="color: #6d7175; font-size: 14px;">To view the actual payment form, open a new tab and visit the App Proxy URL you configured on your storefront.</p>
                <p style="background: #f4f6f8; padding: 10px; border-radius: 4px; font-family: monospace; font-size: 14px;">yourstore.myshopify.com/apps/custom-pay</p>
            </div>
        </div>
    `);
});

// Error Handling Middleware
app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT} in ${process.env.NODE_ENV} mode.`);
});