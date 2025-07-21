const express = require('express');
const router = express.Router();
const bikesController = require('../controllers/bikes.controller');
const { verifyToken, isAdmin } = require('../auth/auth.middleware');

router.get('/', bikesController.getAllBikes);

router.get('/:id', bikesController.getBikeById);

router.post('/', verifyToken, isAdmin, bikesController.addBike);

router.put('/:id', verifyToken, isAdmin, bikesController.updateBike);

router.delete('/:id', verifyToken, isAdmin, bikesController.deleteBike);

module.exports = router;