import { PrismaClient } from '@prisma/client';
import { AppError } from '../middleware/errorHandler';
import { deleteFile, getFilePath, getFileUrl } from '../utils/fileStorage';

const prisma = new PrismaClient();

export interface CreateFileInput {
  filename: string;
  originalName: string;
  title: string;
  fileSize: number;
  mimeType: string;
}

export const createFile = async (userId: string, input: CreateFileInput) => {
  // Find user's profile
  const profile = await prisma.profile.findUnique({
    where: { userId }
  });

  if (!profile) {
    throw new AppError(404, 'PROFILE_NOT_FOUND', 'Profile not found');
  }

  // Get the current max order for files
  const maxOrderFile = await prisma.file.findFirst({
    where: { profileId: profile.id },
    orderBy: { order: 'desc' }
  });

  const nextOrder = maxOrderFile ? maxOrderFile.order + 1 : 0;

  // Generate file URL
  const fileUrl = getFileUrl(input.filename, 'pdfs');

  // Create file record
  const file = await prisma.file.create({
    data: {
      profileId: profile.id,
      filename: input.filename,
      originalName: input.originalName,
      title: input.title,
      fileUrl,
      fileSize: input.fileSize,
      mimeType: input.mimeType,
      order: nextOrder
    }
  });

  return file;
};

export const deleteFileById = async (userId: string, fileId: string) => {
  // Find the file
  const file = await prisma.file.findUnique({
    where: { id: fileId },
    include: {
      profile: {
        include: {
          user: true
        }
      }
    }
  });

  if (!file) {
    throw new AppError(404, 'FILE_NOT_FOUND', 'File not found');
  }

  // Check if user owns this file
  if (file.profile.userId !== userId) {
    throw new AppError(403, 'FORBIDDEN', 'You do not have permission to delete this file');
  }

  // Delete file from storage
  const filePath = getFilePath(file.filename, 'pdfs');
  await deleteFile(filePath);

  // Delete file record from database
  await prisma.file.delete({
    where: { id: fileId }
  });

  return { success: true, message: 'File deleted successfully' };
};

export const getUserFiles = async (userId: string) => {
  // Find user's profile
  const profile = await prisma.profile.findUnique({
    where: { userId }
  });

  if (!profile) {
    throw new AppError(404, 'PROFILE_NOT_FOUND', 'Profile not found');
  }

  // Get all files for the profile
  const files = await prisma.file.findMany({
    where: { profileId: profile.id },
    orderBy: { order: 'asc' }
  });

  return files;
};
