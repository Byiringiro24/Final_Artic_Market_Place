import { Router } from 'express';
import { z } from 'zod';
import slugify from 'slugify';
import { CourseStatus } from '@prisma/client';
import { prisma } from '../db/prisma';
import { ApiResponse } from '../lib/apiResponse';
import { AppError } from '../middleware/error.middleware';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

type RegistrationInput = {
  courseId?: string | null;
  courseTitle: string;
  fullName: string;
  email: string;
  phone: string;
  organization?: string;
  message?: string;
  whatsappOptIn: boolean;
  consent: true;
};

type CourseInput = {
  title: string;
  summary: string;
  description: string;
  category: string;
  level: string;
  language: string;
  durationHours: number;
  price: number;
  currency: string;
  thumbnailUrl?: string | null;
  instructorName?: string | null;
  status: CourseStatus;
  isFeatured: boolean;
};

const registrationSchema = z.object({
  courseId: z.string().uuid().optional().nullable(),
  courseTitle: z.string().trim().min(2).max(160),
  fullName: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(254),
  phone: z.string().trim().min(7).max(30),
  organization: z.string().trim().max(160).optional(),
  message: z.string().trim().max(2000).optional(),
  whatsappOptIn: z.boolean().default(false),
  consent: z.literal(true),
});

const courseSchema = z.object({
  title: z.string().trim().min(3).max(160),
  summary: z.string().trim().min(10).max(300),
  description: z.string().trim().min(10),
  category: z.string().trim().min(2).max(100),
  level: z.string().trim().max(40).default('BEGINNER'),
  language: z.string().trim().max(12).default('en'),
  durationHours: z.number().int().min(0).max(10000).default(0),
  price: z.number().min(0).default(0),
  currency: z.string().trim().length(3).default('RWF'),
  thumbnailUrl: z.string().url().optional().nullable(),
  instructorName: z.string().trim().max(120).optional().nullable(),
  status: z.nativeEnum(CourseStatus).default(CourseStatus.DRAFT),
  isFeatured: z.boolean().default(false),
});

// Public course catalogue. Private lesson content is never included here.
router.get('/courses', async (req, res) => {
  const category = typeof req.query.category === 'string' ? req.query.category : undefined;
  const courses = await prisma.course.findMany({
    where: { status: CourseStatus.PUBLISHED, ...(category ? { category } : {}) },
    orderBy: [{ isFeatured: 'desc' }, { publishedAt: 'desc' }],
    select: {
      id: true, slug: true, title: true, summary: true, category: true,
      level: true, language: true, durationHours: true, price: true,
      currency: true, thumbnailUrl: true, instructorName: true, isFeatured: true,
      _count: { select: { modules: true, enrollments: true } },
    },
  });
  return ApiResponse.success(res, courses);
});

router.get('/courses/:slug', async (req, res) => {
  const course = await prisma.course.findFirst({
    where: { slug: req.params.slug, status: CourseStatus.PUBLISHED },
    select: {
      id: true, slug: true, title: true, summary: true, description: true,
      category: true, level: true, language: true, durationHours: true,
      price: true, currency: true, thumbnailUrl: true, instructorName: true,
      modules: {
        orderBy: { sortOrder: 'asc' },
        select: {
          id: true, title: true, sortOrder: true,
          lessons: {
            where: { isPreview: true },
            orderBy: { sortOrder: 'asc' },
            select: { id: true, title: true, type: true, durationSeconds: true, isPreview: true },
          },
        },
      },
      _count: { select: { enrollments: true } },
    },
  });
  if (!course) throw new AppError('Course not found', 404);
  return ApiResponse.success(res, course);
});

// Public registration for scheduled or online training. WhatsApp is explicitly optional.
router.post('/training-registrations', async (req, res) => {
  let parsed: RegistrationInput;
  try {
    parsed = registrationSchema.parse(req.body) as RegistrationInput;
  } catch {
    throw new AppError('Please check the registration details', 400);
  }
  const { consent: consented, courseId: requestedCourseId, ...input } = parsed;
  void consented;
  const courseId = requestedCourseId || undefined;
  if (courseId) {
    const course = await prisma.course.findFirst({ where: { id: courseId, status: CourseStatus.PUBLISHED } });
    if (!course) throw new AppError('Selected course is not available for registration', 404);
  }

  const registration = await prisma.trainingRegistration.create({
    data: {
      ...input,
      email: input.email.toLowerCase(),
      ...(courseId ? { course: { connect: { id: courseId } } } : {}),
      organization: input.organization || undefined,
      message: input.message || undefined,
    },
    select: { id: true, courseTitle: true, status: true, createdAt: true },
  });
  return ApiResponse.created(res, registration, 'Training registration received');
});

// Admin course authoring endpoints. Modules and lesson editing will be added in the next Academy slice.
router.get('/admin/courses', authenticate, authorize('ADMIN'), async (_req, res) => {
  const courses = await prisma.course.findMany({ orderBy: { updatedAt: 'desc' } });
  return ApiResponse.success(res, courses);
});

router.post('/admin/courses', authenticate, authorize('ADMIN'), async (req, res) => {
  let data: CourseInput;
  try {
    data = courseSchema.parse(req.body) as CourseInput;
  } catch {
    throw new AppError('Please check the course details', 400);
  }
  const slug = slugify(data.title, { lower: true, strict: true });
  const exists = await prisma.course.findUnique({ where: { slug } });
  if (exists) throw new AppError('A course with this title already exists', 409);
  const course = await prisma.course.create({
    data: {
      ...data,
      slug,
      publishedAt: data.status === CourseStatus.PUBLISHED ? new Date() : null,
    },
  });
  return ApiResponse.created(res, course);
});

router.patch('/admin/courses/:id', authenticate, authorize('ADMIN'), async (req, res) => {
  let data: Partial<CourseInput>;
  try {
    data = courseSchema.partial().parse(req.body) as Partial<CourseInput>;
  } catch {
    throw new AppError('Please check the course details', 400);
  }
  const current = await prisma.course.findUnique({ where: { id: req.params.id } });
  if (!current) throw new AppError('Course not found', 404);
  const slug = data.title ? slugify(data.title, { lower: true, strict: true }) : undefined;
  if (slug && slug !== current.slug && await prisma.course.findUnique({ where: { slug } })) {
    throw new AppError('A course with this title already exists', 409);
  }
  const course = await prisma.course.update({
    where: { id: current.id },
    data: {
      ...data,
      ...(slug ? { slug } : {}),
      ...(data.status === CourseStatus.PUBLISHED && !current.publishedAt ? { publishedAt: new Date() } : {}),
    },
  });
  return ApiResponse.success(res, course);
});

export default router;
