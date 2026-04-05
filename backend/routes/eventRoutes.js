// ─── eventRoutes.js ───────────────────────────────────────────────────────────
const express = require('express');
const router = express.Router();
const {
  getEvents, getEvent, createEvent, updateEvent, deleteEvent,
  getMyEvents, getEventAttendees, getFeaturedEvents,
} = require('../controllers/eventController');
const { protect, authorize, optionalAuth } = require('../middleware/auth');

router.get('/featured', getFeaturedEvents);
router.get('/organizer/my', protect, authorize('organizer', 'admin'), getMyEvents);
router.get('/:id/attendees', protect, authorize('organizer', 'admin'), getEventAttendees);

router.route('/')
  .get(optionalAuth, getEvents)
  .post(protect, authorize('organizer', 'admin'), createEvent);

router.route('/:id')
  .get(optionalAuth, getEvent)
  .put(protect, authorize('organizer', 'admin'), updateEvent)
  .delete(protect, authorize('organizer', 'admin'), deleteEvent);

module.exports = router;
