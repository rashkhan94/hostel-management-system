const mongoose = require('mongoose');

const feeSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    amount: {
        type: Number,
        required: [true, 'Fee amount is required'],
        min: 0
    },
    month: {
        type: String,
        required: [true, 'Month is required'],
        enum: ['January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December']
    },
    year: {
        type: Number,
        required: [true, 'Year is required']
    },
    status: {
        type: String,
        enum: ['paid', 'unpaid', 'partial', 'overdue'],
        default: 'unpaid'
    },
    paidAmount: {
        type: Number,
        default: 0,
        min: 0
    },
    paidAt: {
        type: Date,
        default: null
    },
    paymentMethod: {
        type: String,
        enum: ['cash', 'online', 'bank-transfer', 'cheque', ''],
        default: ''
    },
    transactionId: {
        type: String,
        default: ''
    },
    dueDate: {
        type: Date,
        required: [true, 'Due date is required']
    },
    remarks: {
        type: String,
        default: ''
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Fee', feeSchema);
