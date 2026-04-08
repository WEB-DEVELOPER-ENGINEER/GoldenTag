import { Router, Request, Response, NextFunction } from 'express';
import { authenticate } from '../middleware/authMiddleware';
import {
  createLink,
  updateLink,
  deleteLink,
  reorderLinks,
  getUserLinks
} from '../services/linkService';

const router = Router();

// GET /api/links - Get user's links
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

    const links = await getUserLinks(req.user.userId);

    res.status(200).json(links);
  } catch (error) {
    next(error);
  }
});

// POST /api/links - Create new link
router.post('/', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required'
        }
      });
    }

    const { type, platform, title, url, icon } = req.body;

    if (!type || !title || !url) {
      return res.status(400).json({
        error: {
          code: 'MISSING_FIELDS',
          message: 'Type, title, and URL are required'
        }
      });
    }

    const link = await createLink(req.user.userId, {
      type,
      platform,
      title,
      url,
      icon
    });

    res.status(201).json(link);
  } catch (error) {
    next(error);
  }
});

// PUT /api/links/:id - Update link
router.put('/:id', authenticate, async (req: Request, res: Response, next: NextFunction) => {
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
    const { type, platform, title, url, icon, isVisible } = req.body;

    const updatedLink = await updateLink(req.user.userId, id, {
      type,
      platform,
      title,
      url,
      icon,
      isVisible
    });

    res.status(200).json(updatedLink);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/links/:id - Delete link
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

    const result = await deleteLink(req.user.userId, id);

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

// PUT /api/links/reorder - Update link order
router.put('/reorder', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required'
        }
      });
    }

    const { linkOrders } = req.body;

    if (!linkOrders) {
      return res.status(400).json({
        error: {
          code: 'MISSING_FIELD',
          message: 'linkOrders array is required'
        }
      });
    }

    const updatedLinks = await reorderLinks(req.user.userId, linkOrders);

    res.status(200).json(updatedLinks);
  } catch (error) {
    next(error);
  }
});

export default router;
