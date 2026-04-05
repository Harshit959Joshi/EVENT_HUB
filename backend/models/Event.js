/**
 * Event Model
 * Full event schema with categories, pricing, location, images
 */
const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
  {
    organizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Event title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: ['technology', 'music', 'sports', 'food', 'art', 'business', 'education', 'health', 'other'],
    },
    date: {
      type: Date,
      required: [true, 'Event date is required'],
    },
    endDate: {
      type: Date,
    },
    location: {
      venue: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, default: '' },
      address: { type: String, default: '' },
      coordinates: {
        lat: { type: Number },
        lng: { type: Number },
      },
    },
    image: {
      type: String,
      default: '',
    },
    images: [{ type: String }],
    ticketsTotal: {
      type: Number,
      required: [true, 'Total tickets is required'],
      min: [1, 'Must have at least 1 ticket'],
    },
    ticketsSold: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    currency: {
      type: String,
      default: 'INR',
    },
    isFree: {
      type: Boolean,
      default: false,
    },
    tags: [{ type: String, lowercase: true }],
    status: {
      type: String,
      enum: ['draft', 'published', 'cancelled', 'completed'],
      default: 'published',
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    // Average rating (computed from reviews)
    rating: {
      average: { type: Number, default: 0 },
      count: { type: Number, default: 0 },
    },
    // Stripe product/price IDs for payment
    stripeProductId: { type: String, default: '' },
    stripePriceId: { type: String, default: '' },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ─── Virtual: tickets available ───────────────────────────────────────────────
eventSchema.virtual('ticketsAvailable').get(function () {
  return this.ticketsTotal - this.ticketsSold;
});

// ─── Virtual: is sold out ─────────────────────────────────────────────────────
eventSchema.virtual('isSoldOut').get(function () {
  return this.ticketsSold >= this.ticketsTotal;
});

// ─── Indexes for fast search ───────────────────────────────────────────────────
eventSchema.index({ title: 'text', description: 'text', tags: 'text' });
eventSchema.index({ date: 1 });
eventSchema.index({ 'location.city': 1 });
eventSchema.index({ category: 1 });
eventSchema.index({ status: 1, isFeatured: -1 });

module.exports = mongoose.model('Event', eventSchema);
