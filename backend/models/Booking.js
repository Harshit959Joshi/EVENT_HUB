/**
 * Booking Model
 * Tracks ticket reservations with payment status
 */
const mongoose = require('mongoose');
const crypto = require('crypto');

const bookingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
    },
    ticketsBooked: {
      type: Number,
      required: [true, 'Number of tickets is required'],
      min: [1, 'Must book at least 1 ticket'],
      max: [10, 'Cannot book more than 10 tickets at once'],
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled', 'refunded'],
      default: 'pending',
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded', 'free'],
      default: 'pending',
    },
    paymentMethod: {
      type: String,
      enum: ['stripe', 'free', 'offline'],
      default: 'free',
    },
    // Stripe payment details
    stripePaymentIntentId: { type: String, default: '' },
    stripeChargeId: { type: String, default: '' },
    // Unique booking reference shown to user
    bookingRef: {
      type: String,
      unique: true,
    },
    // QR code data (for check-in)
    qrCode: { type: String, default: '' },
    // Cancellation details
    cancelledAt: { type: Date },
    cancellationReason: { type: String, default: '' },
    refundAmount: { type: Number, default: 0 },
    // Attendee details at time of booking
    attendeeInfo: {
      name: String,
      email: String,
      phone: String,
    },
  },
  { timestamps: true }
);

// ─── Auto-generate booking reference before saving ─────────────────────────────
bookingSchema.pre('save', function (next) {
  if (!this.bookingRef) {
    this.bookingRef = 'EH-' + crypto.randomBytes(4).toString('hex').toUpperCase();
  }
  next();
});

// ─── Index for fast lookups ────────────────────────────────────────────────────
bookingSchema.index({ user: 1, event: 1 });
bookingSchema.index({ bookingRef: 1 });
bookingSchema.index({ status: 1 });

module.exports = mongoose.model('Booking', bookingSchema);
