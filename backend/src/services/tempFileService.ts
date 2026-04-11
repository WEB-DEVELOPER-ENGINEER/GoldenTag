import fs from 'fs/promises';
import path from 'path';
import { getUploadDir, getFilePath, getFileUrl } from '../utils/fileStorage';

interface TempFileRecord {
  filename: string;
  uploadedAt: Date;
  type: 'avatar' | 'background';
}

// In-memory tracking of temporary files
const tempFiles = new Map<string, TempFileRecord>();

// Cleanup interval (5 minutes)
const CLEANUP_INTERVAL = 5 * 60 * 1000;
// File expiry time (30 minutes)
const FILE_EXPIRY_TIME = 30 * 60 * 1000;

/**
 * Register a temporary file for tracking
 */
export const registerTempFile = (filename: string, type: 'avatar' | 'background'): string => {
  const tempId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  tempFiles.set(tempId, {
    filename,
    uploadedAt: new Date(),
    type,
  });

  return tempId;
};

/**
 * Get temporary file info
 */
export const getTempFile = (tempId: string): TempFileRecord | undefined => {
  return tempFiles.get(tempId);
};

/**
 * Move temporary file to permanent location
 */
export const commitTempFile = async (
  tempId: string,
  targetType: 'avatars' | 'backgrounds'
): Promise<string> => {
  const tempFile = tempFiles.get(tempId);
  
  if (!tempFile) {
    throw new Error('Temporary file not found');
  }

  const tempPath = getFilePath(tempFile.filename, 'temp');
  const ext = path.extname(tempFile.filename);
  const newFilename = `${targetType === 'avatars' ? 'avatar' : 'background'}-${Date.now()}-${Math.round(Math.random() * 1E9)}${ext}`;
  const permanentPath = getFilePath(newFilename, targetType);

  try {
    // Move file from temp to permanent location
    await fs.rename(tempPath, permanentPath);
    
    // Remove from tracking
    tempFiles.delete(tempId);
    
    // Return the permanent file URL
    return getFileUrl(newFilename, targetType);
  } catch (error) {
    console.error('Error committing temp file:', error);
    throw new Error('Failed to commit temporary file');
  }
};

/**
 * Delete a temporary file
 */
export const deleteTempFile = async (tempId: string): Promise<void> => {
  const tempFile = tempFiles.get(tempId);
  
  if (!tempFile) {
    return; // Already deleted or doesn't exist
  }

  const tempPath = getFilePath(tempFile.filename, 'temp');

  try {
    await fs.unlink(tempPath);
  } catch (error) {
    console.error('Error deleting temp file:', error);
  } finally {
    tempFiles.delete(tempId);
  }
};

/**
 * Delete multiple temporary files
 */
export const deleteTempFiles = async (tempIds: string[]): Promise<void> => {
  await Promise.all(tempIds.map(id => deleteTempFile(id)));
};

/**
 * Cleanup expired temporary files
 */
export const cleanupExpiredTempFiles = async (): Promise<void> => {
  const now = Date.now();
  const expiredIds: string[] = [];

  // Find expired files
  for (const [tempId, record] of tempFiles.entries()) {
    const age = now - record.uploadedAt.getTime();
    if (age > FILE_EXPIRY_TIME) {
      expiredIds.push(tempId);
    }
  }

  // Delete expired files
  if (expiredIds.length > 0) {
    console.log(`Cleaning up ${expiredIds.length} expired temporary files`);
    await deleteTempFiles(expiredIds);
  }
};

/**
 * Start automatic cleanup of expired files
 */
export const startTempFileCleanup = (): NodeJS.Timeout => {
  console.log('Starting temporary file cleanup service');
  return setInterval(cleanupExpiredTempFiles, CLEANUP_INTERVAL);
};

/**
 * Get temporary file URL for preview
 */
export const getTempFileUrl = (filename: string): string => {
  return getFileUrl(filename, 'temp');
};
