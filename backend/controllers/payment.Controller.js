const Razorpay = require('razorpay');
const crypto = require('crypto');
const Booking = require('../models/Booking');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

exports.createOrder = async (req, res) => {
  try {
    const { amount } = req.body;

    const options = {
      amount: Math.round(Number(amount) * 100),
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
      notes: {
        message: "Bike rental booking",
      }
    };

    const order = await razorpay.orders.create(options);
    res.status(201).json({ orderId: order.id });

  } catch (error) {
    res.status(500).json({ message: 'Error creating order', error: error.error || error.message });
  }
};

exports.verifyPayment = async (req, res) => {
  try {
    const { orderId, paymentId, signature, bookingData } = req.body;

    const userIdFromToken = req.user.id;

    if (!orderId || !paymentId || !signature) {
      return res.status(400).json({ success: false, message: "Missing required payment details." });
    }

    const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
    hmac.update(orderId + "|" + paymentId);
    const generatedSignature = hmac.digest('hex');

    if (generatedSignature !== signature) {
      return res.status(400).json({ success: false, message: "Payment verification failed" });
    }

    if (!bookingData) {
      return res.status(400).json({ success: false, message: "Booking data is missing." });
    }

    if (userIdFromToken !== bookingData.userId) {
      return res.status(403).json({ success: false, message: "Unauthorized action." });
    }

    const newBooking = new Booking({
      bikeId: bookingData.bikeId,
      userId: userIdFromToken,
      fromDate: bookingData.fromDate,
      toDate: bookingData.toDate,
      totalCost: bookingData.totalCost,
      paymentId: paymentId,
      paymentStatus: 'paid',
    });
    await newBooking.save();

    res.status(200).json({ success: true, message: "Payment verified and booking created successfully!" });

  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error during verification', details: error.message });
  }
};