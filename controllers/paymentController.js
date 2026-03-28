const shopifyService = require('../services/shopifyService');
const dbService = require('../services/dbService');

exports.processPayment = async (req, res, next) => {
    try {
        const { shop } = req.query; // Extracted safely from the validated App Proxy
        const { amount, fullName, email, phone, reference, note } = req.body;

        if (!shop) throw new Error("Shop domain missing from proxy request.");

        const token = dbService.getShopToken(shop);
        if (!token) {
            return res.status(403).json({ error: "App is not properly installed or authenticated." });
        }

        const draftOrderData = {
            amount: parseFloat(amount).toFixed(2),
            fullName,
            email,
            phone,
            reference,
            note
        };

        const invoiceUrl = await shopifyService.createDraftOrder(shop, token, draftOrderData);

        return res.status(200).json({
            success: true,
            checkoutUrl: invoiceUrl // Instant redirect URL
        });

    } catch (error) {
        next(error);
    }
};