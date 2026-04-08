import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';
import { AppError } from '../middleware/errorHandler';
import { isValidEmail, isValidPassword, isValidUsername } from '../utils/validation';
import { generateToken, JWTPayload } from '../utils/jwt';

const prisma = new PrismaClient();
const SALT_ROUNDS = 10;

export interface RegisterInput {
  email: string;
  password: string;
  username: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    username: string;
    role: string;
  };
  token: string;
}

export const registerUser = async (input: RegisterInput): Promise<AuthResponse> => {
  const { email, password, username } = input;

  // Validate email
  if (!isValidEmail(email)) {
    throw new AppError(400, 'INVALID_EMAIL', 'Invalid email format');
  }

  // Validate password
  const passwordValidation = isValidPassword(password);
  if (!passwordValidation.valid) {
    throw new AppError(400, 'INVALID_PASSWORD', 'Password does not meet requirements', {
      password: passwordValidation.errors
    });
  }

  // Validate username
  if (!isValidUsername(username)) {
    throw new AppError(400, 'INVALID_USERNAME', 'Username must be 3-30 characters, alphanumeric with hyphens and underscores');
  }

  // Check if email already exists
  const existingEmail = await prisma.user.findUnique({
    where: { email }
  });

  if (existingEmail) {
    throw new AppError(409, 'EMAIL_EXISTS', 'An account with this email already exists');
  }

  // Check if username already exists
  const existingUsername = await prisma.user.findUnique({
    where: { username }
  });

  if (existingUsername) {
    throw new AppError(409, 'USERNAME_EXISTS', 'This username is already taken');
  }

  // Hash password
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  // Create user and profile in a transaction
  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      username,
      profile: {
        create: {
          displayName: username,
          theme: {
            create: {}
          }
        }
      }
    },
    include: {
      profile: true
    }
  });

  // Generate JWT token
  const tokenPayload: JWTPayload = {
    userId: user.id,
    email: user.email,
    role: user.role
  };

  const token = generateToken(tokenPayload);

  return {
    user: {
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role
    },
    token
  };
};

export interface LoginInput {
  email: string;
  password: string;
}

export const loginUser = async (input: LoginInput): Promise<AuthResponse> => {
  const { email, password } = input;

  // Find user by email
  const user = await prisma.user.findUnique({
    where: { email }
  });

  if (!user) {
    throw new AppError(401, 'INVALID_CREDENTIALS', 'Invalid email or password');
  }

  // Check if account is active
  if (!user.isActive) {
    throw new AppError(403, 'ACCOUNT_DEACTIVATED', 'This account has been deactivated');
  }

  // Verify password
  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

  if (!isPasswordValid) {
    throw new AppError(401, 'INVALID_CREDENTIALS', 'Invalid email or password');
  }

  // Update last login timestamp
  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() }
  });

  // Generate JWT token
  const tokenPayload: JWTPayload = {
    userId: user.id,
    email: user.email,
    role: user.role
  };

  const token = generateToken(tokenPayload);

  return {
    user: {
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role
    },
    token
  };
};
