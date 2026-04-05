const express = require('express');
const router = express.Router();
const { createReview, getEventReviews, deleteReview } = require('../controllers/reviewController');
const { protect } = require('../middleware/auth');

router.post('/', protect, createReview);
router.get('/event/:eventId', getEventReviews);
router.delete('/:id', protect, deleteReview);

module.exports = router;
