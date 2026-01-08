import { Request, Response } from 'express';
import Admin from '../models/Admin';
import { generateToken } from '../utils/jwt';
import { AuthRequest } from '../middleware/auth';

/**
 * Admin Login
 * POST /api/admin/auth/login
 */
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    console.log('[Login] Attempt:', { email, hasPassword: !!password });

    // Validation
    if (!email || !password) {
      console.log('[Login] Missing credentials');
      res.status(400).json({
        success: false,
        error: 'Email and password are required.'
      });
      return;
    }

    // Find admin by email
    const admin = await Admin.findOne({ email: email.toLowerCase() });

    if (!admin) {
      console.log('[Login] Admin not found:', email);
      res.status(401).json({
        success: false,
        error: 'Invalid credentials.'
      });
      return;
    }

    console.log('[Login] Admin found:', { email: admin.email, isActive: admin.isActive });

    // Check if admin is active
    if (!admin.isActive) {
      console.log('[Login] Account inactive');
      res.status(401).json({
        success: false,
        error: 'Account is inactive. Contact super admin.'
      });
      return;
    }

    // Verify password
    const isPasswordValid = await admin.comparePassword(password);

    console.log('[Login] Password valid:', isPasswordValid);

    if (!isPasswordValid) {
      console.log('[Login] Invalid password');
      res.status(401).json({
        success: false,
        error: 'Invalid credentials.'
      });
      return;
    }

    // Update last login
    admin.lastLogin = new Date();
    await admin.save();

    // Generate JWT token
    const token = generateToken(admin);

    console.log('[Login] Success:', admin.email);

    res.json({
      success: true,
      data: {
        token,
        admin: {
          id: admin._id,
          email: admin.email,
          name: admin.name,
          role: admin.role
        }
      },
      message: 'Login successful'
    });
  } catch (error) {
    console.error('[Admin Auth] Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Login failed. Please try again.'
    });
  }
};

/**
 * Get Current Admin Profile
 * GET /api/admin/auth/me
 */
export const getProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.admin) {
      res.status(401).json({
        success: false,
        error: 'Not authenticated.'
      });
      return;
    }

    const admin = await Admin.findById(req.admin.id).select('-password');

    if (!admin) {
      res.status(404).json({
        success: false,
        error: 'Admin not found.'
      });
      return;
    }

    res.json({
      success: true,
      data: admin
    });
  } catch (error) {
    console.error('[Admin Auth] Get profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch profile.'
    });
  }
};

/**
 * Change Password
 * POST /api/admin/auth/change-password
 */
export const changePassword = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.admin) {
      res.status(401).json({
        success: false,
        error: 'Not authenticated.'
      });
      return;
    }

    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      res.status(400).json({
        success: false,
        error: 'Current password and new password are required.'
      });
      return;
    }

    if (newPassword.length < 6) {
      res.status(400).json({
        success: false,
        error: 'New password must be at least 6 characters.'
      });
      return;
    }

    const admin = await Admin.findById(req.admin.id);

    if (!admin) {
      res.status(404).json({
        success: false,
        error: 'Admin not found.'
      });
      return;
    }

    // Verify current password
    const isPasswordValid = await admin.comparePassword(currentPassword);

    if (!isPasswordValid) {
      res.status(401).json({
        success: false,
        error: 'Current password is incorrect.'
      });
      return;
    }

    // Update password (will be hashed by pre-save hook)
    admin.password = newPassword;
    await admin.save();

    res.json({
      success: true,
      message: 'Password changed successfully.'
    });
  } catch (error) {
    console.error('[Admin Auth] Change password error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to change password.'
    });
  }
};

/**
 * Logout (Client-side token deletion, server just confirms)
 * POST /api/admin/auth/logout
 */
export const logout = async (_req: AuthRequest, res: Response): Promise<void> => {
  res.json({
    success: true,
    message: 'Logged out successfully.'
  });
};
