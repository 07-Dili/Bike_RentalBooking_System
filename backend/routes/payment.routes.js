const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.controller');
const { verifyToken } = require('../auth/auth.middleware'); 


router.post('/create-order', verifyToken, paymentController.createOrder);
router.post('/verify-payment', verifyToken, paymentController.verifyPayment);

module.exports = router;