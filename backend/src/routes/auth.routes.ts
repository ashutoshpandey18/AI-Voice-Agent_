import express from 'express';
import { login, getProfile, changePassword, logout } from '../controllers/authController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

/**
 * Auth Routes
 * Base: /api/admin/auth
 */

// Public routes
router.post('/login', login);

// Protected routes (require authentication)
router.get('/me', authenticate, getProfile);
router.post('/change-password', authenticate, changePassword);
router.post('/logout', authenticate, logout);

export default router;
