const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
    roomNumber: {
        type: String,
        required: [true, 'Room number is required'],
        unique: true,
        trim: true
    },
    floor: {
        type: Number,
        required: [true, 'Floor number is required'],
        min: 0,
        max: 20
    },
    block: {
        type: String,
        required: [true, 'Block name is required'],
        trim: true,
        uppercase: true
    },
    type: {
        type: String,
        enum: ['single', 'double', 'triple', 'quad'],
        default: 'double'
    },
    capacity: {
        type: Number,
        required: true,
        min: 1,
        max: 6
    },
    occupants: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    status: {
        type: String,
        enum: ['available', 'full', 'maintenance', 'reserved'],
        default: 'available'
    },
    amenities: [{
        type: String,
        trim: true
    }],
    pricePerMonth: {
        type: Number,
        required: [true, 'Price per month is required'],
        min: 0
    },
    description: {
        type: String,
        default: ''
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual for current occupancy count
roomSchema.virtual('currentOccupants').get(function () {
    return this.occupants ? this.occupants.length : 0;
});

// Virtual for availability
roomSchema.virtual('isAvailable').get(function () {
    return this.status === 'available' && this.occupants.length < this.capacity;
});

module.exports = mongoose.model('Room', roomSchema);
