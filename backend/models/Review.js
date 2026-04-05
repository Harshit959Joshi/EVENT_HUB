/**
 * Review Model - Ratings & reviews for events
 */
const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    title: { type: String, maxlength: 100, default: '' },
    comment: { type: String, required: true, maxlength: 500 },
    isVerifiedAttendee: { type: Boolean, default: false }, // Only attendees can review
    helpful: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Users who marked helpful
  },
  { timestamps: true }
);

// Each user can only review an event once
reviewSchema.index({ user: 1, event: 1 }, { unique: true });

// ─── Static method: recalculate average rating on Event ───────────────────────
reviewSchema.statics.calcAverageRating = async function (eventId) {
  const result = await this.aggregate([
    { $match: { event: eventId } },
    { $group: { _id: '$event', avgRating: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);
  const Event = require('./Event');
  if (result.length > 0) {
    await Event.findByIdAndUpdate(eventId, {
      'rating.average': Math.round(result[0].avgRating * 10) / 10,
      'rating.count': result[0].count,
    });
  } else {
    await Event.findByIdAndUpdate(eventId, { 'rating.average': 0, 'rating.count': 0 });
  }
};

reviewSchema.post('save', function () {
  this.constructor.calcAverageRating(this.event);
});
reviewSchema.post('remove', function () {
  this.constructor.calcAverageRating(this.event);
});

const Review = mongoose.model('Review', reviewSchema);

// ─── Notification Model ────────────────────────────────────────────────────────
const notificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: {
      type: String,
      enum: ['booking_confirmed', 'booking_cancelled', 'event_reminder', 'sold_out', 'new_event', 'payment', 'general'],
      required: true,
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    data: { type: mongoose.Schema.Types.Mixed, default: {} }, // Extra context (eventId, bookingId etc.)
    isRead: { type: Boolean, default: false },
    readAt: { type: Date },
  },
  { timestamps: true }
);

notificationSchema.index({ user: 1, isRead: 1, createdAt: -1 });

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = { Review, Notification };
