CREATE TYPE "CourseStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');
CREATE TYPE "LessonType" AS ENUM ('VIDEO', 'TEXT', 'FILE', 'LIVE');

CREATE TABLE "academy_courses" (
  "id" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "summary" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "level" TEXT NOT NULL DEFAULT 'BEGINNER',
  "language" TEXT NOT NULL DEFAULT 'en',
  "durationHours" INTEGER NOT NULL DEFAULT 0,
  "price" DECIMAL(10,2) NOT NULL DEFAULT 0,
  "currency" TEXT NOT NULL DEFAULT 'RWF',
  "thumbnailUrl" TEXT,
  "instructorName" TEXT,
  "status" "CourseStatus" NOT NULL DEFAULT 'DRAFT',
  "isFeatured" BOOLEAN NOT NULL DEFAULT false,
  "publishedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "academy_courses_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "academy_course_modules" (
  "id" TEXT NOT NULL,
  "courseId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "academy_course_modules_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "academy_lessons" (
  "id" TEXT NOT NULL,
  "moduleId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "type" "LessonType" NOT NULL DEFAULT 'VIDEO',
  "content" TEXT,
  "videoUrl" TEXT,
  "resourceUrl" TEXT,
  "durationSeconds" INTEGER NOT NULL DEFAULT 0,
  "isPreview" BOOLEAN NOT NULL DEFAULT false,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "academy_lessons_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "academy_enrollments" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "courseId" TEXT NOT NULL,
  "progressPercent" INTEGER NOT NULL DEFAULT 0,
  "enrolledAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "completedAt" TIMESTAMP(3),
  CONSTRAINT "academy_enrollments_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "academy_training_registrations" (
  "id" TEXT NOT NULL,
  "courseId" TEXT,
  "courseTitle" TEXT NOT NULL,
  "fullName" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "phone" TEXT NOT NULL,
  "organization" TEXT,
  "message" TEXT,
  "whatsappOptIn" BOOLEAN NOT NULL DEFAULT false,
  "consentedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "status" TEXT NOT NULL DEFAULT 'PENDING',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "academy_training_registrations_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "academy_courses_slug_key" ON "academy_courses"("slug");
CREATE INDEX "academy_courses_status_isFeatured_createdAt_idx" ON "academy_courses"("status", "isFeatured", "createdAt");
CREATE INDEX "academy_course_modules_courseId_sortOrder_idx" ON "academy_course_modules"("courseId", "sortOrder");
CREATE INDEX "academy_lessons_moduleId_sortOrder_idx" ON "academy_lessons"("moduleId", "sortOrder");
CREATE UNIQUE INDEX "academy_enrollments_userId_courseId_key" ON "academy_enrollments"("userId", "courseId");
CREATE INDEX "academy_enrollments_userId_enrolledAt_idx" ON "academy_enrollments"("userId", "enrolledAt");
CREATE INDEX "academy_training_registrations_email_createdAt_idx" ON "academy_training_registrations"("email", "createdAt");
CREATE INDEX "academy_training_registrations_status_createdAt_idx" ON "academy_training_registrations"("status", "createdAt");

ALTER TABLE "academy_course_modules" ADD CONSTRAINT "academy_course_modules_courseId_fkey"
  FOREIGN KEY ("courseId") REFERENCES "academy_courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "academy_lessons" ADD CONSTRAINT "academy_lessons_moduleId_fkey"
  FOREIGN KEY ("moduleId") REFERENCES "academy_course_modules"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "academy_enrollments" ADD CONSTRAINT "academy_enrollments_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "academy_enrollments" ADD CONSTRAINT "academy_enrollments_courseId_fkey"
  FOREIGN KEY ("courseId") REFERENCES "academy_courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "academy_training_registrations" ADD CONSTRAINT "academy_training_registrations_courseId_fkey"
  FOREIGN KEY ("courseId") REFERENCES "academy_courses"("id") ON DELETE SET NULL ON UPDATE CASCADE;
