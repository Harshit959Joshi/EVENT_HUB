const express = require('express');
const router = express.Router();
const { createPaymentIntent, confirmPayment, stripeWebhook } = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');

router.post('/create-intent', protect, createPaymentIntent);
router.post('/confirm', protect, confirmPayment);
// Stripe webhook needs raw body
router.post('/webhook', express.raw({ type: 'application/json' }), stripeWebhook);

module.exports = router;
