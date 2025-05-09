const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { authenticate } = require('../middleware/authMiddleware');

router.post('/init', authenticate, paymentController.initPayment);

router.post('/notify', paymentController.paymentNotification);

router.get('/status/:orderId', authenticate, paymentController.getPaymentStatus);

module.exports = router;