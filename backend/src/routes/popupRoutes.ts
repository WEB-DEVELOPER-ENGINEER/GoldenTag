import { Router, Request, Response, NextFunction } from 'express';
import { authenticate } from '../middleware/authMiddleware';
import {
  updatePopupSettings,
  togglePopup,
  getPopupSettings
} from '../services/popupService';

const router = Router();

// GET /api/popup - Get user's popup settings
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

    const popup = await getPopupSettings(req.user.userId);

    res.status(200).json(popup);
  } catch (error) {
    next(error);
  }
});

// PUT /api/popup - Update popup settings
router.put('/', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required'
        }
      });
    }

    const { isEnabled, message, duration, backgroundColor, textColor } = req.body;

    const popup = await updatePopupSettings(req.user.userId, {
      isEnabled,
      message,
      duration,
      backgroundColor,
      textColor
    });

    res.status(200).json(popup);
  } catch (error) {
    next(error);
  }
});

// PUT /api/popup/toggle - Toggle popup visibility
router.put('/toggle', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required'
        }
      });
    }

    const { isEnabled } = req.body;

    if (typeof isEnabled !== 'boolean') {
      return res.status(400).json({
        error: {
          code: 'INVALID_INPUT',
          message: 'isEnabled must be a boolean value'
        }
      });
    }

    const popup = await togglePopup(req.user.userId, isEnabled);

    res.status(200).json(popup);
  } catch (error) {
    next(error);
  }
});

export default router;
