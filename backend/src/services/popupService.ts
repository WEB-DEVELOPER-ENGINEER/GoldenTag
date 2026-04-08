import { PrismaClient } from '@prisma/client';
import { AppError } from '../middleware/errorHandler';

const prisma = new PrismaClient();

export interface UpdatePopupInput {
  isEnabled?: boolean;
  message?: string;
  duration?: number | null;
  backgroundColor?: string;
  textColor?: string;
}

export const updatePopupSettings = async (userId: string, input: UpdatePopupInput) => {
  // Validate message if provided
  if (input.message !== undefined) {
    if (input.message.trim().length === 0) {
      throw new AppError(400, 'INVALID_MESSAGE', 'Popup message cannot be empty');
    }
    if (input.message.length > 500) {
      throw new AppError(400, 'INVALID_MESSAGE', 'Popup message cannot exceed 500 characters');
    }
  }

  // Validate duration if provided
  if (input.duration !== undefined && input.duration !== null) {
    if (input.duration < 0) {
      throw new AppError(400, 'INVALID_DURATION', 'Duration cannot be negative');
    }
    if (input.duration > 60000) {
      throw new AppError(400, 'INVALID_DURATION', 'Duration cannot exceed 60 seconds (60000ms)');
    }
  }

  // Validate color formats if provided
  const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
  
  if (input.backgroundColor !== undefined && !hexColorRegex.test(input.backgroundColor)) {
    throw new AppError(400, 'INVALID_COLOR', 'Background color must be a valid hex color');
  }

  if (input.textColor !== undefined && !hexColorRegex.test(input.textColor)) {
    throw new AppError(400, 'INVALID_COLOR', 'Text color must be a valid hex color');
  }

  // Find user's profile
  const profile = await prisma.profile.findUnique({
    where: { userId },
    include: {
      popup: true
    }
  });

  if (!profile) {
    throw new AppError(404, 'PROFILE_NOT_FOUND', 'Profile not found');
  }

  // Update or create popup
  let popup;
  if (profile.popup) {
    // Update existing popup
    popup = await prisma.popup.update({
      where: { profileId: profile.id },
      data: {
        ...(input.isEnabled !== undefined && { isEnabled: input.isEnabled }),
        ...(input.message !== undefined && { message: input.message.trim() }),
        ...(input.duration !== undefined && { duration: input.duration }),
        ...(input.backgroundColor !== undefined && { backgroundColor: input.backgroundColor }),
        ...(input.textColor !== undefined && { textColor: input.textColor }),
        updatedAt: new Date()
      }
    });
  } else {
    // Create new popup with defaults
    popup = await prisma.popup.create({
      data: {
        profileId: profile.id,
        isEnabled: input.isEnabled ?? false,
        message: input.message?.trim() ?? '',
        duration: input.duration ?? null,
        backgroundColor: input.backgroundColor ?? '#3b82f6',
        textColor: input.textColor ?? '#ffffff'
      }
    });
  }

  return popup;
};

export const togglePopup = async (userId: string, isEnabled: boolean) => {
  // Find user's profile
  const profile = await prisma.profile.findUnique({
    where: { userId },
    include: {
      popup: true
    }
  });

  if (!profile) {
    throw new AppError(404, 'PROFILE_NOT_FOUND', 'Profile not found');
  }

  if (!profile.popup) {
    throw new AppError(404, 'POPUP_NOT_FOUND', 'Popup not configured. Please create popup settings first.');
  }

  // Update popup enabled status
  const popup = await prisma.popup.update({
    where: { profileId: profile.id },
    data: {
      isEnabled,
      updatedAt: new Date()
    }
  });

  return popup;
};

export const getPopupSettings = async (userId: string) => {
  // Find user's profile
  const profile = await prisma.profile.findUnique({
    where: { userId },
    include: {
      popup: true
    }
  });

  if (!profile) {
    throw new AppError(404, 'PROFILE_NOT_FOUND', 'Profile not found');
  }

  return profile.popup;
};
