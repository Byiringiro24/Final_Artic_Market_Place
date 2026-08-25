import { Router } from 'express';
import { prisma } from '../db/prisma';
import { ApiResponse } from '../lib/apiResponse';
import { AppError } from '../middleware/error.middleware';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { AuthRequest } from '../middleware/auth.middleware';
import { sendEmail } from '../lib/email';

const router = Router();

// ─── User: apply to become a seller ──────────────────────────────────────────
router.post('/apply', authenticate, async (req: AuthRequest, res) => {
  const userId = req.user!.userId;

  const existing = await prisma.sellerApplication.findUnique({ where: { userId } });
  if (existing) {
    if (existing.status === 'PENDING') throw new AppError('Your application is already under review', 400);
    if (existing.status === 'APPROVED') throw new AppError('You are already an approved seller', 400);
  }

  const { businessName, businessType, description, website, phone, address } = req.body;

  const application = await existing
    ? prisma.sellerApplication.update({
        where: { userId },
        data: { businessName, businessType, description, website, phone, address, status: 'PENDING', rejectedAt: null },
      })
    : prisma.sellerApplication.create({
        data: { userId, businessName, businessType, description, website, phone, address },
      });

  // Notify admins asynchronously — don't block the HTTP response
  prisma.user.findMany({ where: { role: 'ADMIN' }, select: { email: true, name: true } })
    .then((admins) => Promise.allSettled(
      admins.map((admin) =>
        sendEmail({
          to: admin.email,
          toName: admin.name,
          subject: `New Seller Application — ${businessName}`,
          template: 'seller-application',
          html: `<h2>New Seller Application</h2><p><b>Business:</b> ${businessName}</p><p><b>Type:</b> ${businessType}</p><p>Review in admin panel.</p>`,
        })
      )
    ))
    .catch(() => { /* non-fatal */ });

  return ApiResponse.created(res, application, 'Application submitted! We will review and contact you.');
});

// ─── User: check own application status ──────────────────────────────────────
router.get('/my-application', authenticate, async (req: AuthRequest, res) => {
  const app = await prisma.sellerApplication.findUnique({
    where: { userId: req.user!.userId },
  });
  return ApiResponse.success(res, app);
});

// ─── Admin: list all applications ────────────────────────────────────────────
router.get('/', authenticate, authorize('ADMIN'), async (req, res) => {
  const { status } = req.query as Record<string, string>;
  const apps = await prisma.sellerApplication.findMany({
    where: status ? { status: status.toUpperCase() as never } : undefined,
    include: { user: { select: { id: true, name: true, email: true, image: true } } },
    orderBy: { createdAt: 'desc' },
  });
  return ApiResponse.success(res, apps);
});

// ─── Admin: approve / reject ──────────────────────────────────────────────────
router.put('/:id/status', authenticate, authorize('ADMIN'), async (req, res) => {
  const { status, adminNotes } = req.body;

  const app = await prisma.sellerApplication.update({
    where: { id: req.params.id },
    data: {
      status,
      adminNotes,
      approvedAt: status === 'APPROVED' ? new Date() : null,
      rejectedAt: status === 'REJECTED' ? new Date() : null,
    },
    include: { user: { select: { email: true, name: true, id: true } } },
  });

  // Update user role if approved
  if (status === 'APPROVED') {
    await prisma.user.update({ where: { id: app.userId }, data: { role: 'SELLER' } });
  }

  // Email the applicant
  const isApproved = status === 'APPROVED';
  await sendEmail({
    to: app.user.email,
    toName: app.user.name,
    subject: isApproved ? '🎉 Your Seller Application is Approved!' : 'Seller Application Update',
    template: 'seller-status',
    html: isApproved
      ? `<h2>Congratulations, ${app.user.name}!</h2><p>Your seller application has been approved. You can now list products on ARTIC Marketplace.</p>`
      : `<h2>Application Update</h2><p>Hi ${app.user.name}, your seller application has been reviewed. Status: <b>${status}</b>.</p>${adminNotes ? `<p>Notes: ${adminNotes}</p>` : ''}`,
  });

  return ApiResponse.success(res, app, `Application ${status.toLowerCase()}`);
});

export default router;
