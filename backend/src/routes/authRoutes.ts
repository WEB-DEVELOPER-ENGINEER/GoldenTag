import { Router, Request, Response, NextFunction } from 'express';
import { registerUser, loginUser } from '../services/authService';

const router = Router();

// POST /api/auth/register
router.post('/register', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password, username } = req.body;

    if (!email || !password || !username) {
      return res.status(400).json({
        error: {
          code: 'MISSING_FIELDS',
          message: 'Email, password, and username are required'
        }
      });
    }

    const result = await registerUser({ email, password, username });
    
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
});

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: {
          code: 'MISSING_FIELDS',
          message: 'Email and password are required'
        }
      });
    }

    const result = await loginUser({ email, password });
    
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

export default router;
