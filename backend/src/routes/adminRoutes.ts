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
} from '../services/adminService';

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
    const { email, username, password, role, isActive } = req.body;

    if (!email || !username || !password) {
      return res.status(400).json({
        error: {
          code: 'MISSING_FIELDS',
          message: 'Email, username, and password are required',
        },
      });
    }

    const user = await createUser(adminId, {
      email,
      username,
      password,
      role,
      isActive,
    });
    
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

export default router;
