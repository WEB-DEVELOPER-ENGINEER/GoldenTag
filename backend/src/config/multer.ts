import multer from 'multer';
import path from 'path';
import { getUploadDir } from '../utils/fileStorage';

// Storage configuration for profile pictures
export const profilePictureStorage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadPath = path.join(getUploadDir(), 'avatars');
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `avatar-${uniqueSuffix}${ext}`);
  }
});

// Storage configuration for background images
export const backgroundImageStorage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadPath = path.join(getUploadDir(), 'backgrounds');
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `background-${uniqueSuffix}${ext}`);
  }
});

// Storage configuration for PDF files
export const pdfStorage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadPath = path.join(getUploadDir(), 'pdfs');
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `pdf-${uniqueSuffix}${ext}`);
  }
});

// Multer upload instances
export const uploadProfilePicture = multer({ 
  storage: profilePictureStorage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
});

export const uploadBackgroundImage = multer({ 
  storage: backgroundImageStorage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
});

export const uploadPDF = multer({ 
  storage: pdfStorage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  }
});
