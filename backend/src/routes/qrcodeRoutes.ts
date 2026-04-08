import { Router, Request, Response, NextFunction } from 'express';
import { authenticate } from '../middleware/authMiddleware';
import { generateQRCode, generateQRCodeBuffer } from '../services/qrcodeService';

const router = Router();

// GET /api/qrcode - Generate QR code for user's profile
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

    const qrCodeDataUrl = await generateQRCode(req.user.userId);

    res.status(200).json({
      qrCode: qrCodeDataUrl
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/qrcode/download - Download QR code as PNG image
router.get('/download', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required'
        }
      });
    }

    const qrCodeBuffer = await generateQRCodeBuffer(req.user.userId);

    // Set headers for file download
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Content-Disposition', 'attachment; filename="profile-qrcode.png"');
    res.setHeader('Content-Length', qrCodeBuffer.length);

    res.status(200).send(qrCodeBuffer);
  } catch (error) {
    next(error);
  }
});

export default router;
