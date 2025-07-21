const Bike = require('../models/Bike');
const Booking = require('../models/Booking');
const User = require('../models/User');

exports.addBike = async (req, res) => {
    try {
        const { name, type, rentalPricePerHour, imageUrl } = req.body;
        if (!name || !type || !rentalPricePerHour || !imageUrl) {
            return res.status(400).json({ message: 'Please enter all bike fields' });
        }
        const newBike = new Bike({
            name,
            type,
            rentalPricePerHour,
            imageUrl
        });
        await newBike.save();
        res.status(201).json({ message: 'Bike added successfully!', bike: newBike });
    } catch (error) {
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ message: 'Validation failed', errors: messages });
        }
        res.status(500).json({ message: 'Failed to add bike', error: error.message });
    }
};

exports.updateBike = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, type, rentalPricePerHour, imageUrl } = req.body;
        const updatedBike = await Bike.findByIdAndUpdate(
            id,
            { name, type, rentalPricePerHour, imageUrl },
            { new: true, runValidators: true }
        );
        if (!updatedBike) {
            return res.status(404).json({ message: 'Bike not found' });
        }
        res.status(200).json({ message: 'Bike updated successfully!', bike: updatedBike });
    } catch (error) {
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ message: 'Validation failed', errors: messages });
        }
        res.status(500).json({ message: 'Failed to update bike', error: error.message });
    }
};

exports.deleteBike = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedBike = await Bike.findByIdAndDelete(id);
        if (!deletedBike) {
            return res.status(404).json({ message: 'Bike not found' });
        }
        res.status(200).json({ message: 'Bike deleted successfully!' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete bike', error: error.message });
    }
};

exports.getAllBookings = async (req, res) => {
    try {
        const bookings = await Booking.find().populate('bikeId').populate('userId', '-password');
        res.status(200).json(bookings);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch bookings', error: error.message });
    }
};

exports.updateBookingStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { paymentStatus } = req.body;
        const validStatuses = ['pending', 'paid', 'cancelled', 'completed'];
        if (!validStatuses.includes(paymentStatus)) {
            return res.status(400).json({ message: 'Invalid booking status provided.' });
        }
        const updatedBooking = await Booking.findByIdAndUpdate(
            id,
            { paymentStatus },
            { new: true, runValidators: true }
        );
        if (!updatedBooking) {
            return res.status(404).json({ message: 'Booking not found' });
        }
        res.status(200).json({ message: 'Booking status updated successfully!', booking: updatedBooking });
    } catch (error) {
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ message: 'Validation failed', errors: messages });
        }
        res.status(500).json({ message: 'Failed to update booking status', error: error.message });
    }
};

exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch users', error: error.message });
    }
};