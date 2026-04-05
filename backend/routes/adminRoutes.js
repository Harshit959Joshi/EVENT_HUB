const express = require('express');
const router = express.Router();
const { getDashboardStats, getAllUsers, toggleUserStatus, toggleFeatureEvent } = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect, authorize('admin'));
router.get('/stats', getDashboardStats);
router.get('/users', getAllUsers);
router.put('/users/:id/toggle', toggleUserStatus);
router.put('/events/:id/feature', toggleFeatureEvent);

module.exports = router;
