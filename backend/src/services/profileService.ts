import { PrismaClient } from '@prisma/client';
import { AppError } from '../middleware/errorHandler';
import { deleteFile, getFilePath, getFileUrl } from '../utils/fileStorage';

const prisma = new PrismaClient();

export interface UpdateProfileInput {
  displayName?: string;
  bio?: string;
}

export const updateProfile = async (userId: string, input: UpdateProfileInput) => {
  // Validate input
  if (input.displayName !== undefined && input.displayName.trim().length === 0) {
    throw new AppError(400, 'INVALID_DISPLAY_NAME', 'Display name cannot be empty');
  }

  if (input.displayName && input.displayName.length > 100) {
    throw new AppError(400, 'INVALID_DISPLAY_NAME', 'Display name cannot exceed 100 characters');
  }

  if (input.bio && input.bio.length > 500) {
    throw new AppError(400, 'INVALID_BIO', 'Bio cannot exceed 500 characters');
  }

  // Find user's profile
  const profile = await prisma.profile.findUnique({
    where: { userId }
  });

  if (!profile) {
    throw new AppError(404, 'PROFILE_NOT_FOUND', 'Profile not found');
  }

  // Update profile
  const updatedProfile = await prisma.profile.update({
    where: { userId },
    data: {
      ...(input.displayName !== undefined && { displayName: input.displayName }),
      ...(input.bio !== undefined && { bio: input.bio }),
      updatedAt: new Date()
    },
    include: {
      theme: true,
      user: {
        select: {
          username: true
        }
      }
    }
  });

  return updatedProfile;
};

export const getProfileByUsername = async (username: string) => {
  const user = await prisma.user.findUnique({
    where: { username },
    include: {
      profile: {
        include: {
          theme: true,
          links: {
            where: { isVisible: true },
            orderBy: { order: 'asc' }
          },
          contacts: {
            orderBy: { order: 'asc' }
          },
          files: {
            orderBy: { order: 'asc' }
          },
          popup: true
        }
      }
    }
  });

  if (!user || !user.profile) {
    throw new AppError(404, 'PROFILE_NOT_FOUND', 'Profile not found');
  }

  // Increment view count
  await prisma.profile.update({
    where: { id: user.profile.id },
    data: { viewCount: { increment: 1 } }
  });

  return {
    username: user.username,
    profile: user.profile
  };
};

export const updateCustomSlug = async (userId: string, customSlug: string) => {
  // Validate slug format (alphanumeric, hyphens, underscores)
  const slugRegex = /^[a-z0-9_-]{3,30}$/;
  if (!slugRegex.test(customSlug)) {
    throw new AppError(
      400,
      'INVALID_SLUG',
      'Slug must be 3-30 characters, lowercase alphanumeric with hyphens and underscores'
    );
  }

  // Check if slug is already taken
  const existingUser = await prisma.user.findUnique({
    where: { username: customSlug }
  });

  if (existingUser && existingUser.id !== userId) {
    throw new AppError(409, 'SLUG_TAKEN', 'This URL slug is already taken');
  }

  // Update username (which serves as the profile URL)
  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: { username: customSlug },
    include: {
      profile: true
    }
  });

  return updatedUser;
};

export const updateProfilePicture = async (userId: string, filename: string) => {
  // Find user's profile
  const profile = await prisma.profile.findUnique({
    where: { userId }
  });

  if (!profile) {
    throw new AppError(404, 'PROFILE_NOT_FOUND', 'Profile not found');
  }

  // Delete old avatar if exists
  if (profile.avatarUrl) {
    const oldFilename = profile.avatarUrl.split('/').pop();
    if (oldFilename) {
      const oldFilePath = getFilePath(oldFilename, 'avatars');
      await deleteFile(oldFilePath);
    }
  }

  // Generate file URL
  const avatarUrl = getFileUrl(filename, 'avatars');

  // Update profile with new avatar URL
  const updatedProfile = await prisma.profile.update({
    where: { userId },
    data: {
      avatarUrl,
      updatedAt: new Date()
    },
    include: {
      theme: true,
      user: {
        select: {
          username: true
        }
      }
    }
  });

  return updatedProfile;
};

export const updateBackgroundImage = async (userId: string, filename: string) => {
  // Find user's profile
  const profile = await prisma.profile.findUnique({
    where: { userId }
  });

  if (!profile) {
    throw new AppError(404, 'PROFILE_NOT_FOUND', 'Profile not found');
  }

  // Delete old background image if exists
  if (profile.backgroundImageUrl) {
    const oldFilename = profile.backgroundImageUrl.split('/').pop();
    if (oldFilename) {
      const oldFilePath = getFilePath(oldFilename, 'backgrounds');
      await deleteFile(oldFilePath);
    }
  }

  // Generate file URL
  const backgroundImageUrl = getFileUrl(filename, 'backgrounds');

  // Update profile with new background image URL
  const updatedProfile = await prisma.profile.update({
    where: { userId },
    data: {
      backgroundType: 'IMAGE',
      backgroundImageUrl,
      updatedAt: new Date()
    },
    include: {
      theme: true,
      user: {
        select: {
          username: true
        }
      }
    }
  });

  return updatedProfile;
};
