const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
    getComplaints, createComplaint, updateComplaint, deleteComplaint
} = require('../controllers/complaintController');

router.get('/', protect, getComplaints);
router.post('/', protect, authorize('student'), createComplaint);
router.put('/:id', protect, authorize('admin', 'warden'), updateComplaint);
router.delete('/:id', protect, authorize('admin'), deleteComplaint);

module.exports = router;
