const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.controller');
const { authenticate } = require('../middleware/auth.middleware');

// ── MoMo Payment Routes ────────────────────────────────────
// Create MoMo payment request
router.post('/momo/create', authenticate, paymentController.createMoMoPayment);

// MoMo return callback (user redirected after payment)
router.get('/momo/return', paymentController.moMoReturn);

// MoMo IPN webhook (server-to-server confirmation)
router.post('/momo/ipn', paymentController.moMoIPN);

// ── VNPay Payment Routes ───────────────────────────────────
// Create VNPay payment request
router.post('/vnpay/create', authenticate, paymentController.createVNPayPayment);

// VNPay return callback (user redirected after payment)
router.get('/vnpay/return', paymentController.vnpayReturn);

// VNPay IPN webhook (server-to-server confirmation)
router.get('/vnpay/ipn', paymentController.vnpayIPN);

// ── General Payment Routes ─────────────────────────────────
// All routes below require authentication
router.use(authenticate);

// Get current user's payments
router.get('/my', paymentController.getMyPayments);

// Get specific payment details
router.get('/:id', paymentController.getPayment);

// Get all payments (admin only)
router.get('/', paymentController.getPayments);

module.exports = router;
