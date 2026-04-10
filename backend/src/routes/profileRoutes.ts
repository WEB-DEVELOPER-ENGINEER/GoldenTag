import { Router, Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../middleware/authMiddleware';
import { 
  updateProfile, 
  getProfileByUsername, 
  updateCustomSlug,
  updateProfilePicture,
  updateBackgroundImage
} from '../services/profileService';
import { 
  updateTheme, 
  toggleThemeMode, 
  updateBackgroundSettings 
} from '../services/themeService';
import { uploadProfilePicture, uploadBackgroundImage } from '../config/multer';
import { validateImageFile } from '../utils/fileStorage';

const router = Router();
const prisma = new PrismaClient();

// GET /api/profiles/me - Get own profile data
router.get('/me', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required'
        }
      });
    }

    // Get user to find username
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: { username: true }
    });

    if (!user) {
      return res.status(404).json({
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User not found'
        }
      });
    }

    const profileData = await getProfileByUsername(user.username);

    res.status(200).json(profileData);
  } catch (error) {
    next(error);
  }
});

// PUT /api/profiles/me - Update own profile
router.put('/me', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required'
        }
      });
    }

    const { displayName, bio } = req.body;

    const updatedProfile = await updateProfile(req.user.userId, {
      displayName,
      bio
    });

    res.status(200).json(updatedProfile);
  } catch (error) {
    next(error);
  }
});

// PUT /api/profiles/me/slug - Update custom URL slug
router.put('/me/slug', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required'
        }
      });
    }

    const { slug } = req.body;

    if (!slug) {
      return res.status(400).json({
        error: {
          code: 'MISSING_SLUG',
          message: 'Slug is required'
        }
      });
    }

    const updatedUser = await updateCustomSlug(req.user.userId, slug);

    res.status(200).json({
      username: updatedUser.username,
      profile: updatedUser.profile
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/profiles/:username - Get public profile by username
router.get('/:username', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { username } = req.params;

    const profileData = await getProfileByUsername(username);

    res.status(200).json(profileData);
  } catch (error) {
    next(error);
  }
});

// POST /api/profiles/me/avatar - Upload profile picture
router.post('/me/avatar', authenticate, uploadProfilePicture.single('avatar'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log('=== AVATAR UPLOAD DEBUG ===');
    console.log('req.file:', req.file);
    console.log('req.body:', req.body);
    console.log('Content-Type:', req.headers['content-type']);
    
    if (!req.user) {
      return res.status(401).json({
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required'
        }
      });
    }

    if (!req.file) {
      console.log('ERROR: No file in request');
      return res.status(400).json({
        error: {
          code: 'NO_FILE',
          message: 'No file uploaded'
        }
      });
    }
    
    console.log('File received:', req.file.filename, 'Size:', req.file.size);

    // Validate file type and size
    const validation = validateImageFile(req.file.mimetype, req.file.size);
    if (!validation.valid) {
      return res.status(400).json({
        error: {
          code: 'INVALID_FILE',
          message: validation.error
        }
      });
    }

    const updatedProfile = await updateProfilePicture(req.user.userId, req.file.filename);

    res.status(200).json(updatedProfile);
  } catch (error) {
    next(error);
  }
});

// POST /api/profiles/me/background - Upload background image
router.post('/me/background', authenticate, uploadBackgroundImage.single('background'), async (req: Request, res: Response, next: NextFunction) => {
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
    const validation = validateImageFile(req.file.mimetype, req.file.size);
    if (!validation.valid) {
      return res.status(400).json({
        error: {
          code: 'INVALID_FILE',
          message: validation.error
        }
      });
    }

    const updatedProfile = await updateBackgroundImage(req.user.userId, req.file.filename);

    res.status(200).json(updatedProfile);
  } catch (error) {
    next(error);
  }
});

// PUT /api/profiles/me/theme - Update theme settings
router.put('/me/theme', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required'
        }
      });
    }

    const { mode, primaryColor, secondaryColor, textColor, fontFamily, layout, buttonStyle } = req.body;

    const updatedTheme = await updateTheme(req.user.userId, {
      mode,
      primaryColor,
      secondaryColor,
      textColor,
      fontFamily,
      layout,
      buttonStyle
    });

    res.status(200).json(updatedTheme);
  } catch (error) {
    next(error);
  }
});

// POST /api/profiles/me/theme/toggle - Toggle light/dark mode
router.post('/me/theme/toggle', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required'
        }
      });
    }

    const updatedTheme = await toggleThemeMode(req.user.userId);

    res.status(200).json(updatedTheme);
  } catch (error) {
    next(error);
  }
});

// PUT /api/profiles/me/background - Update background settings
router.put('/me/background', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required'
        }
      });
    }

    const { backgroundType, backgroundColor, backgroundImageUrl } = req.body;

    if (!backgroundType || (backgroundType !== 'COLOR' && backgroundType !== 'IMAGE')) {
      return res.status(400).json({
        error: {
          code: 'INVALID_BACKGROUND_TYPE',
          message: 'Background type must be COLOR or IMAGE'
        }
      });
    }

    const updatedProfile = await updateBackgroundSettings(
      req.user.userId,
      backgroundType,
      backgroundColor,
      backgroundImageUrl
    );

    res.status(200).json(updatedProfile);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/profiles/me/background - Remove background image
router.delete('/me/background', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required'
        }
      });
    }

    // Reset to default white background
    const updatedProfile = await updateBackgroundSettings(
      req.user.userId,
      'COLOR',
      '#ffffff',
      undefined
    );

    res.status(200).json(updatedProfile);
  } catch (error) {
    next(error);
  }
});

export default router;
