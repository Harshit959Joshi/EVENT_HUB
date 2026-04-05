/**
 * Admin Controller
 */
const User = require('../models/User');
const Event = require('../models/Event');
const Booking = require('../models/Booking');

// GET /api/admin/stats
exports.getDashboardStats = async (req, res, next) => {
  try {
    const [totalUsers, totalEvents, totalBookings, revenue] = await Promise.all([
      User.countDocuments(),
      Event.countDocuments(),
      Booking.countDocuments({ status: 'confirmed' }),
      Booking.aggregate([
        { $match: { status: 'confirmed', paymentStatus: 'paid' } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } },
      ]),
    ]);

    const recentUsers = await User.find().sort('-createdAt').limit(5).select('name email role createdAt');
    const recentEvents = await Event.find().sort('-createdAt').limit(5).populate('organizer', 'name');

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalEvents,
        totalBookings,
        revenue: revenue[0]?.total || 0,
      },
      recentUsers,
      recentEvents,
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/admin/users
exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().sort('-createdAt');
    res.json({ success: true, count: users.length, users });
  } catch (err) {
    next(err);
  }
};

// PUT /api/admin/users/:id/toggle
exports.toggleUserStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    user.isActive = !user.isActive;
    await user.save();
    res.json({ success: true, user });
  } catch (err) {
    next(err);
  }
};

// PUT /api/admin/events/:id/feature
exports.toggleFeatureEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found.' });
    event.isFeatured = !event.isFeatured;
    await event.save();
    res.json({ success: true, event });
  } catch (err) {
    next(err);
  }
};
