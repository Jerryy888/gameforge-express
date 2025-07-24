import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { validateLogin, validateRegister } from '@/middleware/validation';
import { authenticateToken, AuthRequest } from '@/middleware/auth';
import { asyncHandler, createError } from '@/middleware/errorHandler';

const router = Router();
const prisma = new PrismaClient();

// Login
router.post('/login', validateLogin, asyncHandler(async (req, res) => {
  const { username, password } = req.body;

  // Find admin by username or email
  const admin = await prisma.admin.findFirst({
    where: {
      OR: [
        { username },
        { email: username }
      ],
      isActive: true
    }
  });

  if (!admin) {
    throw createError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
  }

  // Check password
  const isValidPassword = await bcrypt.compare(password, admin.password);
  if (!isValidPassword) {
    throw createError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
  }

  // Update last login
  await prisma.admin.update({
    where: { id: admin.id },
    data: { lastLogin: new Date() }
  });

  // Create JWT token
  const token = jwt.sign(
    { 
      id: admin.id,
      username: admin.username,
      role: admin.role
    },
    process.env.JWT_SECRET!,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );

  res.json({
    token,
    admin: {
      id: admin.id,
      username: admin.username,
      email: admin.email,
      role: admin.role
    }
  });
}));

// Register (for development/setup)
router.post('/register', validateRegister, asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;

  // Check if first admin (auto super admin)
  const adminCount = await prisma.admin.count();
  const role = adminCount === 0 ? 'SUPER_ADMIN' : 'ADMIN';

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 12);

  // Create admin
  const admin = await prisma.admin.create({
    data: {
      username,
      email,
      password: hashedPassword,
      role: role as any
    },
    select: {
      id: true,
      username: true,
      email: true,
      role: true,
      createdAt: true
    }
  });

  res.status(201).json({
    message: 'Admin created successfully',
    admin
  });
}));

// Verify token
router.get('/verify', authenticateToken, asyncHandler(async (req: AuthRequest, res) => {
  res.json({
    valid: true,
    admin: req.admin
  });
}));

// Logout (client-side token removal)
router.post('/logout', authenticateToken, asyncHandler(async (req: AuthRequest, res) => {
  res.json({
    message: 'Logged out successfully'
  });
}));

// Get current admin profile
router.get('/profile', authenticateToken, asyncHandler(async (req: AuthRequest, res) => {
  const admin = await prisma.admin.findUnique({
    where: { id: req.admin!.id },
    select: {
      id: true,
      username: true,
      email: true,
      role: true,
      lastLogin: true,
      createdAt: true
    }
  });

  if (!admin) {
    throw createError('Admin not found', 404, 'ADMIN_NOT_FOUND');
  }

  res.json(admin);
}));

// Update profile
router.put('/profile', authenticateToken, asyncHandler(async (req: AuthRequest, res) => {
  const { email, currentPassword, newPassword } = req.body;

  const admin = await prisma.admin.findUnique({
    where: { id: req.admin!.id }
  });

  if (!admin) {
    throw createError('Admin not found', 404, 'ADMIN_NOT_FOUND');
  }

  const updateData: any = {};

  // Update email if provided
  if (email && email !== admin.email) {
    updateData.email = email;
  }

  // Update password if provided
  if (newPassword && currentPassword) {
    const isValidPassword = await bcrypt.compare(currentPassword, admin.password);
    if (!isValidPassword) {
      throw createError('Current password is incorrect', 400, 'INVALID_PASSWORD');
    }

    updateData.password = await bcrypt.hash(newPassword, 12);
  }

  if (Object.keys(updateData).length === 0) {
    return res.json({
      message: 'No changes made',
      admin: {
        id: admin.id,
        username: admin.username,
        email: admin.email,
        role: admin.role
      }
    });
  }

  const updatedAdmin = await prisma.admin.update({
    where: { id: admin.id },
    data: updateData,
    select: {
      id: true,
      username: true,
      email: true,
      role: true
    }
  });

  res.json({
    message: 'Profile updated successfully',
    admin: updatedAdmin
  });
}));

export default router;