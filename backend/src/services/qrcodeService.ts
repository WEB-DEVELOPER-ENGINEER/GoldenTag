import QRCode from 'qrcode';
import { PrismaClient } from '@prisma/client';
import { AppError } from '../middleware/errorHandler';

const prisma = new PrismaClient();

/**
 * Generate QR code for a user's profile URL
 * 
 * Note: QR codes are generated on-demand and always reflect the current username.
 * This ensures that when a user changes their profile URL (via updateCustomSlug),
 * the next QR code request will automatically use the new URL.
 * This satisfies Requirement 15.4: QR code regeneration on URL change.
 * 
 * @param userId - The user ID
 * @returns QR code as data URL (base64 encoded PNG)
 */
export const generateQRCode = async (userId: string): Promise<string> => {
  // Get user's profile
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      profile: true
    }
  });

  if (!user || !user.profile) {
    throw new AppError(404, 'PROFILE_NOT_FOUND', 'Profile not found');
  }

  // Construct profile URL
  const baseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const profileUrl = `${baseUrl}/${user.username}`;

  try {
    // Generate QR code as data URL
    const qrCodeDataUrl = await QRCode.toDataURL(profileUrl, {
      errorCorrectionLevel: 'M',
      type: 'image/png',
      width: 512,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });

    return qrCodeDataUrl;
  } catch (error) {
    throw new AppError(500, 'QR_GENERATION_FAILED', 'Failed to generate QR code');
  }
};

/**
 * Generate QR code as buffer for download
 * @param userId - The user ID
 * @returns QR code as PNG buffer
 */
export const generateQRCodeBuffer = async (userId: string): Promise<Buffer> => {
  // Get user's profile
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      profile: true
    }
  });

  if (!user || !user.profile) {
    throw new AppError(404, 'PROFILE_NOT_FOUND', 'Profile not found');
  }

  // Construct profile URL
  const baseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const profileUrl = `${baseUrl}/${user.username}`;

  try {
    // Generate QR code as buffer
    const qrCodeBuffer = await QRCode.toBuffer(profileUrl, {
      errorCorrectionLevel: 'M',
      type: 'png',
      width: 512,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });

    return qrCodeBuffer;
  } catch (error) {
    throw new AppError(500, 'QR_GENERATION_FAILED', 'Failed to generate QR code');
  }
};
