const express = require('express');
const router = express.Router();
const { Notification } = require('../models/Review');
const { protect } = require('../middleware/auth');

router.use(protect);

// GET /api/notifications
router.get('/', async (req, res) => {
  const notifs = await Notification.find({ user: req.user._id }).sort('-createdAt').limit(20);
  const unread = await Notification.countDocuments({ user: req.user._id, isRead: false });
  res.json({ success: true, notifications: notifs, unread });
});

// PUT /api/notifications/read-all
router.put('/read-all', async (req, res) => {
  await Notification.updateMany({ user: req.user._id, isRead: false }, { isRead: true, readAt: new Date() });
  res.json({ success: true });
});

// PUT /api/notifications/:id/read
router.put('/:id/read', async (req, res) => {
  await Notification.findByIdAndUpdate(req.params.id, { isRead: true, readAt: new Date() });
  res.json({ success: true });
});

module.exports = router;
