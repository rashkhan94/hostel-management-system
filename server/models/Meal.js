const mongoose = require('mongoose');

const mealSchema = new mongoose.Schema({
    day: {
        type: String,
        required: true,
        enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    },
    breakfast: {
        type: String,
        default: 'Not set'
    },
    lunch: {
        type: String,
        default: 'Not set'
    },
    dinner: {
        type: String,
        default: 'Not set'
    },
    snacks: {
        type: String,
        default: 'Not set'
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    weekLabel: {
        type: String,
        default: 'Current Week'
    }
}, {
    timestamps: true
});

// Ensure unique day per week label
mealSchema.index({ day: 1, weekLabel: 1 }, { unique: true });

module.exports = mongoose.model('Meal', mealSchema);
