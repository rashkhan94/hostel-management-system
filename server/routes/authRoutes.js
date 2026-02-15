const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
    register, registerStudent, login, getMe, updateProfile, changePassword,
    getAllUsers, deleteUser, toggleUserStatus
} = require('../controllers/authController');

router.post('/register', protect, authorize('admin'), register);
router.post('/register-student', registerStudent);
router.post('/login', login);
router.get('/me', protect, getMe);
router.put('/update-profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);
router.get('/users', protect, authorize('admin', 'warden'), getAllUsers);
router.delete('/users/:id', protect, authorize('admin'), deleteUser);
router.put('/users/:id/toggle-status', protect, authorize('admin'), toggleUserStatus);

module.exports = router;
