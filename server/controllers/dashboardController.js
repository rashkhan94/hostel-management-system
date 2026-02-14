const User = require('../models/User');
const Room = require('../models/Room');
const Complaint = require('../models/Complaint');
const Fee = require('../models/Fee');

// @desc    Get dashboard stats
// @route   GET /api/dashboard/stats
// @access  Admin/Warden
exports.getStats = async (req, res) => {
    try {
        const [
            totalStudents,
            totalWardens,
            totalRooms,
            availableRooms,
            fullRooms,
            maintenanceRooms,
            pendingComplaints,
            inProgressComplaints,
            resolvedComplaints,
            totalComplaints,
            unpaidFees,
            paidFees,
        ] = await Promise.all([
            User.countDocuments({ role: 'student', isActive: true }),
            User.countDocuments({ role: 'warden', isActive: true }),
            Room.countDocuments(),
            Room.countDocuments({ status: 'available' }),
            Room.countDocuments({ status: 'full' }),
            Room.countDocuments({ status: 'maintenance' }),
            Complaint.countDocuments({ status: 'pending' }),
            Complaint.countDocuments({ status: 'in-progress' }),
            Complaint.countDocuments({ status: 'resolved' }),
            Complaint.countDocuments(),
            Fee.countDocuments({ status: { $in: ['unpaid', 'overdue'] } }),
            Fee.countDocuments({ status: 'paid' }),
        ]);

        // Calculate total revenue
        const revenueResult = await Fee.aggregate([
            { $match: { status: 'paid' } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);
        const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

        // Calculate pending revenue
        const pendingRevenueResult = await Fee.aggregate([
            { $match: { status: { $in: ['unpaid', 'overdue', 'partial'] } } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);
        const pendingRevenue = pendingRevenueResult.length > 0 ? pendingRevenueResult[0].total : 0;

        // Occupancy rate
        const allRooms = await Room.find();
        const totalCapacity = allRooms.reduce((acc, r) => acc + r.capacity, 0);
        const totalOccupied = allRooms.reduce((acc, r) => acc + r.occupants.length, 0);
        const occupancyRate = totalCapacity > 0 ? Math.round((totalOccupied / totalCapacity) * 100) : 0;

        // Recent complaints
        const recentComplaints = await Complaint.find()
            .populate('student', 'name studentId')
            .sort({ createdAt: -1 })
            .limit(5);

        // Fee collection by month (last 6 months)
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const monthlyRevenue = await Fee.aggregate([
            { $match: { status: 'paid', paidAt: { $gte: sixMonthsAgo } } },
            { $group: { _id: { month: '$month', year: '$year' }, total: { $sum: '$amount' } } },
            { $sort: { '_id.year': 1 } }
        ]);

        // Complaints by category
        const complaintsByCategory = await Complaint.aggregate([
            { $group: { _id: '$category', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);

        res.status(200).json({
            success: true,
            data: {
                students: totalStudents,
                wardens: totalWardens,
                rooms: { total: totalRooms, available: availableRooms, full: fullRooms, maintenance: maintenanceRooms },
                complaints: { total: totalComplaints, pending: pendingComplaints, inProgress: inProgressComplaints, resolved: resolvedComplaints },
                fees: { paid: paidFees, unpaid: unpaidFees },
                revenue: { total: totalRevenue, pending: pendingRevenue },
                occupancyRate,
                recentComplaints,
                monthlyRevenue,
                complaintsByCategory
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
