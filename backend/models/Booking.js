const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    bikeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Bike',
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    fromDate: {
        type: Date,
        required: true
    },
    toDate: {
        type: Date,
        required: true
    },
    totalCost: {
        type: Number,
        required: true
    },
    paymentId: {
        type: String,
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'failed'],
        default: 'pending'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;