const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/booking.controller');
const { verifyToken } = require('../auth/auth.middleware');


router.get('/', verifyToken, bookingController.getUserBookings);


router.post('/', verifyToken, bookingController.createBooking);

router.post('/update-payment', verifyToken, bookingController.updateBookingPayment);

module.exports = router;