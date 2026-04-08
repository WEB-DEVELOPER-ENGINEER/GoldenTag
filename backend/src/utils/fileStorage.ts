import fs from 'fs';
import path from 'path';
import { promisify } from 'util';

const mkdir = promisify(fs.mkdir);
const unlink = promisify(fs.unlink);
const access = promisify(fs.access);

// File type validation
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
export const ALLOWED_PDF_TYPE = 'application/pdf';

// File size limits (in bytes)
export const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
export const MAX_PDF_SIZE = 10 * 1024 * 1024; // 10MB

export interface FileValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validate image file type and size
 */
export function validateImageFile(mimetype: string, size: number): FileValidationResult {
  if (!ALLOWED_IMAGE_TYPES.includes(mimetype)) {
    return {
      valid: false,
      error: `Invalid file type. Allowed types: ${ALLOWED_IMAGE_TYPES.join(', ')}`
    };
  }

  if (size > MAX_IMAGE_SIZE) {
    return {
      valid: false,
      error: `File size exceeds maximum allowed size of ${MAX_IMAGE_SIZE / (1024 * 1024)}MB`
    };
  }

  return { valid: true };
}

/**
 * Validate PDF file type and size
 */
export function validatePDFFile(mimetype: string, size: number): FileValidationResult {
  if (mimetype !== ALLOWED_PDF_TYPE) {
    return {
      valid: false,
      error: 'Invalid file type. Only PDF files are allowed'
    };
  }

  if (size > MAX_PDF_SIZE) {
    return {
      valid: false,
      error: `File size exceeds maximum allowed size of ${MAX_PDF_SIZE / (1024 * 1024)}MB`
    };
  }

  return { valid: true };
}

/**
 * Ensure upload directory exists
 */
export async function ensureUploadDir(uploadPath: string): Promise<void> {
  try {
    await access(uploadPath);
  } catch {
    await mkdir(uploadPath, { recursive: true });
  }
}

/**
 * Delete file from storage
 */
export async function deleteFile(filePath: string): Promise<void> {
  try {
    await access(filePath);
    await unlink(filePath);
  } catch (error) {
    // File doesn't exist or already deleted
    console.warn(`File not found or already deleted: ${filePath}`);
  }
}

/**
 * Get upload directory path
 */
export function getUploadDir(): string {
  return path.join(process.cwd(), process.env.UPLOAD_DIR || 'uploads');
}

/**
 * Get file URL for serving
 */
export function getFileUrl(filename: string, subfolder?: string): string {
  const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
  const filePath = subfolder ? `${subfolder}/${filename}` : filename;
  return `${baseUrl}/uploads/${filePath}`;
}

/**
 * Get full file path on disk
 */
export function getFilePath(filename: string, subfolder?: string): string {
  const uploadDir = getUploadDir();
  return subfolder 
    ? path.join(uploadDir, subfolder, filename)
    : path.join(uploadDir, filename);
}

/**
 * Basic malicious content scan for PDFs
 * Checks for suspicious patterns in PDF content
 */
export function scanPDFContent(buffer: Buffer): FileValidationResult {
  const content = buffer.toString('utf-8', 0, Math.min(buffer.length, 1024));
  
  // Check for PDF header
  if (!content.startsWith('%PDF-')) {
    return {
      valid: false,
      error: 'Invalid PDF file format'
    };
  }

  // Check for suspicious JavaScript or executable content
  const suspiciousPatterns = [
    '/JavaScript',
    '/JS',
    '/Launch',
    '/OpenAction',
    '/AA',
    '/EmbeddedFile'
  ];

  for (const pattern of suspiciousPatterns) {
    if (content.includes(pattern)) {
      return {
        valid: false,
        error: 'PDF contains potentially malicious content'
      };
    }
  }

  return { valid: true };
}
