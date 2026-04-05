/**
 * Event Controller
 * CRUD + search, filter, pagination for events
 */
const Event = require('../models/Event');
const Booking = require('../models/Booking');
const { Notification } = require('../models/Review');

// ─── GET /api/events ───────────────────────────────────────────────────────────
exports.getEvents = async (req, res, next) => {
  try {
    const {
      search, category, city, minPrice, maxPrice,
      startDate, endDate, isFree, isFeatured,
      sort = '-date', page = 1, limit = 12,
    } = req.query;

    const query = { status: 'published' };

    // Text search
    if (search) query.$text = { $search: search };

    // Filters
    if (category) query.category = category;
    if (city) query['location.city'] = { $regex: city, $options: 'i' };
    if (isFree === 'true') query.isFree = true;
    if (isFeatured === 'true') query.isFeatured = true;

    // Date range
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    // Price range
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Event.countDocuments(query);

    const events = await Event.find(query)
      .populate('organizer', 'name avatar')
      .sort(sort)
      .skip(skip)
      .limit(Number(limit));

    res.json({
      success: true,
      count: events.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      events,
    });
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/events/:id ──────────────────────────────────────────────────────
exports.getEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id).populate('organizer', 'name avatar email bio');
    if (!event) return res.status(404).json({ success: false, message: 'Event not found.' });
    res.json({ success: true, event });
  } catch (err) {
    next(err);
  }
};

// ─── POST /api/events ─────────────────────────────────────────────────────────
exports.createEvent = async (req, res, next) => {
  try {
    req.body.organizer = req.user._id;
    if (req.body.price === 0 || req.body.price === '0') req.body.isFree = true;

    const event = await Event.create(req.body);
    await event.populate('organizer', 'name avatar');

    // Notify all users (broadcast) about new event via socket
    req.io.emit('new_event', {
      message: `New event: ${event.title}`,
      event: { _id: event._id, title: event.title, image: event.image, date: event.date },
    });

    res.status(201).json({ success: true, event });
  } catch (err) {
    next(err);
  }
};

// ─── PUT /api/events/:id ──────────────────────────────────────────────────────
exports.updateEvent = async (req, res, next) => {
  try {
    let event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found.' });

    // Only organizer who created it or admin can update
    if (event.organizer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to update this event.' });
    }

    if (req.body.price === 0) req.body.isFree = true;

    event = await Event.findByIdAndUpdate(req.params.id, req.body, {
      new: true, runValidators: true,
    }).populate('organizer', 'name avatar');

    res.json({ success: true, event });
  } catch (err) {
    next(err);
  }
};

// ─── DELETE /api/events/:id ───────────────────────────────────────────────────
exports.deleteEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found.' });

    if (event.organizer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this event.' });
    }

    // Cancel all active bookings for this event
    await Booking.updateMany(
      { event: req.params.id, status: { $in: ['pending', 'confirmed'] } },
      { status: 'cancelled', cancellationReason: 'Event cancelled by organizer' }
    );

    await event.deleteOne();
    res.json({ success: true, message: 'Event deleted and all bookings cancelled.' });
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/events/organizer/my ─────────────────────────────────────────────
exports.getMyEvents = async (req, res, next) => {
  try {
    const events = await Event.find({ organizer: req.user._id }).sort('-createdAt');

    // Attach booking counts
    const eventsWithStats = await Promise.all(
      events.map(async (ev) => {
        const bookingCount = await Booking.countDocuments({ event: ev._id, status: 'confirmed' });
        return { ...ev.toObject(), bookingCount };
      })
    );

    res.json({ success: true, events: eventsWithStats });
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/events/:id/attendees ─────────────────────────────────────────────
exports.getEventAttendees = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found.' });

    if (event.organizer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }

    const bookings = await Booking.find({ event: req.params.id, status: 'confirmed' })
      .populate('user', 'name email avatar phone')
      .sort('-createdAt');

    res.json({ success: true, count: bookings.length, bookings });
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/events/featured ─────────────────────────────────────────────────
exports.getFeaturedEvents = async (req, res, next) => {
  try {
    const events = await Event.find({ status: 'published', isFeatured: true })
      .populate('organizer', 'name avatar')
      .sort('-date')
      .limit(6);
    res.json({ success: true, events });
  } catch (err) {
    next(err);
  }
};
