import { PrismaClient } from '@prisma/client';
import { AppError } from '../middleware/errorHandler';

const prisma = new PrismaClient();

interface PaginationParams {
  page?: number;
  limit?: number;
}

interface SearchParams {
  email?: string;
  username?: string;
  role?: string;
  isActive?: boolean;
}

interface AdminActionLog {
  adminId: string;
  action: string;
  targetUserId: string;
  timestamp: Date;
}

// In-memory log for admin actions (in production, this should be in database)
const adminActionLogs: AdminActionLog[] = [];

export const getUserList = async (params: PaginationParams) => {
  const page = params.page || 1;
  const limit = params.limit || 20;
  const skip = (page - 1) * limit;

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      skip,
      take: limit,
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        lastLoginAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    }),
    prisma.user.count(),
  ]);

  return {
    users,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getUserDetail = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      username: true,
      role: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
      lastLoginAt: true,
      profile: {
        select: {
          id: true,
          displayName: true,
          bio: true,
          avatarUrl: true,
          isPublished: true,
          viewCount: true,
          createdAt: true,
          updatedAt: true,
        },
      },
    },
  });

  if (!user) {
    throw new AppError(404, 'USER_NOT_FOUND', 'User not found');
  }

  return user;
};

export const searchUsers = async (searchParams: SearchParams, paginationParams: PaginationParams) => {
  const page = paginationParams.page || 1;
  const limit = paginationParams.limit || 20;
  const skip = (page - 1) * limit;

  const where: any = {};

  if (searchParams.email) {
    where.email = {
      contains: searchParams.email,
      mode: 'insensitive',
    };
  }

  if (searchParams.username) {
    where.username = {
      contains: searchParams.username,
      mode: 'insensitive',
    };
  }

  if (searchParams.role) {
    where.role = searchParams.role;
  }

  if (searchParams.isActive !== undefined) {
    where.isActive = searchParams.isActive;
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take: limit,
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        lastLoginAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    }),
    prisma.user.count({ where }),
  ]);

  return {
    users,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const deactivateUser = async (userId: string, adminId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new AppError(404, 'USER_NOT_FOUND', 'User not found');
  }

  if (!user.isActive) {
    throw new AppError(400, 'USER_ALREADY_INACTIVE', 'User is already inactive');
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: { isActive: false },
    select: {
      id: true,
      email: true,
      username: true,
      role: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
      lastLoginAt: true,
    },
  });

  // Log admin action
  adminActionLogs.push({
    adminId,
    action: 'DEACTIVATE_USER',
    targetUserId: userId,
    timestamp: new Date(),
  });

  return updatedUser;
};

export const reactivateUser = async (userId: string, adminId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new AppError(404, 'USER_NOT_FOUND', 'User not found');
  }

  if (user.isActive) {
    throw new AppError(400, 'USER_ALREADY_ACTIVE', 'User is already active');
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: { isActive: true },
    select: {
      id: true,
      email: true,
      username: true,
      role: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
      lastLoginAt: true,
    },
  });

  // Log admin action
  adminActionLogs.push({
    adminId,
    action: 'REACTIVATE_USER',
    targetUserId: userId,
    timestamp: new Date(),
  });

  return updatedUser;
};

export const getAdminActionLogs = (userId?: string) => {
  if (userId) {
    return adminActionLogs.filter(log => log.targetUserId === userId);
  }
  return adminActionLogs;
};

export const updateUser = async (userId: string, adminId: string, updateData: {
  email?: string;
  username?: string;
  role?: 'USER' | 'ADMIN';
  isActive?: boolean;
}) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new AppError(404, 'USER_NOT_FOUND', 'User not found');
  }

  // Check if email is being changed and if it's already taken
  if (updateData.email && updateData.email !== user.email) {
    const existingEmail = await prisma.user.findUnique({
      where: { email: updateData.email },
    });
    if (existingEmail) {
      throw new AppError(409, 'EMAIL_EXISTS', 'Email is already in use');
    }
  }

  // Check if username is being changed and if it's already taken
  if (updateData.username && updateData.username !== user.username) {
    const existingUsername = await prisma.user.findUnique({
      where: { username: updateData.username },
    });
    if (existingUsername) {
      throw new AppError(409, 'USERNAME_EXISTS', 'Username is already taken');
    }
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: updateData,
    select: {
      id: true,
      email: true,
      username: true,
      role: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
      lastLoginAt: true,
    },
  });

  // Log admin action
  adminActionLogs.push({
    adminId,
    action: 'UPDATE_USER',
    targetUserId: userId,
    timestamp: new Date(),
  });

  return updatedUser;
};

export const deleteUser = async (userId: string, adminId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new AppError(404, 'USER_NOT_FOUND', 'User not found');
  }

  // Prevent admin from deleting themselves
  if (userId === adminId) {
    throw new AppError(400, 'CANNOT_DELETE_SELF', 'You cannot delete your own account');
  }

  // Delete user (cascade will handle related records)
  await prisma.user.delete({
    where: { id: userId },
  });

  // Log admin action
  adminActionLogs.push({
    adminId,
    action: 'DELETE_USER',
    targetUserId: userId,
    timestamp: new Date(),
  });

  return { success: true, message: 'User deleted successfully' };
};

export const createUser = async (adminId: string, userData: {
  email: string;
  username: string;
  password: string;
  role?: 'USER' | 'ADMIN';
  isActive?: boolean;
}) => {
  const { email, username, password, role = 'USER', isActive = true } = userData;

  // Check if email already exists
  const existingEmail = await prisma.user.findUnique({
    where: { email },
  });
  if (existingEmail) {
    throw new AppError(409, 'EMAIL_EXISTS', 'Email is already in use');
  }

  // Check if username already exists
  const existingUsername = await prisma.user.findUnique({
    where: { username },
  });
  if (existingUsername) {
    throw new AppError(409, 'USERNAME_EXISTS', 'Username is already taken');
  }

  // Hash password
  const bcrypt = require('bcrypt');
  const passwordHash = await bcrypt.hash(password, 10);

  // Create user with profile
  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      username,
      role,
      isActive,
      profile: {
        create: {
          displayName: username,
          theme: {
            create: {},
          },
        },
      },
    },
    select: {
      id: true,
      email: true,
      username: true,
      role: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
      lastLoginAt: true,
    },
  });

  // Log admin action
  adminActionLogs.push({
    adminId,
    action: 'CREATE_USER',
    targetUserId: user.id,
    timestamp: new Date(),
  });

  return user;
};

export const updateUserPassword = async (userId: string, adminId: string, newPassword: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new AppError(404, 'USER_NOT_FOUND', 'User not found');
  }

  // Hash new password
  const bcrypt = require('bcrypt');
  const passwordHash = await bcrypt.hash(newPassword, 10);

  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash },
  });

  // Log admin action
  adminActionLogs.push({
    adminId,
    action: 'RESET_PASSWORD',
    targetUserId: userId,
    timestamp: new Date(),
  });

  return { success: true, message: 'Password updated successfully' };
};
