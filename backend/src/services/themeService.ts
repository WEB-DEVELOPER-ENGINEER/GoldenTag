import { PrismaClient } from '@prisma/client';
import { AppError } from '../middleware/errorHandler';
import { 
  isValidHexColor, 
  isValidBackgroundColor,
  isValidFontFamily, 
  isValidLayout, 
  isValidButtonStyle,
  isValidThemeMode 
} from '../utils/validation';

const prisma = new PrismaClient();

export interface UpdateThemeInput {
  mode?: string;
  primaryColor?: string;
  secondaryColor?: string;
  textColor?: string;
  fontFamily?: string;
  layout?: string;
  buttonStyle?: string;
}

export const updateTheme = async (userId: string, input: UpdateThemeInput) => {
  // Find user's profile
  const profile = await prisma.profile.findUnique({
    where: { userId },
    include: { theme: true }
  });

  if (!profile) {
    throw new AppError(404, 'PROFILE_NOT_FOUND', 'Profile not found');
  }

  // Validate color formats
  if (input.primaryColor && !isValidHexColor(input.primaryColor)) {
    throw new AppError(400, 'INVALID_COLOR', 'Primary color must be a valid hex color');
  }

  if (input.secondaryColor && !isValidHexColor(input.secondaryColor)) {
    throw new AppError(400, 'INVALID_COLOR', 'Secondary color must be a valid hex color');
  }

  if (input.textColor && !isValidHexColor(input.textColor)) {
    throw new AppError(400, 'INVALID_COLOR', 'Text color must be a valid hex color');
  }

  // Validate font family
  if (input.fontFamily && !isValidFontFamily(input.fontFamily)) {
    throw new AppError(400, 'INVALID_FONT', 'Invalid font family');
  }

  // Validate layout
  if (input.layout && !isValidLayout(input.layout)) {
    throw new AppError(400, 'INVALID_LAYOUT', 'Invalid layout option');
  }

  // Validate button style
  if (input.buttonStyle && !isValidButtonStyle(input.buttonStyle)) {
    throw new AppError(400, 'INVALID_BUTTON_STYLE', 'Invalid button style');
  }

  // Validate theme mode
  if (input.mode && !isValidThemeMode(input.mode)) {
    throw new AppError(400, 'INVALID_MODE', 'Invalid theme mode');
  }

  // Update or create theme
  let updatedTheme;
  if (profile.theme) {
    updatedTheme = await prisma.theme.update({
      where: { profileId: profile.id },
      data: {
        ...(input.mode && { mode: input.mode as any }),
        ...(input.primaryColor && { primaryColor: input.primaryColor }),
        ...(input.secondaryColor && { secondaryColor: input.secondaryColor }),
        ...(input.textColor && { textColor: input.textColor }),
        ...(input.fontFamily && { fontFamily: input.fontFamily }),
        ...(input.layout && { layout: input.layout as any }),
        ...(input.buttonStyle && { buttonStyle: input.buttonStyle as any }),
        updatedAt: new Date()
      }
    });
  } else {
    updatedTheme = await prisma.theme.create({
      data: {
        profileId: profile.id,
        ...(input.mode && { mode: input.mode as any }),
        ...(input.primaryColor && { primaryColor: input.primaryColor }),
        ...(input.secondaryColor && { secondaryColor: input.secondaryColor }),
        ...(input.textColor && { textColor: input.textColor }),
        ...(input.fontFamily && { fontFamily: input.fontFamily }),
        ...(input.layout && { layout: input.layout as any }),
        ...(input.buttonStyle && { buttonStyle: input.buttonStyle as any })
      }
    });
  }

  return updatedTheme;
};

export const toggleThemeMode = async (userId: string) => {
  // Find user's profile
  const profile = await prisma.profile.findUnique({
    where: { userId },
    include: { theme: true }
  });

  if (!profile) {
    throw new AppError(404, 'PROFILE_NOT_FOUND', 'Profile not found');
  }

  // Default colors for light and dark modes
  const lightModeDefaults = {
    primaryColor: '#3b82f6',
    secondaryColor: '#8b5cf6',
    textColor: '#1f2937'
  };

  const darkModeDefaults = {
    primaryColor: '#60a5fa',
    secondaryColor: '#a78bfa',
    textColor: '#f9fafb'
  };

  let updatedTheme;
  if (profile.theme) {
    const newMode = profile.theme.mode === 'LIGHT' ? 'DARK' : 'LIGHT';
    const defaults = newMode === 'DARK' ? darkModeDefaults : lightModeDefaults;

    updatedTheme = await prisma.theme.update({
      where: { profileId: profile.id },
      data: {
        mode: newMode,
        primaryColor: defaults.primaryColor,
        secondaryColor: defaults.secondaryColor,
        textColor: defaults.textColor,
        updatedAt: new Date()
      }
    });
  } else {
    // Create theme with dark mode
    updatedTheme = await prisma.theme.create({
      data: {
        profileId: profile.id,
        mode: 'DARK',
        ...darkModeDefaults
      }
    });
  }

  return updatedTheme;
};

export const updateBackgroundSettings = async (
  userId: string, 
  backgroundType: 'COLOR' | 'IMAGE',
  backgroundColor?: string,
  backgroundImageUrl?: string
) => {
  // Find user's profile
  const profile = await prisma.profile.findUnique({
    where: { userId }
  });

  if (!profile) {
    throw new AppError(404, 'PROFILE_NOT_FOUND', 'Profile not found');
  }

  // Validate color if provided
  if (backgroundType === 'COLOR' && backgroundColor && !isValidBackgroundColor(backgroundColor)) {
    throw new AppError(400, 'INVALID_COLOR', 'Background color must be a valid hex color or CSS gradient');
  }

  // Update profile background settings
  const updatedProfile = await prisma.profile.update({
    where: { userId },
    data: {
      backgroundType,
      ...(backgroundType === 'COLOR' && backgroundColor && { backgroundColor }),
      ...(backgroundType === 'IMAGE' && backgroundImageUrl && { backgroundImageUrl }),
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
