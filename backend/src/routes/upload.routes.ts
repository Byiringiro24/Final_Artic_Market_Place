import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import sharp from 'sharp';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { ApiResponse } from '../lib/apiResponse';
import { AppError } from '../middleware/error.middleware';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: (parseInt(process.env.MAX_FILE_SIZE_MB || '10')) * 1024 * 1024,
    files: 10,
  },
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowed.includes(file.mimetype)) {
      return cb(new AppError('Only JPEG, PNG, WebP, and GIF images are allowed', 400) as unknown as null, false);
    }
    cb(null, true);
  },
});

// Single image upload (admin only)
router.post(
  '/image',
  authenticate,
  authorize('ADMIN'),
  upload.single('file'),
  async (req, res) => {
    if (!req.file) throw new AppError('No file uploaded', 400);

    const filename = `${uuidv4()}.webp`;
    const outputPath = path.join(uploadDir, filename);

    await sharp(req.file.buffer)
      .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 85 })
      .toFile(outputPath);

    const url = `${process.env.APP_URL}/uploads/${filename}`;
    return ApiResponse.success(res, { url, filename });
  }
);

// Multiple images (admin only)
router.post(
  '/images',
  authenticate,
  authorize('ADMIN'),
  upload.array('files', 10),
  async (req, res) => {
    const files = req.files as Express.Multer.File[];
    if (!files?.length) throw new AppError('No files uploaded', 400);

    const urls = await Promise.all(
      files.map(async (file) => {
        const filename = `${uuidv4()}.webp`;
        const outputPath = path.join(uploadDir, filename);
        await sharp(file.buffer)
          .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
          .webp({ quality: 85 })
          .toFile(outputPath);
        return `${process.env.APP_URL}/uploads/${filename}`;
      })
    );

    return ApiResponse.success(res, { urls });
  }
);

// Serve uploaded files
router.use('/files', (_req, res, next) => {
  next();
});

export default router;
