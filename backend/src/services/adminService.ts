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
          backgroundType: true,
          backgroundColor: true,
          backgroundImageUrl: true,
          isPublished: true,
          viewCount: true,
          createdAt: true,
          updatedAt: true,
          theme: {
            select: {
              id: true,
              mode: true,
              primaryColor: true,
              secondaryColor: true,
              textColor: true,
              fontFamily: true,
              layout: true,
              buttonStyle: true,
            },
          },
          popup: {
            select: {
              id: true,
              isEnabled: true,
              message: true,
              duration: true,
              backgroundColor: true,
              textColor: true,
            },
          },
          links: {
            select: {
              id: true,
              type: true,
              platform: true,
              title: true,
              url: true,
              icon: true,
              order: true,
              isVisible: true,
            },
            orderBy: {
              order: 'asc',
            },
          },
          contacts: {
            select: {
              id: true,
              type: true,
              value: true,
              label: true,
              order: true,
            },
            orderBy: {
              order: 'asc',
            },
          },
          files: {
            select: {
              id: true,
              filename: true,
              originalName: true,
              title: true,
              fileUrl: true,
              fileSize: true,
              mimeType: true,
              order: true,
            },
            orderBy: {
              order: 'asc',
            },
          },
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
  profile?: {
    displayName?: string;
    bio?: string;
    avatarUrl?: string;
    avatarTempId?: string;
    backgroundType?: 'COLOR' | 'IMAGE';
    backgroundColor?: string;
    backgroundImageUrl?: string;
    backgroundTempId?: string;
    isPublished?: boolean;
  };
  theme?: {
    mode?: 'LIGHT' | 'DARK';
    primaryColor?: string;
    secondaryColor?: string;
    textColor?: string;
    fontFamily?: string;
    layout?: 'CENTERED' | 'LEFT' | 'RIGHT';
    buttonStyle?: 'ROUNDED' | 'SQUARE' | 'PILL';
  };
  popup?: {
    isEnabled?: boolean;
    message?: string;
    duration?: number;
    backgroundColor?: string;
    textColor?: string;
  };
}) => {
  const { email, username, password, role = 'USER', isActive = true, profile, theme, popup } = userData;

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

  // Prepare profile data
  const profileData: any = {
    displayName: profile?.displayName || username,
    bio: profile?.bio,
    avatarUrl: profile?.avatarUrl,
    backgroundType: profile?.backgroundType || 'COLOR',
    backgroundColor: profile?.backgroundColor,
    backgroundImageUrl: profile?.backgroundImageUrl,
    isPublished: profile?.isPublished || false,
  };

  // Prepare theme data
  const themeData: any = theme || {};

  // Create user with profile and theme
  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      username,
      role,
      isActive,
      profile: {
        create: {
          ...profileData,
          theme: {
            create: themeData,
          },
          ...(popup && {
            popup: {
              create: {
                isEnabled: popup.isEnabled || false,
                message: popup.message || '',
                duration: popup.duration,
                backgroundColor: popup.backgroundColor || '#3b82f6',
                textColor: popup.textColor || '#ffffff',
              },
            },
          }),
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

export const updateUserProfile = async (userId: string, adminId: string, profileData: {
  displayName?: string;
  bio?: string;
  avatarUrl?: string;
  backgroundType?: 'COLOR' | 'IMAGE';
  backgroundColor?: string;
  backgroundImageUrl?: string;
  isPublished?: boolean;
}) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { profile: true },
  });

  if (!user || !user.profile) {
    throw new AppError(404, 'PROFILE_NOT_FOUND', 'User profile not found');
  }

  const updatedProfile = await prisma.profile.update({
    where: { id: user.profile.id },
    data: profileData,
  });

  // Log admin action
  adminActionLogs.push({
    adminId,
    action: 'UPDATE_PROFILE',
    targetUserId: userId,
    timestamp: new Date(),
  });

  return updatedProfile;
};

export const updateUserTheme = async (userId: string, adminId: string, themeData: {
  mode?: 'LIGHT' | 'DARK';
  primaryColor?: string;
  secondaryColor?: string;
  textColor?: string;
  fontFamily?: string;
  layout?: 'CENTERED' | 'LEFT' | 'RIGHT';
  buttonStyle?: 'ROUNDED' | 'SQUARE' | 'PILL';
}) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { profile: { include: { theme: true } } },
  });

  if (!user || !user.profile || !user.profile.theme) {
    throw new AppError(404, 'THEME_NOT_FOUND', 'User theme not found');
  }

  const updatedTheme = await prisma.theme.update({
    where: { id: user.profile.theme.id },
    data: themeData,
  });

  // Log admin action
  adminActionLogs.push({
    adminId,
    action: 'UPDATE_THEME',
    targetUserId: userId,
    timestamp: new Date(),
  });

  return updatedTheme;
};

export const updateUserPopup = async (userId: string, adminId: string, popupData: {
  isEnabled?: boolean;
  message?: string;
  duration?: number;
  backgroundColor?: string;
  textColor?: string;
}) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { profile: { include: { popup: true } } },
  });

  if (!user || !user.profile) {
    throw new AppError(404, 'PROFILE_NOT_FOUND', 'User profile not found');
  }

  let updatedPopup;
  if (user.profile.popup) {
    updatedPopup = await prisma.popup.update({
      where: { id: user.profile.popup.id },
      data: popupData,
    });
  } else {
    updatedPopup = await prisma.popup.create({
      data: {
        profileId: user.profile.id,
        isEnabled: popupData.isEnabled ?? false,
        message: popupData.message ?? '',
        duration: popupData.duration,
        backgroundColor: popupData.backgroundColor ?? '#3b82f6',
        textColor: popupData.textColor ?? '#ffffff',
      },
    });
  }

  // Log admin action
  adminActionLogs.push({
    adminId,
    action: 'UPDATE_POPUP',
    targetUserId: userId,
    timestamp: new Date(),
  });

  return updatedPopup;
};
