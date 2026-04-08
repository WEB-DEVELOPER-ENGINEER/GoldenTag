import { PrismaClient } from '@prisma/client';
import { AppError } from '../middleware/errorHandler';

const prisma = new PrismaClient();

// Supported platforms
const SUPPORTED_PLATFORMS = [
  'linkedin',
  'youtube',
  'medium',
  'github',
  'substack',
  'twitter',
  'instagram',
  'tiktok'
] as const;

type SupportedPlatform = typeof SUPPORTED_PLATFORMS[number];

// Platform-specific URL validation patterns
const PLATFORM_PATTERNS: Record<SupportedPlatform, RegExp> = {
  linkedin: /^https?:\/\/(www\.)?linkedin\.com\/.+/i,
  youtube: /^https?:\/\/(www\.)?(youtube\.com|youtu\.be)\/.+/i,
  medium: /^https?:\/\/(www\.)?medium\.com\/.+/i,
  github: /^https?:\/\/(www\.)?github\.com\/.+/i,
  substack: /^https?:\/\/[a-zA-Z0-9-]+\.substack\.com.*/i,
  twitter: /^https?:\/\/(www\.)?(twitter\.com|x\.com)\/.+/i,
  instagram: /^https?:\/\/(www\.)?instagram\.com\/.+/i,
  tiktok: /^https?:\/\/(www\.)?tiktok\.com\/.+/i
};

// General URL validation
const isValidUrl = (url: string): boolean => {
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch {
    return false;
  }
};

// Validate platform-specific URL format
const validatePlatformUrl = (platform: string, url: string): boolean => {
  if (!SUPPORTED_PLATFORMS.includes(platform as SupportedPlatform)) {
    return false;
  }
  
  const pattern = PLATFORM_PATTERNS[platform as SupportedPlatform];
  return pattern.test(url);
};

export interface CreateLinkInput {
  type: 'PLATFORM' | 'CUSTOM';
  platform?: string;
  title: string;
  url: string;
  icon?: string;
}

export interface UpdateLinkInput {
  type?: 'PLATFORM' | 'CUSTOM';
  platform?: string;
  title?: string;
  url?: string;
  icon?: string;
  isVisible?: boolean;
}

export const createLink = async (userId: string, input: CreateLinkInput) => {
  // Validate required fields
  if (!input.title || input.title.trim().length === 0) {
    throw new AppError(400, 'INVALID_TITLE', 'Link title is required');
  }

  if (input.title.length > 100) {
    throw new AppError(400, 'INVALID_TITLE', 'Link title cannot exceed 100 characters');
  }

  if (!input.url || input.url.trim().length === 0) {
    throw new AppError(400, 'INVALID_URL', 'Link URL is required');
  }

  // Validate URL format
  if (!isValidUrl(input.url)) {
    throw new AppError(400, 'INVALID_URL', 'Invalid URL format');
  }

  // Validate link type
  if (input.type !== 'PLATFORM' && input.type !== 'CUSTOM') {
    throw new AppError(400, 'INVALID_TYPE', 'Link type must be PLATFORM or CUSTOM');
  }

  // Validate platform-specific requirements
  if (input.type === 'PLATFORM') {
    if (!input.platform) {
      throw new AppError(400, 'MISSING_PLATFORM', 'Platform is required for platform links');
    }

    if (!SUPPORTED_PLATFORMS.includes(input.platform as SupportedPlatform)) {
      throw new AppError(
        400,
        'UNSUPPORTED_PLATFORM',
        `Platform must be one of: ${SUPPORTED_PLATFORMS.join(', ')}`
      );
    }

    // Validate platform-specific URL format
    if (!validatePlatformUrl(input.platform, input.url)) {
      throw new AppError(
        400,
        'INVALID_PLATFORM_URL',
        `URL does not match expected format for ${input.platform}`
      );
    }
  }

  // Find user's profile
  const profile = await prisma.profile.findUnique({
    where: { userId },
    include: {
      links: {
        orderBy: { order: 'desc' },
        take: 1
      }
    }
  });

  if (!profile) {
    throw new AppError(404, 'PROFILE_NOT_FOUND', 'Profile not found');
  }

  // Calculate next order value
  const nextOrder = profile.links.length > 0 ? profile.links[0].order + 1 : 0;

  // Create link
  const link = await prisma.link.create({
    data: {
      profileId: profile.id,
      type: input.type,
      platform: input.type === 'PLATFORM' ? input.platform : null,
      title: input.title.trim(),
      url: input.url.trim(),
      icon: input.icon || null,
      order: nextOrder,
      isVisible: true
    }
  });

  return link;
};

