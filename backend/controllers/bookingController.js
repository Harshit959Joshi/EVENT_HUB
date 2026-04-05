/**
 * Booking Controller
 * Handles ticket booking with overbooking prevention (atomic update)
 */
const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const Event = require('../models/Event');
const { Notification } = require('../models/Review');
const { sendEmail } = require('../utils/email');

// ─── POST /api/bookings ───────────────────────────────────────────────────────
exports.createBooking = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { eventId, ticketsBooked, attendeeInfo } = req.body;

    if (!ticketsBooked || ticketsBooked < 1) {
      return res.status(400).json({ success: false, message: 'Must book at least 1 ticket.' });
    }

    // Lock the event document to prevent race conditions
    const event = await Event.findById(eventId).session(session);
    if (!event) throw new Error('Event not found.');
    if (event.status !== 'published') throw new Error('This event is not available for booking.');

    const available = event.ticketsTotal - event.ticketsSold;
    if (available < ticketsBooked) {
      throw new Error(`Only ${available} ticket(s) available. You requested ${ticketsBooked}.`);
    }

    // Check if user already has an active booking for this event
    const existingBooking = await Booking.findOne({
      user: req.user._id, event: eventId,
      status: { $in: ['pending', 'confirmed'] },
    });
    if (existingBooking) {
      throw new Error('You already have an active booking for this event.');
    }

    const totalAmount = event.isFree ? 0 : event.price * ticketsBooked;

    // Create booking
    const booking = await Booking.create([{
      user: req.user._id,
      event: eventId,
      ticketsBooked,
      totalAmount,
      status: event.isFree ? 'confirmed' : 'pending',
      paymentStatus: event.isFree ? 'free' : 'pending',
      paymentMethod: event.isFree ? 'free' : 'stripe',
      attendeeInfo: attendeeInfo || { name: req.user.name, email: req.user.email },
    }], { session });

    // Atomically increment sold count
    await Event.findByIdAndUpdate(eventId, { $inc: { ticketsSold: ticketsBooked } }, { session });

    await session.commitTransaction();

    const populatedBooking = await Booking.findById(booking[0]._id)
      .populate('event', 'title date location image price isFree')
      .populate('user', 'name email');

    // ── Real-time notification via socket ──
    req.io.to(req.user._id.toString()).emit('booking_confirmed', {
      message: `Booking confirmed for ${event.title}!`,
      booking: populatedBooking,
    });

    // Notify organizer
    req.io.to(event.organizer.toString()).emit('new_booking', {
      message: `New booking for your event: ${event.title}`,
      count: ticketsBooked,
    });

    // Check if sold out — notify all watchers
    if (event.ticketsSold + ticketsBooked >= event.ticketsTotal) {
      req.io.emit('event_sold_out', {
        eventId,
        message: `${event.title} is now SOLD OUT!`,
      });
    }

    // ── Persist notification in DB ──
    await Notification.create({
      user: req.user._id,
      type: 'booking_confirmed',
      title: 'Booking Confirmed! 🎉',
      message: `Your ${ticketsBooked} ticket(s) for "${event.title}" have been confirmed.`,
      data: { eventId: event._id, bookingId: populatedBooking._id, bookingRef: populatedBooking.bookingRef },
    });

    // ── Send confirmation email ──
    sendEmail({
      to: req.user.email,
      subject: `✅ Booking Confirmed — ${event.title}`,
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:auto">
          <h2 style="color:#FF9933">Booking Confirmed!</h2>
          <p>Hi ${req.user.name},</p>
          <p>Your booking for <strong>${event.title}</strong> is confirmed.</p>
          <table style="width:100%;border-collapse:collapse">
            <tr><td style="padding:8px;background:#f9f9f9"><strong>Booking Ref</strong></td><td style="padding:8px">${populatedBooking.bookingRef}</td></tr>
            <tr><td style="padding:8px;background:#f9f9f9"><strong>Tickets</strong></td><td style="padding:8px">${ticketsBooked}</td></tr>
            <tr><td style="padding:8px;background:#f9f9f9"><strong>Amount</strong></td><td style="padding:8px">₹${totalAmount}</td></tr>
          </table>
          <p style="color:#666;font-size:12px">Thank you for using EventHub!</p>
        </div>
      `,
    }).catch(console.error);

    res.status(201).json({ success: true, booking: populatedBooking });
  } catch (err) {
    await session.abortTransaction();
    res.status(400).json({ success: false, message: err.message });
  } finally {
    session.endSession();
  }
};

// ─── GET /api/bookings/my ─────────────────────────────────────────────────────
exports.getMyBookings = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const query = { user: req.user._id };
    if (status) query.status = status;

    const total = await Booking.countDocuments(query);
    const bookings = await Booking.find(query)
      .populate('event', 'title date location image category price isFree organizer')
      .sort('-createdAt')
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    res.json({ success: true, count: bookings.length, total, bookings });
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/bookings/:id ────────────────────────────────────────────────────
exports.getBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('event', 'title date location image price isFree organizer')
      .populate('user', 'name email');

    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found.' });
    if (booking.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }

    res.json({ success: true, booking });
  } catch (err) {
    next(err);
  }
};

// ─── PUT /api/bookings/:id/cancel ─────────────────────────────────────────────
exports.cancelBooking = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const booking = await Booking.findById(req.params.id).session(session);
    if (!booking) throw new Error('Booking not found.');
    if (booking.user.toString() !== req.user._id.toString()) throw new Error('Not authorized.');
    if (booking.status === 'cancelled') throw new Error('Booking is already cancelled.');

    const { cancellationReason } = req.body;

    booking.status = 'cancelled';
    booking.cancelledAt = new Date();
    booking.cancellationReason = cancellationReason || 'Cancelled by user';
    await booking.save({ session });

    // Release tickets
    await Event.findByIdAndUpdate(
      booking.event,
      { $inc: { ticketsSold: -booking.ticketsBooked } },
      { session }
    );

    await session.commitTransaction();

    // Socket notification
    req.io.to(req.user._id.toString()).emit('booking_cancelled', {
      message: 'Your booking has been cancelled.',
      bookingId: booking._id,
    });

    await Notification.create({
      user: req.user._id,
      type: 'booking_cancelled',
      title: 'Booking Cancelled',
      message: `Your booking has been cancelled. Ref: ${booking.bookingRef}`,
      data: { bookingId: booking._id },
    });

    res.json({ success: true, message: 'Booking cancelled successfully.', booking });
  } catch (err) {
    await session.abortTransaction();
    res.status(400).json({ success: false, message: err.message });
  } finally {
    session.endSession();
  }
};
