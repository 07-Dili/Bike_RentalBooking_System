const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { verifyToken, isAdmin } = require('../auth/auth.middleware');

router.use(verifyToken, isAdmin);

router.post('/bikes', adminController.addBike);
router.put('/bikes/:id', adminController.updateBike);
router.delete('/bikes/:id', adminController.deleteBike);

router.get('/bookings', adminController.getAllBookings);
router.put('/bookings/:id/status', adminController.updateBookingStatus);

router.get('/users', adminController.getAllUsers);

module.exports = router;