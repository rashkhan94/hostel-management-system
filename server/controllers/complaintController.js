const Complaint = require('../models/Complaint');

// @desc    Get all complaints
// @route   GET /api/complaints
// @access  Private
exports.getComplaints = async (req, res) => {
    try {
        const { status, category, priority, page = 1, limit = 20 } = req.query;
        const query = {};

        // Students can only see their own complaints
        if (req.user.role === 'student') {
            query.student = req.user._id;
        }

        if (status) query.status = status;
        if (category) query.category = category;
        if (priority) query.priority = priority;

        const total = await Complaint.countDocuments(query);
        const complaints = await Complaint.find(query)
            .populate('student', 'name email studentId')
            .populate('assignedTo', 'name email')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        res.status(200).json({
            success: true,
            data: complaints,
            pagination: { total, page: parseInt(page), pages: Math.ceil(total / limit) }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Create complaint
// @route   POST /api/complaints
// @access  Student
exports.createComplaint = async (req, res) => {
    try {
        req.body.student = req.user._id;

        // Auto-fill room number if student has a room
        if (req.user.room) {
            const Room = require('../models/Room');
            const room = await Room.findById(req.user.room);
            if (room) req.body.roomNumber = room.roomNumber;
        }

        const complaint = await Complaint.create(req.body);
        const populated = await Complaint.findById(complaint._id)
            .populate('student', 'name email studentId');

        res.status(201).json({ success: true, data: populated });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update complaint (status, assign, remarks)
// @route   PUT /api/complaints/:id
// @access  Admin/Warden
exports.updateComplaint = async (req, res) => {
    try {
        const { status, assignedTo, remarks, priority } = req.body;
        const updates = {};

        if (status) {
            updates.status = status;
            if (status === 'resolved') updates.resolvedAt = new Date();
        }
        if (assignedTo) updates.assignedTo = assignedTo;
        if (remarks) updates.remarks = remarks;
        if (priority) updates.priority = priority;

        const complaint = await Complaint.findByIdAndUpdate(req.params.id, updates, {
            new: true, runValidators: true
        })
            .populate('student', 'name email studentId')
            .populate('assignedTo', 'name email');

        if (!complaint) {
            return res.status(404).json({ success: false, message: 'Complaint not found' });
        }

        res.status(200).json({ success: true, data: complaint });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Delete complaint
// @route   DELETE /api/complaints/:id
// @access  Admin
exports.deleteComplaint = async (req, res) => {
    try {
        const complaint = await Complaint.findByIdAndDelete(req.params.id);
        if (!complaint) {
            return res.status(404).json({ success: false, message: 'Complaint not found' });
        }
        res.status(200).json({ success: true, message: 'Complaint deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
