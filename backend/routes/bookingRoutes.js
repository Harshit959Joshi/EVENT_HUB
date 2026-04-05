const express = require('express');
const router = express.Router();
const { createBooking, getMyBookings, getBooking, cancelBooking } = require('../controllers/bookingController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.route('/').post(createBooking).get(getMyBookings);
router.route('/:id').get(getBooking);
router.put('/:id/cancel', cancelBooking);

module.exports = router;
