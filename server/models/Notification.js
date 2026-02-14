const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Notification title is required'],
        trim: true,
        maxlength: 100
    },
    message: {
        type: String,
        required: [true, 'Message is required'],
        maxlength: 500
    },
    type: {
        type: String,
        enum: ['info', 'warning', 'alert', 'success'],
        default: 'info'
    },
    broadcast: {
        type: Boolean,
        default: false
    },
    targetRole: {
        type: String,
        enum: ['all', 'student', 'warden', 'admin'],
        default: 'all'
    },
    recipients: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    readBy: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Notification', notificationSchema);
