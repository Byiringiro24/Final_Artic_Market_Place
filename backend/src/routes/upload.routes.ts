import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import sharp from 'sharp';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { ApiResponse } from '../lib/apiResponse';
import { AppError } from '../middleware/error.middleware';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { getMediaCollection, MediaFile } from '../db/mongodb';

const router = Router();

const uploadDir = path.join(process.cwd(), 'uploads');
const imagesDir = path.join(uploadDir, 'images');
const videosDir = path.join(uploadDir, 'videos');
const audioDir  = path.join(uploadDir, 'audio');

// Ensure upload directories exist
[uploadDir, imagesDir, videosDir, audioDir].forEach((dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

const ALLOWED_IMAGE_TYPES  = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'];
const ALLOWED_VIDEO_TYPES  = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime', 'video/x-msvideo'];
const ALLOWED_AUDIO_TYPES  = ['audio/mpeg', 'audio/mp3', 'audio/ogg', 'audio/wav', 'audio/webm', 'audio/aac', 'audio/flac'];

const MAX_IMAGE_MB = parseInt(process.env.MAX_FILE_SIZE_MB || '10');
const MAX_VIDEO_MB = 200;
const MAX_AUDIO_MB = 50;
const ALL_MAX_MB   = Math.max(MAX_IMAGE_MB, MAX_VIDEO_MB, MAX_AUDIO_MB);

// ─── Helper: save media metadata to MongoDB (non-fatal) ──────────────────────
async function saveMediaMeta(
  meta: Omit<MediaFile, '_id' | 'createdAt' | 'updatedAt'>,
  uploadedBy?: string,
): Promise<void> {
  try {
    const col = getMediaCollection();
    if (!col) return; // MongoDB not available – skip silently
    const now = new Date();
    await col.insertOne({
      ...meta,
      uploadedBy: uploadedBy ?? meta.uploadedBy,
      createdAt: now,
      updatedAt: now,
    });
  } catch {
    // Never crash the upload because of a MongoDB error
  }
}

// ─── Multer configs ───────────────────────────────────────────────────────────

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
      return cb(new AppError('Only MP4, WebM, OGG, MOV, AVI videos allowed', 400) as unknown as null, false);
    }
    cb(null, true);
  },
});

const audioUpload = multer({
  storage: multer.diskStorage({
    destination: audioDir,
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase() || '.mp3';
      cb(null, `${uuidv4()}${ext}`);
    },
  }),
  limits: { fileSize: MAX_AUDIO_MB * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_AUDIO_TYPES.includes(file.mimetype)) {
      return cb(new AppError('Only MP3, OGG, WAV, AAC, FLAC audio allowed', 400) as unknown as null, false);
    }
    cb(null, true);
  },
});

// ─── POST /upload/image  (single) ─────────────────────────────────────────────
router.post(
  '/image',
  authenticate,
  authorize('ADMIN'),
  imageUpload.single('file'),
  async (req, res) => {
    if (!req.file) throw new AppError('No file uploaded', 400);

    const filename   = `${uuidv4()}.webp`;
    const outputPath = path.join(imagesDir, filename);

    const info = await sharp(req.file.buffer)
      .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 85 })
      .toFile(outputPath);

    const url = `${process.env.APP_URL}/uploads/images/${filename}`;

    await saveMediaMeta(
      {
        url, filename, type: 'image',
        mimeType: 'image/webp',
        size: info.size,
        width: info.width,
        height: info.height,
        entityType: (req.body.entityType as string) || undefined,
        entityId:   (req.body.entityId   as string) || undefined,
      },
      (req as unknown as { user?: { id: string } }).user?.id,
    );

    return ApiResponse.success(res, { url, filename, type: 'image' });
  },
);

// ─── POST /upload/images  (multiple) ─────────────────────────────────────────
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
        const filename   = `${uuidv4()}.webp`;
        const outputPath = path.join(imagesDir, filename);

        const info = await sharp(file.buffer)
          .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
          .webp({ quality: 85 })
          .toFile(outputPath);

        const url = `${process.env.APP_URL}/uploads/images/${filename}`;

        await saveMediaMeta(
          {
            url, filename, type: 'image',
            mimeType: 'image/webp',
            size: info.size,
            width: info.width,
            height: info.height,
            entityType: (req.body.entityType as string) || undefined,
            entityId:   (req.body.entityId   as string) || undefined,
          },
          (req as unknown as { user?: { id: string } }).user?.id,
        );

        return { url, filename, type: 'image' };
      }),
    );

    return ApiResponse.success(res, { files: results, urls: results.map((r) => r.url) });
  },
);

// ─── POST /upload/video  (single) ─────────────────────────────────────────────
router.post(
  '/video',
  authenticate,
  authorize('ADMIN'),
  videoUpload.single('file'),
  async (req, res) => {
    if (!req.file) throw new AppError('No video uploaded', 400);

    const url = `${process.env.APP_URL}/uploads/videos/${req.file.filename}`;

    await saveMediaMeta(
      {
        url,
        filename: req.file.filename,
        type: 'video',
        mimeType: req.file.mimetype,
        size: req.file.size,
        entityType: (req.body.entityType as string) || undefined,
        entityId:   (req.body.entityId   as string) || undefined,
      },
      (req as unknown as { user?: { id: string } }).user?.id,
    );

    return ApiResponse.success(res, {
      url,
      filename: req.file.filename,
      type: 'video',
      size: req.file.size,
    });
  },
);

