const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { upload } = require('../middleware/upload.middleware');

// All routes require authentication
router.use(authenticate);

// Agent routes
router.post('/', paymentController.createPayment);
router.get('/my', paymentController.getMyPayments);
router.post('/:id/proof', upload.single('proof'), paymentController.uploadProof);

// Admin routes
router.get('/', paymentController.getPayments);
router.put('/:id/confirm', paymentController.confirmPayment);
router.put('/:id/reject', paymentController.rejectPayment);

module.exports = router;
