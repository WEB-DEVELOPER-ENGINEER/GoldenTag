import { Router, Request, Response, NextFunction } from 'express';
import { authenticate, requireAdmin } from '../middleware/authMiddleware';
import {
  getUserList,
  getUserDetail,
  searchUsers,
  deactivateUser,
  reactivateUser,
  getAdminActionLogs,
  updateUser,
  deleteUser,
  createUser,
  updateUserPassword,
  updateUserProfile,
  updateUserTheme,
  updateUserPopup,
} from '../services/adminService';
import { updateProfilePicture, updateBackgroundImage } from '../services/profileService';
import { uploadProfilePicture, uploadBackgroundImage } from '../config/multer';
import { uploadTempImage } from '../config/tempUpload';
import { validateImageFile } from '../utils/fileStorage';
import {
  registerTempFile,
  getTempFileUrl,
  deleteTempFiles,
  commitTempFile,
} from '../services/tempFileService';

const router = Router();

// All admin routes require authentication and admin role
router.use(authenticate);
router.use(requireAdmin);

// GET /api/admin/users - List all users with pagination
router.get('/users', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = req.query.page ? parseInt(req.query.page as string) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;

    const result = await getUserList({ page, limit });
    
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

// GET /api/admin/users/search - Search and filter users
router.get('/users/search', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, username, role, isActive, page, limit } = req.query;

    const searchParams = {
      email: email as string | undefined,
      username: username as string | undefined,
      role: role as string | undefined,
      isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
    };

    const paginationParams = {
      page: page ? parseInt(page as string) : 1,
      limit: limit ? parseInt(limit as string) : 20,
    };

    const result = await searchUsers(searchParams, paginationParams);
    
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

// GET /api/admin/users/:id - Get detailed user information
router.get('/users/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const user = await getUserDetail(id);
    
    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
});

// PUT /api/admin/users/:id/deactivate - Deactivate user account
router.put('/users/:id/deactivate', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const adminId = req.user!.userId;

    const user = await deactivateUser(id, adminId);
    
    res.status(200).json({
      message: 'User deactivated successfully',
      user,
    });
  } catch (error) {
    next(error);
  }
});

// PUT /api/admin/users/:id/activate - Reactivate user account
router.put('/users/:id/activate', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const adminId = req.user!.userId;

    const user = await reactivateUser(id, adminId);
    
    res.status(200).json({
      message: 'User reactivated successfully',
      user,
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/admin/logs - Get admin action logs
router.get('/logs', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.query.userId as string | undefined;

    const logs = getAdminActionLogs(userId);
    
    res.status(200).json({ logs });
  } catch (error) {
    next(error);
  }
});

// PUT /api/admin/users/:id - Update user information
router.put('/users/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const adminId = req.user!.userId;
    const { email, username, role, isActive } = req.body;

    const updateData: any = {};
    if (email !== undefined) updateData.email = email;
    if (username !== undefined) updateData.username = username;
    if (role !== undefined) updateData.role = role;
    if (isActive !== undefined) updateData.isActive = isActive;

    const user = await updateUser(id, adminId, updateData);
    
    res.status(200).json({
      message: 'User updated successfully',
      user,
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/admin/users/:id - Delete user permanently
router.delete('/users/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const adminId = req.user!.userId;

    const result = await deleteUser(id, adminId);
    
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

// POST /api/admin/users - Create new user
router.post('/users', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const adminId = req.user!.userId;
    const { email, username, password, role, isActive, profile, theme, popup, tempIds } = req.body;

    if (!email || !username || !password) {
      return res.status(400).json({
        error: {
          code: 'MISSING_FIELDS',
          message: 'Email, username, and password are required',
        },
      });
    }

    // Commit temporary files if provided
    let avatarUrl = profile?.avatarUrl;
    let backgroundImageUrl = profile?.backgroundImageUrl;

    if (profile?.avatarTempId) {
      try {
        avatarUrl = await commitTempFile(profile.avatarTempId, 'avatars');
      } catch (error) {
        console.error('Failed to commit avatar temp file:', error);
      }
    }

    if (profile?.backgroundTempId) {
      try {
        backgroundImageUrl = await commitTempFile(profile.backgroundTempId, 'backgrounds');
      } catch (error) {
        console.error('Failed to commit background temp file:', error);
      }
    }

    const user = await createUser(adminId, {
      email,
      username,
      password,
      role,
      isActive,
      profile: profile ? {
        ...profile,
        avatarUrl,
        backgroundImageUrl,
      } : undefined,
      theme,
      popup,
    });

    // Cleanup any remaining temp files
    if (tempIds && Array.isArray(tempIds) && tempIds.length > 0) {
      await deleteTempFiles(tempIds).catch(err => 
        console.error('Failed to cleanup temp files:', err)
      );
    }
    
    res.status(201).json({
      message: 'User created successfully',
      user,
    });
  } catch (error) {
    next(error);
  }
});

// PUT /api/admin/users/:id/password - Reset user password
router.put('/users/:id/password', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const adminId = req.user!.userId;
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({
        error: {
          code: 'MISSING_PASSWORD',
          message: 'Password is required',
        },
      });
    }

    const result = await updateUserPassword(id, adminId, password);
    
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

// PUT /api/admin/users/:id/profile - Update user profile
router.put('/users/:id/profile', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const adminId = req.user!.userId;
    const profileData = req.body;

    const profile = await updateUserProfile(id, adminId, profileData);
    
    res.status(200).json({
      message: 'Profile updated successfully',
      profile,
    });
  } catch (error) {
    next(error);
  }
});

// PUT /api/admin/users/:id/theme - Update user theme
router.put('/users/:id/theme', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const adminId = req.user!.userId;
    const themeData = req.body;

    const theme = await updateUserTheme(id, adminId, themeData);
    
    res.status(200).json({
      message: 'Theme updated successfully',
      theme,
    });
  } catch (error) {
    next(error);
  }
});

