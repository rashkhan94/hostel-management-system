const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
    getRooms, getRoom, createRoom, updateRoom, deleteRoom,
    allocateStudent, deallocateStudent
} = require('../controllers/roomController');

router.get('/', protect, getRooms);
router.get('/:id', protect, getRoom);
router.post('/', protect, authorize('admin'), createRoom);
router.put('/:id', protect, authorize('admin', 'warden'), updateRoom);
router.delete('/:id', protect, authorize('admin'), deleteRoom);
router.put('/:id/allocate', protect, authorize('admin', 'warden'), allocateStudent);
router.put('/:id/deallocate', protect, authorize('admin', 'warden'), deallocateStudent);

module.exports = router;