export const updateLink = async (userId: string, linkId: string, input: UpdateLinkInput) => {
  // Find the link and verify ownership
  const link = await prisma.link.findUnique({
    where: { id: linkId },
    include: {
      profile: {
        include: {
          user: true
        }
      }
    }
  });

  if (!link) {
    throw new AppError(404, 'LINK_NOT_FOUND', 'Link not found');
  }

  if (link.profile.userId !== userId) {
    throw new AppError(403, 'FORBIDDEN', 'You do not have permission to update this link');
  }

  // Validate title if provided
  if (input.title !== undefined) {
    if (input.title.trim().length === 0) {
      throw new AppError(400, 'INVALID_TITLE', 'Link title cannot be empty');
    }
    if (input.title.length > 100) {
      throw new AppError(400, 'INVALID_TITLE', 'Link title cannot exceed 100 characters');
    }
  }

  // Validate URL if provided
  if (input.url !== undefined) {
    if (input.url.trim().length === 0) {
      throw new AppError(400, 'INVALID_URL', 'Link URL cannot be empty');
    }
    if (!isValidUrl(input.url)) {
      throw new AppError(400, 'INVALID_URL', 'Invalid URL format');
    }
  }

  // Validate type if provided
  if (input.type !== undefined && input.type !== 'PLATFORM' && input.type !== 'CUSTOM') {
    throw new AppError(400, 'INVALID_TYPE', 'Link type must be PLATFORM or CUSTOM');
  }

  // Validate platform-specific requirements if type or platform is being updated
  const newType = input.type || link.type;
  const newPlatform = input.platform !== undefined ? input.platform : link.platform;
  const newUrl = input.url || link.url;

  if (newType === 'PLATFORM') {
    if (!newPlatform) {
      throw new AppError(400, 'MISSING_PLATFORM', 'Platform is required for platform links');
    }

    if (!SUPPORTED_PLATFORMS.includes(newPlatform as SupportedPlatform)) {
      throw new AppError(
        400,
        'UNSUPPORTED_PLATFORM',
        `Platform must be one of: ${SUPPORTED_PLATFORMS.join(', ')}`
      );
    }

    // Validate platform-specific URL format if URL is being updated
    if (input.url && !validatePlatformUrl(newPlatform, newUrl)) {
      throw new AppError(
        400,
        'INVALID_PLATFORM_URL',
        `URL does not match expected format for ${newPlatform}`
      );
    }
  }

  // Update link
  const updatedLink = await prisma.link.update({
    where: { id: linkId },
    data: {
      ...(input.type !== undefined && { type: input.type }),
      ...(input.platform !== undefined && { platform: input.platform }),
      ...(input.title !== undefined && { title: input.title.trim() }),
      ...(input.url !== undefined && { url: input.url.trim() }),
      ...(input.icon !== undefined && { icon: input.icon }),
      ...(input.isVisible !== undefined && { isVisible: input.isVisible }),
      updatedAt: new Date()
    }
  });

  return updatedLink;
};

export const deleteLink = async (userId: string, linkId: string) => {
  // Find the link and verify ownership
  const link = await prisma.link.findUnique({
    where: { id: linkId },
    include: {
      profile: {
        include: {
          user: true
        }
      }
    }
  });

  if (!link) {
    throw new AppError(404, 'LINK_NOT_FOUND', 'Link not found');
  }

  if (link.profile.userId !== userId) {
    throw new AppError(403, 'FORBIDDEN', 'You do not have permission to delete this link');
  }

  // Delete link
  await prisma.link.delete({
    where: { id: linkId }
  });

  return { success: true, message: 'Link deleted successfully' };
};

export const reorderLinks = async (userId: string, linkOrders: { id: string; order: number }[]) => {
  // Validate input
  if (!Array.isArray(linkOrders) || linkOrders.length === 0) {
    throw new AppError(400, 'INVALID_INPUT', 'Link orders array is required');
  }

  // Find user's profile
  const profile = await prisma.profile.findUnique({
    where: { userId },
    include: {
      links: true
    }
  });

  if (!profile) {
    throw new AppError(404, 'PROFILE_NOT_FOUND', 'Profile not found');
  }

  // Verify all links belong to the user
  const linkIds = linkOrders.map(lo => lo.id);
  const userLinkIds = profile.links.map((l: { id: string }) => l.id);

  for (const linkId of linkIds) {
    if (!userLinkIds.includes(linkId)) {
      throw new AppError(403, 'FORBIDDEN', 'One or more links do not belong to you');
    }
  }

  // Update orders in a transaction
  await prisma.$transaction(
    linkOrders.map(({ id, order }) =>
      prisma.link.update({
        where: { id },
        data: { order }
      })
    )
  );

  // Return updated links
  const updatedLinks = await prisma.link.findMany({
    where: { profileId: profile.id },
    orderBy: { order: 'asc' }
  });

  return updatedLinks;
};

export const getUserLinks = async (userId: string) => {
  // Find user's profile
  const profile = await prisma.profile.findUnique({
    where: { userId },
    include: {
      links: {
        orderBy: { order: 'asc' }
      }
    }
  });

  if (!profile) {
    throw new AppError(404, 'PROFILE_NOT_FOUND', 'Profile not found');
  }

  return profile.links;
};
