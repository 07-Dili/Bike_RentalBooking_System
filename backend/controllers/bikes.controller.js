const Bike = require('../models/Bike');
const Booking = require('../models/Booking');

exports.getAllBikes = async (req, res) => {
  try {
    const { fromDate, toDate, type } = req.query;

    let query = {};

    if (type) {
      query.type = type;
    }

    let bikes;

    if (fromDate && toDate) {
      const requestedFrom = new Date(fromDate);
      const requestedTo = new Date(toDate);

      const overlappingBookings = await Booking.find({
        paymentStatus: 'paid',
        $or: [
          {
            fromDate: { $lt: requestedTo },
            toDate: { $gt: requestedFrom }
          },
          {
            fromDate: { $lte: requestedFrom },
            toDate: { $gte: requestedTo }
          }
        ]
      }).select('bikeId');

      const bookedBikeIds = new Set(overlappingBookings.map(booking => booking.bikeId.toString()));

      const allBikesMatchingType = await Bike.find(query);

      bikes = allBikesMatchingType.map(bike => {
        const isBooked = bookedBikeIds.has(bike._id.toString());
        return {
          ...bike.toObject(),
          availability: !isBooked,
        };
      });

    } else {
      bikes = await Bike.find(query);
    }

    res.status(200).json(bikes);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching bikes', error: error.message });
  }
};

exports.getBikeById = async (req, res) => {
  try {
    const bike = await Bike.findById(req.params.id);
    if (!bike) {
      return res.status(404).json({ message: 'Bike not found' });
    }
    res.status(200).json(bike);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.addBike = async (req, res) => {
  try {
    const newBike = new Bike(req.body);
    await newBike.save();
    res.status(201).json(newBike);
  } catch (error) {
    res.status(500).json({ message: 'Error adding bike', error: error.message });
  }
};

exports.updateBike = async (req, res) => {
  try {
    const bike = await Bike.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!bike) {
      return res.status(404).json({ message: 'Bike not found' });
    }
    res.status(200).json(bike);
  } catch (error) {
    res.status(500).json({ message: 'Error updating bike', error: error.message });
  }
};

exports.deleteBike = async (req, res) => {
  try {
    const bike = await Bike.findByIdAndDelete(req.params.id);
    if (!bike) {
      return res.status(404).json({ message: 'Bike not found' });
    }
    res.status(200).json({ message: 'Bike successfully deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting bike', error: error.message });
  }
};