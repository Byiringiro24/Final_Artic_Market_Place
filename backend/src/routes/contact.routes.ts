import { Router } from 'express';
import { prisma } from '../db/prisma';
import { ApiResponse } from '../lib/apiResponse';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

// Default contact info seeded at startup
const DEFAULT_CONTACT: Record<string, { value: string; label: string }> = {
  email: { value: 'articltd1@gmail.com', label: 'Email Address' },
  phone1: { value: '0787585826', label: 'Phone 1' },
  phone2: { value: '0785424098', label: 'Phone 2' },
  whatsapp: { value: '0787585826', label: 'WhatsApp Number' },
  facebook: { value: 'https://facebook.com/articmarketplace', label: 'Facebook' },
  twitter: { value: 'https://twitter.com/articmarket', label: 'Twitter / X' },
  instagram: { value: 'https://instagram.com/articmarketplace', label: 'Instagram' },
  linkedin: { value: 'https://linkedin.com/company/artic-marketplace', label: 'LinkedIn' },
  youtube: { value: 'https://youtube.com/@articmarketplace', label: 'YouTube' },
  tiktok: { value: 'https://tiktok.com/@articmarketplace', label: 'TikTok' },
  address: { value: 'Kigali, Rwanda', label: 'Physical Address' },
  support_hours: { value: 'Mon–Fri: 8AM–6PM | Sat: 9AM–3PM', label: 'Support Hours' },
  tagline: { value: 'Your one-stop marketplace for products and services', label: 'Tagline' },
};

// ─── GET all contact info (public) ───────────────────────────────────────────
router.get('/', async (_req, res) => {
  const items = await prisma.contactInfo.findMany({ orderBy: { key: 'asc' } });

  // If empty, seed defaults
  if (items.length === 0) {
    const seedData = Object.entries(DEFAULT_CONTACT).map(([key, { value, label }]) => ({
      key, value, label, group: key.includes('book') || key.includes('face') || key.includes('twit') || key.includes('insta') || key.includes('linked') || key.includes('you') || key.includes('tik') ? 'social' : 'contact',
    }));
    await prisma.contactInfo.createMany({ data: seedData, skipDuplicates: true });
    return ApiResponse.success(res, seedData.reduce((a, c) => ({ ...a, [c.key]: c }), {}));
  }

  const map = items.reduce<Record<string, unknown>>((acc, item) => {
    acc[item.key] = { value: item.value, label: item.label, group: item.group };
    return acc;
  }, {});
  return ApiResponse.success(res, map);
});

// ─── Admin: update all contact info ──────────────────────────────────────────
router.put('/', authenticate, authorize('ADMIN'), async (req, res) => {
  const updates = req.body as Array<{ key: string; value: string; label?: string; group?: string }>;

  await Promise.all(
    updates.map((u) =>
      prisma.contactInfo.upsert({
        where: { key: u.key },
        create: { key: u.key, value: u.value, label: u.label, group: u.group || 'contact' },
        update: { value: u.value, label: u.label },
      })
    )
  );

  return ApiResponse.success(res, null, 'Contact info updated');
});

export default router;
