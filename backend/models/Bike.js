const mongoose = require('mongoose');

const bikeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Bike name is required'],
  },
  type: {
    type: String,
    enum: ['Classic', 'Sports', 'Scooty', 'Electric', 'Standard'],
    required: [true, 'Bike type is required'],
  },
  rentalPricePerHour: {
    type: Number,
    required: [true, 'Rental price per hour is required'],
    min: [0, 'Price cannot be negative'],
  },
  imageUrl: {
    type: String,
    required: [true, 'Image URL is required'],
  },
  availability: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true
});

const Bike = mongoose.model('Bike', bikeSchema);

module.exports = Bike;