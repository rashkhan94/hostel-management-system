const Fee = require('../models/Fee');

// @desc    Get all fees
// @route   GET /api/fees
// @access  Private
exports.getFees = async (req, res) => {
    try {
        const { status, month, year, page = 1, limit = 20 } = req.query;
        const query = {};

        // Students can only see their own fees
        if (req.user.role === 'student') {
            query.student = req.user._id;
        }

        if (status) query.status = status;
        if (month) query.month = month;
        if (year) query.year = parseInt(year);

        const total = await Fee.countDocuments(query);
        const fees = await Fee.find(query)
            .populate('student', 'name email studentId room')
            .sort({ year: -1, createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        res.status(200).json({
            success: true,
            data: fees,
            pagination: { total, page: parseInt(page), pages: Math.ceil(total / limit) }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Create fee entry
// @route   POST /api/fees
// @access  Admin
exports.createFee = async (req, res) => {
    try {
        const fee = await Fee.create(req.body);
        const populated = await Fee.findById(fee._id).populate('student', 'name email studentId');
        res.status(201).json({ success: true, data: populated });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update fee (mark as paid, partial, etc.)
// @route   PUT /api/fees/:id
// @access  Admin
exports.updateFee = async (req, res) => {
    try {
        const fee = await Fee.findByIdAndUpdate(req.params.id, req.body, {
            new: true, runValidators: true
        }).populate('student', 'name email studentId');

        if (!fee) {
            return res.status(404).json({ success: false, message: 'Fee record not found' });
        }

        res.status(200).json({ success: true, data: fee });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Delete fee
// @route   DELETE /api/fees/:id
// @access  Admin
exports.deleteFee = async (req, res) => {
    try {
        const fee = await Fee.findByIdAndDelete(req.params.id);
        if (!fee) {
            return res.status(404).json({ success: false, message: 'Fee record not found' });
        }
        res.status(200).json({ success: true, message: 'Fee record deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Bulk create fees for all students
// @route   POST /api/fees/bulk
// @access  Admin
exports.bulkCreateFees = async (req, res) => {
    try {
        const { amount, month, year, dueDate } = req.body;
        const User = require('../models/User');
        const students = await User.find({ role: 'student', isActive: true });

        const feeDocs = students.map(student => ({
            student: student._id,
            amount,
            month,
            year,
            dueDate,
            status: 'unpaid'
        }));

        const fees = await Fee.insertMany(feeDocs);
        res.status(201).json({ success: true, data: fees, message: `Created ${fees.length} fee entries` });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
