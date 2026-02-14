const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
    getFees, createFee, updateFee, deleteFee, bulkCreateFees
} = require('../controllers/feeController');

router.get('/', protect, getFees);
router.post('/', protect, authorize('admin'), createFee);
router.post('/bulk', protect, authorize('admin'), bulkCreateFees);
router.put('/:id', protect, authorize('admin'), updateFee);
router.delete('/:id', protect, authorize('admin'), deleteFee);

module.exports = router;
