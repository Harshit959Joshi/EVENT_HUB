/**
 * Payment Controller
 * Stripe integration for paid ticket bookings
 */
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Booking = require('../models/Booking');
const Event = require('../models/Event');

// ─── POST /api/payments/create-intent ─────────────────────────────────────────
exports.createPaymentIntent = async (req, res, next) => {
  try {
    const { eventId, ticketsBooked } = req.body;

    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found.' });
    if (event.isFree) return res.status(400).json({ success: false, message: 'Event is free. No payment needed.' });

    const available = event.ticketsTotal - event.ticketsSold;
    if (available < ticketsBooked) {
      return res.status(400).json({ success: false, message: `Only ${available} tickets available.` });
    }

    const amount = event.price * ticketsBooked * 100; // Stripe uses paise/cents

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'inr',
      metadata: {
        eventId: eventId.toString(),
        userId: req.user._id.toString(),
        ticketsBooked: ticketsBooked.toString(),
      },
      description: `EventHub - ${event.title} x${ticketsBooked}`,
    });

    res.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      amount,
      event: { title: event.title, price: event.price },
    });
  } catch (err) {
    next(err);
  }
};

// ─── POST /api/payments/confirm ───────────────────────────────────────────────
exports.confirmPayment = async (req, res, next) => {
  try {
    const { bookingId, paymentIntentId } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found.' });

    // Verify payment with Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({ success: false, message: 'Payment not completed.' });
    }

    booking.status = 'confirmed';
    booking.paymentStatus = 'paid';
    booking.stripePaymentIntentId = paymentIntentId;
    await booking.save();

    res.json({ success: true, booking });
  } catch (err) {
    next(err);
  }
};

// ─── POST /api/payments/webhook ───────────────────────────────────────────────
exports.stripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'payment_intent.succeeded') {
    const pi = event.data.object;
    await Booking.findOneAndUpdate(
      { stripePaymentIntentId: pi.id },
      { status: 'confirmed', paymentStatus: 'paid' }
    );
  }

  res.json({ received: true });
};
