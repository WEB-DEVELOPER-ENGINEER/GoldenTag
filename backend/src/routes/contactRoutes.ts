import { Router, Request, Response, NextFunction } from 'express';
import { authenticate } from '../middleware/authMiddleware';
import {
  createContact,
  updateContact,
  deleteContact,
  getUserContacts
} from '../services/contactService';

const router = Router();

// GET /api/contacts - Get user's contacts
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

    const contacts = await getUserContacts(req.user.userId);

    res.status(200).json(contacts);
  } catch (error) {
    next(error);
  }
});

// POST /api/contacts - Create new contact
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

    const { type, value, label } = req.body;

    if (!type || !value) {
      return res.status(400).json({
        error: {
          code: 'MISSING_FIELDS',
          message: 'Type and value are required'
        }
      });
    }

    const contact = await createContact(req.user.userId, {
      type,
      value,
      label
    });

    res.status(201).json(contact);
  } catch (error) {
    next(error);
  }
});

// PUT /api/contacts/:id - Update contact
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
    const { type, value, label } = req.body;

    const updatedContact = await updateContact(req.user.userId, id, {
      type,
      value,
      label
    });

    res.status(200).json(updatedContact);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/contacts/:id - Delete contact
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

    const result = await deleteContact(req.user.userId, id);

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

export default router;
