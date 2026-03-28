const { body, validationResult } = require('express-validator');

const paymentValidationRules = () => {
    return [
        body('amount')
            .isFloat({ min: parseFloat(process.env.MIN_AMOUNT || 1.00), max: parseFloat(process.env.MAX_AMOUNT || 10000.00) })
            .withMessage(`Amount must be between $${process.env.MIN_AMOUNT} and $${process.env.MAX_AMOUNT}`),
        body('fullName')
            .trim()
            .notEmpty().withMessage('Full name is required')
            .isLength({ max: 100 }).withMessage('Name exceeds maximum length')
            .escape(), // Sanitize
        body('email')
            .trim()
            .isEmail().withMessage('Valid email address is required')
            .normalizeEmail(),
        body('phone')
            .optional({ checkFalsy: true })
            .trim()
            .isLength({ max: 20 })
            .escape(),
        body('reference')
            .optional({ checkFalsy: true })
            .trim()
            .isLength({ max: 50 })
            .escape(),
        body('note')
            .optional({ checkFalsy: true })
            .trim()
            .isLength({ max: 500 })
            .escape()
    ];
};

const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (errors.isEmpty()) {
        return next();
    }
    const extractedErrors = errors.array().map(err => err.msg);

    return res.status(422).json({
        error: 'Validation failed',
        details: extractedErrors
    });
};

module.exports = { paymentValidationRules, validate };