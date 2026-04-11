import multer from 'multer';
import path from 'path';
import { getUploadDir } from '../utils/fileStorage';

// Storage configuration for temporary uploads
export const tempStorage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadPath = path.join(getUploadDir(), 'temp');
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    const ext = path.extname(file.originalname);
    const prefix = file.fieldname === 'avatar' ? 'temp-avatar' : 'temp-background';
    cb(null, `${prefix}-${uniqueSuffix}${ext}`);
  }
});

// Multer upload instance for temporary files
export const uploadTempImage = multer({ 
  storage: tempStorage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
});
