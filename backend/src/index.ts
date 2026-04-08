import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { errorHandler } from './middleware/errorHandler';
import authRoutes from './routes/authRoutes';
import profileRoutes from './routes/profileRoutes';
import fileRoutes from './routes/fileRoutes';
import linkRoutes from './routes/linkRoutes';
import contactRoutes from './routes/contactRoutes';
import popupRoutes from './routes/popupRoutes';
import qrcodeRoutes from './routes/qrcodeRoutes';
import adminRoutes from './routes/adminRoutes';
import { ensureUploadDir, getUploadDir } from './utils/fileStorage';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Ensure upload directories exist
const initializeStorage = async () => {
  const uploadDir = getUploadDir();
  await ensureUploadDir(uploadDir);
  await ensureUploadDir(path.join(uploadDir, 'avatars'));
  await ensureUploadDir(path.join(uploadDir, 'backgrounds'));
  await ensureUploadDir(path.join(uploadDir, 'pdfs'));
};

initializeStorage().catch(console.error);

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from uploads directory
app.use('/uploads', express.static(getUploadDir()));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.get('/api', (req, res) => {
  res.json({ message: 'Digital Profile Hub API' });
});

app.use('/api/auth', authRoutes);
app.use('/api/profiles', profileRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/links', linkRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/popup', popupRoutes);
app.use('/api/qrcode', qrcodeRoutes);
app.use('/api/admin', adminRoutes);

// Error handling middleware (must be last)
app.use(errorHandler);

// Start server
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  });
}

export default app;