// PUT /api/admin/users/:id/popup - Update user popup
router.put('/users/:id/popup', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const adminId = req.user!.userId;
    const popupData = req.body;

    const popup = await updateUserPopup(id, adminId, popupData);
    
    res.status(200).json({
      message: 'Popup updated successfully',
      popup,
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/admin/users/:id/avatar - Upload avatar for user
router.post('/users/:id/avatar', uploadProfilePicture.single('avatar'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

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

    const updatedProfile = await updateProfilePicture(id, req.file.filename);
    
    res.status(200).json(updatedProfile);
  } catch (error) {
    next(error);
  }
});

// POST /api/admin/users/:id/background - Upload background for user
router.post('/users/:id/background', uploadBackgroundImage.single('background'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

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

    const updatedProfile = await updateBackgroundImage(id, req.file.filename);
    
    res.status(200).json(updatedProfile);
  } catch (error) {
    next(error);
  }
});

// POST /api/admin/temp/avatar - Upload temporary avatar
router.post('/temp/avatar', uploadTempImage.single('avatar'), async (req: Request, res: Response, next: NextFunction) => {
  try {
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

    // Register temp file and get tracking ID
    const tempId = registerTempFile(req.file.filename, 'avatar');
    const tempUrl = getTempFileUrl(req.file.filename);

    res.status(200).json({
      tempId,
      tempUrl,
      filename: req.file.filename,
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/admin/temp/background - Upload temporary background
router.post('/temp/background', uploadTempImage.single('background'), async (req: Request, res: Response, next: NextFunction) => {
  try {
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

    // Register temp file and get tracking ID
    const tempId = registerTempFile(req.file.filename, 'background');
    const tempUrl = getTempFileUrl(req.file.filename);

    res.status(200).json({
      tempId,
      tempUrl,
      filename: req.file.filename,
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/admin/temp/cleanup - Cleanup temporary files
router.delete('/temp/cleanup', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { tempIds } = req.body;

    if (!tempIds || !Array.isArray(tempIds)) {
      return res.status(400).json({
        error: {
          code: 'INVALID_REQUEST',
          message: 'tempIds array is required'
        }
      });
    }

    await deleteTempFiles(tempIds);

    res.status(200).json({
      success: true,
      message: 'Temporary files cleaned up'
    });
  } catch (error) {
    next(error);
  }
});

export default router;
