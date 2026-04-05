/**
 * Review Controller
 */
const { Review } = require('../models/Review');
const Booking = require('../models/Booking');
const Event = require('../models/Event');

// POST /api/reviews
exports.createReview = async (req, res, next) => {
  try {
    const { eventId, rating, title, comment } = req.body;

    // Verify user attended the event
    const booking = await Booking.findOne({
      user: req.user._id, event: eventId, status: 'confirmed',
    });

    const review = await Review.create({
      user: req.user._id,
      event: eventId,
      rating,
      title,
      comment,
      isVerifiedAttendee: !!booking,
    });
    await review.populate('user', 'name avatar');
    res.status(201).json({ success: true, review });
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ success: false, message: 'You already reviewed this event.' });
    next(err);
  }
};

// GET /api/reviews/event/:eventId
exports.getEventReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ event: req.params.eventId })
      .populate('user', 'name avatar')
      .sort('-createdAt');
    res.json({ success: true, count: reviews.length, reviews });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/reviews/:id
exports.deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ success: false, message: 'Review not found.' });
    if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }
    await review.deleteOne();
    res.json({ success: true, message: 'Review deleted.' });
  } catch (err) {
    next(err);
  }
};
