import { MongoClient, Db, Collection, ObjectId } from 'mongodb';
import logger from '../lib/logger';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface MediaFile {
  _id?: ObjectId;
  url: string;
  filename: string;
  type: 'image' | 'video' | 'audio';
  mimeType: string;
  size: number;               // bytes
  width?: number;             // images only
  height?: number;            // images only
  duration?: number;          // video/audio only (seconds)
  uploadedBy?: string;        // user id (postgres)
  entityType?: string;        // 'product' | 'service' | 'banner' | 'user' | etc.
  entityId?: string;          // postgres entity id
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
}

// ─── Singleton ────────────────────────────────────────────────────────────────

let client: MongoClient | null = null;
let db: Db | null = null;

export async function connectMongoDB(): Promise<Db> {
  if (db) return db;

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI is not defined in environment variables');
  }

  try {
    client = new MongoClient(uri, {
      connectTimeoutMS: 10_000,
      serverSelectionTimeoutMS: 10_000,
    });
    await client.connect();
    db = client.db(); // uses db name from URI (artic_media)
    logger.info('MongoDB connected successfully');

    // Ensure indexes
    const col = db.collection<MediaFile>('media_files');
    await col.createIndex({ createdAt: -1 });
    await col.createIndex({ uploadedBy: 1 });
    await col.createIndex({ entityType: 1, entityId: 1 });
    await col.createIndex({ type: 1 });

    return db;
  } catch (err) {
    logger.error('MongoDB connection failed:', err);
    // Non-fatal: app still works without MongoDB (media metadata just won't be stored)
    db = null;
    throw err;
  }
}

export async function getMongoDb(): Promise<Db | null> {
  if (db) return db;
  try {
    return await connectMongoDB();
  } catch {
    return null;
  }
}

export function getMediaCollection(): Collection<MediaFile> | null {
  if (!db) return null;
  return db.collection<MediaFile>('media_files');
}

export async function disconnectMongoDB(): Promise<void> {
  if (client) {
    await client.close();
    client = null;
    db = null;
    logger.info('MongoDB disconnected');
  }
}
