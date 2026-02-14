const Notification = require('../models/Notification');

// @desc    Get notifications for current user
// @route   GET /api/notifications
// @access  Private
exports.getNotifications = async (req, res) => {
    try {
        const { page = 1, limit = 20 } = req.query;

        const query = {
            $or: [
                { broadcast: true, targetRole: { $in: ['all', req.user.role] } },
                { recipients: req.user._id }
            ]
        };

        const total = await Notification.countDocuments(query);
        const notifications = await Notification.find(query)
            .populate('createdBy', 'name role')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        // Add isRead flag for each notification
        const data = notifications.map(n => ({
            ...n.toObject(),
            isRead: n.readBy.some(id => id.toString() === req.user._id.toString())
        }));

        res.status(200).json({ success: true, data, pagination: { total, page: parseInt(page), pages: Math.ceil(total / limit) } });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Create notification
// @route   POST /api/notifications
// @access  Admin/Warden
exports.createNotification = async (req, res) => {
    try {
        req.body.createdBy = req.user._id;
        const notification = await Notification.create(req.body);
        res.status(201).json({ success: true, data: notification });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
exports.markAsRead = async (req, res) => {
    try {
        const notification = await Notification.findById(req.params.id);
        if (!notification) {
            return res.status(404).json({ success: false, message: 'Notification not found' });
        }

        if (!notification.readBy.includes(req.user._id)) {
            notification.readBy.push(req.user._id);
            await notification.save();
        }

        res.status(200).json({ success: true, message: 'Marked as read' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
exports.markAllAsRead = async (req, res) => {
    try {
        const query = {
            $or: [
                { broadcast: true, targetRole: { $in: ['all', req.user.role] } },
                { recipients: req.user._id }
            ],
            readBy: { $ne: req.user._id }
        };

        await Notification.updateMany(query, { $push: { readBy: req.user._id } });
        res.status(200).json({ success: true, message: 'All notifications marked as read' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Delete notification
// @route   DELETE /api/notifications/:id
// @access  Admin
exports.deleteNotification = async (req, res) => {
    try {
        await Notification.findByIdAndDelete(req.params.id);
        res.status(200).json({ success: true, message: 'Notification deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get unread count
// @route   GET /api/notifications/unread-count
// @access  Private
exports.getUnreadCount = async (req, res) => {
    try {
        const count = await Notification.countDocuments({
            $or: [
                { broadcast: true, targetRole: { $in: ['all', req.user.role] } },
                { recipients: req.user._id }
            ],
            readBy: { $ne: req.user._id }
        });

        res.status(200).json({ success: true, count });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
