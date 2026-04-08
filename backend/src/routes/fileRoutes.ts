import { Router, Request, Response, NextFunction } from 'express';
import { authenticate } from '../middleware/authMiddleware';
import { createFile, deleteFileById, getUserFiles } from '../services/fileService';
import { uploadPDF } from '../config/multer';
import { validatePDFFile, scanPDFContent } from '../utils/fileStorage';
import fs from 'fs';
import { promisify } from 'util';

const readFile = promisify(fs.readFile);
const router = Router();

// POST /api/files/upload - Upload PDF file
router.post('/upload', authenticate, uploadPDF.single('pdf'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required'
        }
      });
    }

    if (!req.file) {
      return res.status(400).json({
        error: {
          code: 'NO_FILE',
          message: 'No file uploaded'
        }
      });
    }

    // Validate file type and size
    const validation = validatePDFFile(req.file.mimetype, req.file.size);
    if (!validation.valid) {
      return res.status(400).json({
        error: {
          code: 'INVALID_FILE',
          message: validation.error
        }
      });
    }

    // Scan PDF for malicious content
    const fileBuffer = await readFile(req.file.path);
    const scanResult = scanPDFContent(fileBuffer);
    if (!scanResult.valid) {
      return res.status(400).json({
        error: {
          code: 'MALICIOUS_CONTENT',
          message: scanResult.error
        }
      });
    }

    // Get title from request body or use original filename
    const title = req.body.title || req.file.originalname;

    const file = await createFile(req.user.userId, {
      filename: req.file.filename,
      originalName: req.file.originalname,
      title,
      fileSize: req.file.size,
      mimeType: req.file.mimetype
    });

    res.status(201).json(file);
  } catch (error) {
    next(error);
  }
});

// GET /api/files - Get user's files
router.get('/', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required'
        }
      });
    }

    const files = await getUserFiles(req.user.userId);

    res.status(200).json(files);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/files/:id - Delete file
router.delete('/:id', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required'
        }
      });
    }

    const { id } = req.params;

    const result = await deleteFileById(req.user.userId, id);

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

export default router;
