const Room = require('../models/Room');
const User = require('../models/User');

// @desc    Get all rooms
// @route   GET /api/rooms
// @access  Private
exports.getRooms = async (req, res) => {
    try {
        const { block, floor, status, type, search, page = 1, limit = 20 } = req.query;
        const query = {};

        if (block) query.block = block.toUpperCase();
        if (floor) query.floor = parseInt(floor);
        if (status) query.status = status;
        if (type) query.type = type;
        if (search) query.roomNumber = { $regex: search, $options: 'i' };

        const total = await Room.countDocuments(query);
        const rooms = await Room.find(query)
            .populate('occupants', 'name email studentId phone')
            .sort({ block: 1, floor: 1, roomNumber: 1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        res.status(200).json({
            success: true,
            data: rooms,
            pagination: { total, page: parseInt(page), pages: Math.ceil(total / limit) }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get single room
// @route   GET /api/rooms/:id
// @access  Private
exports.getRoom = async (req, res) => {
    try {
        const room = await Room.findById(req.params.id)
            .populate('occupants', 'name email studentId phone department year');

        if (!room) {
            return res.status(404).json({ success: false, message: 'Room not found' });
        }

        res.status(200).json({ success: true, data: room });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Create room
// @route   POST /api/rooms
// @access  Admin
exports.createRoom = async (req, res) => {
    try {
        const room = await Room.create(req.body);
        res.status(201).json({ success: true, data: room });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ success: false, message: 'Room number already exists' });
        }
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update room
// @route   PUT /api/rooms/:id
// @access  Admin/Warden
exports.updateRoom = async (req, res) => {
    try {
        const room = await Room.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        }).populate('occupants', 'name email studentId');

        if (!room) {
            return res.status(404).json({ success: false, message: 'Room not found' });
        }

        res.status(200).json({ success: true, data: room });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Delete room
// @route   DELETE /api/rooms/:id
// @access  Admin
exports.deleteRoom = async (req, res) => {
    try {
        const room = await Room.findById(req.params.id);
        if (!room) {
            return res.status(404).json({ success: false, message: 'Room not found' });
        }

        if (room.occupants.length > 0) {
            return res.status(400).json({ success: false, message: 'Cannot delete a room with occupants. Remove all occupants first.' });
        }

        await Room.findByIdAndDelete(req.params.id);
        res.status(200).json({ success: true, message: 'Room deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Allocate student to room
// @route   PUT /api/rooms/:id/allocate
// @access  Admin/Warden
exports.allocateStudent = async (req, res) => {
    try {
        const { studentId } = req.body;
        const room = await Room.findById(req.params.id);

        if (!room) {
            return res.status(404).json({ success: false, message: 'Room not found' });
        }

        if (room.occupants.length >= room.capacity) {
            return res.status(400).json({ success: false, message: 'Room is at full capacity' });
        }

        if (room.status === 'maintenance') {
            return res.status(400).json({ success: false, message: 'Room is under maintenance' });
        }

        const student = await User.findById(studentId);
        if (!student || student.role !== 'student') {
            return res.status(404).json({ success: false, message: 'Student not found' });
        }

        if (student.room) {
            return res.status(400).json({ success: false, message: 'Student is already allocated to a room. Deallocate first.' });
        }

        // Add student to room
        room.occupants.push(studentId);
        if (room.occupants.length >= room.capacity) {
            room.status = 'full';
        }
        await room.save();

        // Update student's room reference
        student.room = room._id;
        student.block = room.block;
        await student.save();

        const updatedRoom = await Room.findById(room._id).populate('occupants', 'name email studentId');
        res.status(200).json({ success: true, data: updatedRoom, message: 'Student allocated successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Deallocate student from room
// @route   PUT /api/rooms/:id/deallocate
// @access  Admin/Warden
exports.deallocateStudent = async (req, res) => {
    try {
        const { studentId } = req.body;
        const room = await Room.findById(req.params.id);

        if (!room) {
            return res.status(404).json({ success: false, message: 'Room not found' });
        }

        const studentIndex = room.occupants.indexOf(studentId);
        if (studentIndex === -1) {
            return res.status(400).json({ success: false, message: 'Student is not in this room' });
        }

        room.occupants.splice(studentIndex, 1);
        if (room.status === 'full') {
            room.status = 'available';
        }
        await room.save();

        // Update student's room reference
        await User.findByIdAndUpdate(studentId, { room: null, block: '' });

        const updatedRoom = await Room.findById(room._id).populate('occupants', 'name email studentId');
        res.status(200).json({ success: true, data: updatedRoom, message: 'Student deallocated successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
