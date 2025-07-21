const Booking = require('../models/Booking');
const Bike = require('../models/Bike');

const createBooking = async (req, res) => {
  const { bikeId, from, to } = req.body;

  if (!req.user || !req.user.id) {
    return res.status(401).json({ message: 'User not authenticated. Please log in.' });
  }
  const userId = req.user.id;

  try {
    const fromDateTime = new Date(from);
    const toDateTime = new Date(to);

    const conflictingBookings = await Booking.find({
      bikeId: bikeId,
      paymentStatus: 'paid',
      $or: [
        {
          fromDate: { $lt: toDateTime },
          toDate: { $gt: fromDateTime }
        },
        {
          fromDate: { $lte: fromDateTime },
          toDate: { $gte: toDateTime }
        }
      ]
    });

    if (conflictingBookings.length > 0) {
      return res.status(409).json({ message: 'The selected slot is booked. Please try another time.' });
    }

    const newBooking = new Booking({
      bikeId,
      userId,
      fromDate: fromDateTime,
      toDate: toDateTime,
      totalCost: 0,
      isPaid: false,
      paymentStatus: 'pending'
    });

    const savedBooking = await newBooking.save();

    const populatedBooking = await savedBooking.populate('bikeId');

    res.status(201).json({ message: 'Pending booking created successfully!', booking: populatedBooking });

  } catch (error) {

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({
        message: 'Validation failed',
        errors: messages
      });
    }

    res.status(500).json({ message: 'Internal server error. Please try again.' });
  }
};

const updateBookingPayment = async (req, res) => {
  const { bookingId, totalCost, paymentId } = req.body;

  if (!req.user || !req.user.id) {
    return res.status(401).json({ message: 'User not authenticated.' });
  }

  try {
    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found.' });
    }

    if (booking.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this booking.' });
    }

    booking.totalCost = totalCost;
    booking.isPaid = true;
    booking.paymentStatus = 'paid';
    booking.paymentId = paymentId;

    await booking.save();

    res.status(200).json({ message: 'Booking updated successfully!', booking });

  } catch (error) {
    res.status(500).json({ message: 'Internal server error. Could not update booking status.' });
  }
};

const getUserBookings = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ success: false, message: 'User not authenticated.' });
    }
    const userId = req.user.id;

    const bookings = await Booking.find({ userId })
      .populate('bikeId')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', details: error.message });
  }
};

module.exports = {
  createBooking,
  updateBookingPayment,
  getUserBookings
};