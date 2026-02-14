const Meal = require('../models/Meal');

// @desc    Get meal schedule
// @route   GET /api/meals
// @access  Private
exports.getMeals = async (req, res) => {
    try {
        const { weekLabel } = req.query;
        const query = weekLabel ? { weekLabel } : { weekLabel: 'Current Week' };

        const meals = await Meal.find(query)
            .populate('createdBy', 'name')
            .sort({
                day: 1
            });

        // Sort days properly
        const dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        meals.sort((a, b) => dayOrder.indexOf(a.day) - dayOrder.indexOf(b.day));

        res.status(200).json({ success: true, data: meals });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Create or update meal schedule
// @route   POST /api/meals
// @access  Admin/Warden
exports.upsertMeal = async (req, res) => {
    try {
        const { day, breakfast, lunch, dinner, snacks, weekLabel = 'Current Week' } = req.body;

        const meal = await Meal.findOneAndUpdate(
            { day, weekLabel },
            { day, breakfast, lunch, dinner, snacks, weekLabel, createdBy: req.user._id },
            { new: true, upsert: true, runValidators: true }
        );

        res.status(200).json({ success: true, data: meal });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Bulk update meal schedule (all 7 days)
// @route   POST /api/meals/bulk
// @access  Admin/Warden
exports.bulkUpsertMeals = async (req, res) => {
    try {
        const { meals, weekLabel = 'Current Week' } = req.body;

        const results = await Promise.all(
            meals.map(meal =>
                Meal.findOneAndUpdate(
                    { day: meal.day, weekLabel },
                    { ...meal, weekLabel, createdBy: req.user._id },
                    { new: true, upsert: true, runValidators: true }
                )
            )
        );

        res.status(200).json({ success: true, data: results });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Delete meal
// @route   DELETE /api/meals/:id
// @access  Admin
exports.deleteMeal = async (req, res) => {
    try {
        await Meal.findByIdAndDelete(req.params.id);
        res.status(200).json({ success: true, message: 'Meal schedule deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