// ─── POST /upload/audio  (single) ─────────────────────────────────────────────
router.post(
  '/audio',
  authenticate,
  authorize('ADMIN'),
  audioUpload.single('file'),
  async (req, res) => {
    if (!req.file) throw new AppError('No audio file uploaded', 400);

    const url = `${process.env.APP_URL}/uploads/audio/${req.file.filename}`;

    await saveMediaMeta(
      {
        url,
        filename: req.file.filename,
        type: 'audio',
        mimeType: req.file.mimetype,
        size: req.file.size,
        entityType: (req.body.entityType as string) || undefined,
        entityId:   (req.body.entityId   as string) || undefined,
      },
      (req as unknown as { user?: { id: string } }).user?.id,
    );

    return ApiResponse.success(res, {
      url,
      filename: req.file.filename,
      type: 'audio',
      size: req.file.size,
    });
  },
);

// ─── POST /upload/media  (mixed: images + videos + audio, up to 15 files) ────
router.post(
  '/media',
  authenticate,
  authorize('ADMIN'),
  multer({
    storage: multer.diskStorage({
      destination: (req, file, cb) => {
        if (ALLOWED_VIDEO_TYPES.includes(file.mimetype)) return cb(null, videosDir);
        if (ALLOWED_AUDIO_TYPES.includes(file.mimetype)) return cb(null, audioDir);
        cb(null, imagesDir);
      },
      filename: (_req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        cb(null, `${uuidv4()}${ext}`);
      },
    }),
    limits: { fileSize: ALL_MAX_MB * 1024 * 1024, files: 15 },
    fileFilter: (_req, file, cb) => {
      const allowed = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_VIDEO_TYPES, ...ALLOWED_AUDIO_TYPES];
      if (!allowed.includes(file.mimetype)) {
        return cb(new AppError(`Unsupported file type: ${file.mimetype}`, 400) as unknown as null, false);
      }
      cb(null, true);
    },
  }).array('files', 15),
  async (req, res) => {
    const files = req.files as Express.Multer.File[];
    if (!files?.length) throw new AppError('No files uploaded', 400);

    const userId     = (req as unknown as { user?: { id: string } }).user?.id;
    const entityType = (req.body.entityType as string) || undefined;
    const entityId   = (req.body.entityId   as string) || undefined;

    const results = await Promise.all(
      files.map(async (file) => {
        // ── Video ──
        if (ALLOWED_VIDEO_TYPES.includes(file.mimetype)) {
          const url = `${process.env.APP_URL}/uploads/videos/${file.filename}`;
          await saveMediaMeta({ url, filename: file.filename, type: 'video', mimeType: file.mimetype, size: file.size, entityType, entityId }, userId);
          return { url, filename: file.filename, type: 'video' as const };
        }

        // ── Audio ──
        if (ALLOWED_AUDIO_TYPES.includes(file.mimetype)) {
          const url = `${process.env.APP_URL}/uploads/audio/${file.filename}`;
          await saveMediaMeta({ url, filename: file.filename, type: 'audio', mimeType: file.mimetype, size: file.size, entityType, entityId }, userId);
          return { url, filename: file.filename, type: 'audio' as const };
        }

        // ── Image → convert to WebP ──
        const webpFilename = `${path.parse(file.filename).name}.webp`;
        const inputPath    = path.join(imagesDir, file.filename);
        const outputPath   = path.join(imagesDir, webpFilename);

        const info = await sharp(inputPath)
          .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
          .webp({ quality: 85 })
          .toFile(outputPath);

        if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath); // remove original

        const url = `${process.env.APP_URL}/uploads/images/${webpFilename}`;
        await saveMediaMeta({ url, filename: webpFilename, type: 'image', mimeType: 'image/webp', size: info.size, width: info.width, height: info.height, entityType, entityId }, userId);
        return { url, filename: webpFilename, type: 'image' as const };
      }),
    );

    return ApiResponse.success(res, {
      files:  results,
      images: results.filter((r) => r.type === 'image').map((r) => r.url),
      videos: results.filter((r) => r.type === 'video').map((r) => r.url),
      audios: results.filter((r) => r.type === 'audio').map((r) => r.url),
    });
  },
);

// ─── GET /upload/media  (list all media from MongoDB) ─────────────────────────
router.get(
  '/media',
  authenticate,
  authorize('ADMIN'),
  async (req, res) => {
    const col = getMediaCollection();
    if (!col) return ApiResponse.success(res, { files: [], total: 0 });

    const type      = req.query.type as string | undefined;
    const entityType= req.query.entityType as string | undefined;
    const entityId  = req.query.entityId   as string | undefined;
    const page      = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit     = Math.min(100, parseInt(req.query.limit as string) || 50);

    const filter: Record<string, unknown> = {};
    if (type)       filter.type       = type;
    if (entityType) filter.entityType = entityType;
    if (entityId)   filter.entityId   = entityId;

    const [files, total] = await Promise.all([
      col.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).toArray(),
      col.countDocuments(filter),
    ]);

    return ApiResponse.success(res, { files, total, page, limit });
  },
);

export default router;
