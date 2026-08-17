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
const imagesDir = path.join(uploadDir, 'images');
const videosDir = path.join(uploadDir, 'videos');

// Ensure upload directories exist
[uploadDir, imagesDir, videosDir].forEach((dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'];
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'];
const MAX_IMAGE_MB = parseInt(process.env.MAX_FILE_SIZE_MB || '10');
const MAX_VIDEO_MB = 100;

// Image upload multer
const imageUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_IMAGE_MB * 1024 * 1024, files: 10 },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
      return cb(new AppError('Only JPEG, PNG, WebP, GIF, AVIF images allowed', 400) as unknown as null, false);
    }
    cb(null, true);
  },
});

// Video upload multer (disk storage — videos too large for memory)
const videoUpload = multer({
  storage: multer.diskStorage({
    destination: videosDir,
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase() || '.mp4';
      cb(null, `${uuidv4()}${ext}`);
    },
  }),
  limits: { fileSize: MAX_VIDEO_MB * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_VIDEO_TYPES.includes(file.mimetype)) {
      return cb(new AppError('Only MP4, WebM, OGG, MOV videos allowed', 400) as unknown as null, false);
    }
    cb(null, true);
  },
});

// ─── Single image upload ───────────────────────────────────────────────────────
router.post(
  '/image',
  authenticate,
  authorize('ADMIN'),
  imageUpload.single('file'),
  async (req, res) => {
    if (!req.file) throw new AppError('No file uploaded', 400);

    const filename = `${uuidv4()}.webp`;
    const outputPath = path.join(imagesDir, filename);

    await sharp(req.file.buffer)
      .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 85 })
      .toFile(outputPath);

    const url = `${process.env.APP_URL}/uploads/images/${filename}`;
    return ApiResponse.success(res, { url, filename, type: 'image' });
  }
);

// ─── Multiple images upload ────────────────────────────────────────────────────
router.post(
  '/images',
  authenticate,
  authorize('ADMIN'),
  imageUpload.array('files', 10),
  async (req, res) => {
    const files = req.files as Express.Multer.File[];
    if (!files?.length) throw new AppError('No files uploaded', 400);

    const results = await Promise.all(
      files.map(async (file) => {
        const filename = `${uuidv4()}.webp`;
        const outputPath = path.join(imagesDir, filename);
        await sharp(file.buffer)
          .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
          .webp({ quality: 85 })
          .toFile(outputPath);
        return {
          url: `${process.env.APP_URL}/uploads/images/${filename}`,
          filename,
          type: 'image',
        };
      })
    );

    return ApiResponse.success(res, { files: results, urls: results.map((r) => r.url) });
  }
);

// ─── Single video upload ───────────────────────────────────────────────────────
router.post(
  '/video',
  authenticate,
  authorize('ADMIN'),
  videoUpload.single('file'),
  async (req, res) => {
    if (!req.file) throw new AppError('No video uploaded', 400);

    const url = `${process.env.APP_URL}/uploads/videos/${req.file.filename}`;
    return ApiResponse.success(res, {
      url,
      filename: req.file.filename,
      type: 'video',
      size: req.file.size,
    });
  }
);

// ─── Mixed media upload (images + videos) ─────────────────────────────────────
router.post(
  '/media',
  authenticate,
  authorize('ADMIN'),
  multer({
    storage: multer.diskStorage({
      destination: (req, file, cb) => {
        const isVideo = ALLOWED_VIDEO_TYPES.includes(file.mimetype);
        cb(null, isVideo ? videosDir : imagesDir);
      },
      filename: (_req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        cb(null, `${uuidv4()}${ext}`);
      },
    }),
    limits: { fileSize: MAX_VIDEO_MB * 1024 * 1024, files: 15 },
    fileFilter: (_req, file, cb) => {
      const allowed = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_VIDEO_TYPES];
      if (!allowed.includes(file.mimetype)) {
        return cb(new AppError('Unsupported file type', 400) as unknown as null, false);
      }
      cb(null, true);
    },
  }).array('files', 15),
  async (req, res) => {
    const files = req.files as Express.Multer.File[];
    if (!files?.length) throw new AppError('No files uploaded', 400);

    const results = await Promise.all(
      files.map(async (file) => {
        const isVideo = ALLOWED_VIDEO_TYPES.includes(file.mimetype);
        if (isVideo) {
          return {
            url: `${process.env.APP_URL}/uploads/videos/${file.filename}`,
            filename: file.filename,
            type: 'video',
          };
        }
        // Process image with sharp
        const webpFilename = `${path.parse(file.filename).name}.webp`;
        const inputPath = path.join(imagesDir, file.filename);
        const outputPath = path.join(imagesDir, webpFilename);
        await sharp(inputPath)
          .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
          .webp({ quality: 85 })
          .toFile(outputPath);
        fs.unlinkSync(inputPath); // Remove original
        return {
          url: `${process.env.APP_URL}/uploads/images/${webpFilename}`,
          filename: webpFilename,
          type: 'image',
        };
      })
    );

    return ApiResponse.success(res, {
      files: results,
      images: results.filter((r) => r.type === 'image').map((r) => r.url),
      videos: results.filter((r) => r.type === 'video').map((r) => r.url),
    });
  }
);

export default router;
