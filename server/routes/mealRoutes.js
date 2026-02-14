const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
    getMeals, upsertMeal, bulkUpsertMeals, deleteMeal
} = require('../controllers/mealController');

router.get('/', protect, getMeals);
router.post('/', protect, authorize('admin', 'warden'), upsertMeal);
router.post('/bulk', protect, authorize('admin', 'warden'), bulkUpsertMeals);
router.delete('/:id', protect, authorize('admin'), deleteMeal);

module.exports = router;
