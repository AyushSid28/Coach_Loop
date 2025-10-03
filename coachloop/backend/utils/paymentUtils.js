// Payment to duration mapping utility
const PAYMENT_DURATION_MAP = {
    5: 5,    // 5 rupees = 5 minutes
    10: 10,  // 10 rupees = 10 minutes
    15: 15,  // 15 rupees = 15 minutes
    20: 20,  // 20 rupees = 20 minutes
    25: 25,  // 25 rupees = 25 minutes
    30: 30,  // 30 rupees = 30 minutes
    50: 50,  // 50 rupees = 50 minutes
    100: 100 // 100 rupees = 100 minutes
};

/**
 * Get session duration based on payment amount
 * @param {number} amount - Payment amount in rupees
 * @returns {number} Duration in minutes
 */
const getDurationFromAmount = (amount) => {
    return PAYMENT_DURATION_MAP[amount] || 5; // Default to 5 minutes if amount not found
};

/**
 * Get payment amount based on desired duration
 * @param {number} duration - Desired duration in minutes
 * @returns {number} Payment amount in rupees
 */
const getAmountFromDuration = (duration) => {
    // Find the amount that matches the duration
    for (const [amount, dur] of Object.entries(PAYMENT_DURATION_MAP)) {
        if (dur === duration) {
            return parseInt(amount);
        }
    }
    return 5; // Default to 5 rupees if duration not found
};

/**
 * Get all available payment options
 * @returns {Array} Array of payment options with amount and duration
 */
const getPaymentOptions = () => {
    return Object.entries(PAYMENT_DURATION_MAP).map(([amount, duration]) => ({
        amount: parseInt(amount),
        duration,
        label: `₹${amount} for ${duration} minutes`
    }));
};

/**
 * Validate if payment amount is supported
 * @param {number} amount - Payment amount to validate
 * @returns {boolean} True if amount is supported
 */
const isValidPaymentAmount = (amount) => {
    return PAYMENT_DURATION_MAP.hasOwnProperty(amount);
};

module.exports = {
    PAYMENT_DURATION_MAP,
    getDurationFromAmount,
    getAmountFromDuration,
    getPaymentOptions,
    isValidPaymentAmount
};
