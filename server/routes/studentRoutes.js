const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const User = require('../models/User');

// @desc    Get all students
// @route   GET /api/students
// @access  Admin/Warden
router.get('/', protect, authorize('admin', 'warden'), async (req, res) => {
    try {
        const { search, block, page = 1, limit = 20 } = req.query;
        const query = { role: 'student' };

        if (block) query.block = block;
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { studentId: { $regex: search, $options: 'i' } }
            ];
        }

        const total = await User.countDocuments(query);
        const students = await User.find(query)
            .populate('room', 'roomNumber block floor type')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        res.status(200).json({
            success: true,
            data: students,
            pagination: { total, page: parseInt(page), pages: Math.ceil(total / limit) }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// @desc    Get single student
// @route   GET /api/students/:id
// @access  Admin/Warden
router.get('/:id', protect, authorize('admin', 'warden'), async (req, res) => {
    try {
        const student = await User.findById(req.params.id).populate('room');
        if (!student || student.role !== 'student') {
            return res.status(404).json({ success: false, message: 'Student not found' });
        }
        res.status(200).json({ success: true, data: student });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// @desc    Update student
// @route   PUT /api/students/:id
// @access  Admin
router.put('/:id', protect, authorize('admin'), async (req, res) => {
    try {
        const student = await User.findByIdAndUpdate(req.params.id, req.body, {
            new: true, runValidators: true
        }).populate('room');

        if (!student) {
            return res.status(404).json({ success: false, message: 'Student not found' });
        }
        res.status(200).json({ success: true, data: student });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
