const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
    getNotifications, createNotification, markAsRead,
    markAllAsRead, deleteNotification, getUnreadCount
} = require('../controllers/notificationController');

router.get('/', protect, getNotifications);
router.get('/unread-count', protect, getUnreadCount);
router.post('/', protect, authorize('admin', 'warden'), createNotification);
router.put('/read-all', protect, markAllAsRead);
router.put('/:id/read', protect, markAsRead);
router.delete('/:id', protect, authorize('admin'), deleteNotification);

module.exports = router;
