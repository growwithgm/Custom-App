const crypto = require('crypto');
const axios = require('axios');
const dbService = require('../services/dbService');

exports.login = (req, res) => {
    const shop = req.query.shop;
    if (!shop) {
        return res.status(400).send('Missing shop parameter.');
    }

    const redirectUri = `${process.env.SHOPIFY_APP_URL}/auth/callback`;
    const installUrl = `https://${shop}/admin/oauth/authorize?client_id=${process.env.SHOPIFY_CLIENT_ID}&scope=${process.env.SHOPIFY_APP_SCOPES}&redirect_uri=${redirectUri}`;
    
    res.redirect(installUrl);
};

exports.callback = async (req, res) => {
    const { shop, hmac, code } = req.query;

    if (!shop || !hmac || !code) {
        return res.status(400).send('Required parameters missing.');
    }

    // Verify HMAC
    const map = Object.assign({}, req.query);
    delete map['signature'];
    delete map['hmac'];
    
    const message = Object.keys(map).sort().map(key => `${key}=${map[key]}`).join('&');
    const generatedHash = crypto.createHmac('sha256', process.env.SHOPIFY_CLIENT_SECRET).update(message).digest('hex');

    if (generatedHash !== hmac) {
        return res.status(400).send('HMAC validation failed.');
    }

    // Exchange code for access token
    try {
        const response = await axios.post(`https://${shop}/admin/oauth/access_token`, {
            client_id: process.env.SHOPIFY_CLIENT_ID,
            client_secret: process.env.SHOPIFY_CLIENT_SECRET,
            code: code
        });

        const accessToken = response.data.access_token;
        dbService.saveShopToken(shop, accessToken);

        // Redirect back to Shopify Admin
        res.redirect(`https://${shop}/admin/apps/${process.env.SHOPIFY_CLIENT_ID}`);
    } catch (error) {
        console.error('OAuth token exchange failed:', error.message);
        res.status(500).send('Could not complete OAuth flow.');
    }
};