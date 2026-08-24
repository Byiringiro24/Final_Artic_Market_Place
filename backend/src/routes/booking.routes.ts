import { Router } from 'express';
import { prisma } from '../db/prisma';
import { ApiResponse } from '../lib/apiResponse';
import { AppError } from '../middleware/error.middleware';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { AuthRequest } from '../middleware/auth.middleware';
import { sendEmail } from '../lib/email';

const router = Router();

// ─── Book a service ───────────────────────────────────────────────────────────
router.post('/', authenticate, async (req: AuthRequest, res) => {
  const {
    serviceId, serviceTitle, date, time, notes,
    phone, address, type = 'standard',
  } = req.body;

  const user = await prisma.user.findUnique({
    where: { id: req.user!.userId },
    select: { name: true, email: true },
  });
  if (!user) throw new AppError('User not found', 404);

  // Store booking as a notification (reuse existing infra until dedicated table added)
  await prisma.notification.create({
    data: {
      userId: req.user!.userId,
      type: 'ORDER_PLACED',
      title: `Service Booking: ${serviceTitle}`,
      message: `Your booking for "${serviceTitle}" on ${date} at ${time} has been received. We will confirm shortly.`,
    },
  });

  // Notify admins
  const admins = await prisma.user.findMany({ where: { role: 'ADMIN' }, select: { email: true, name: true } });
  for (const admin of admins) {
    await sendEmail({
      to: admin.email,
      toName: admin.name,
      subject: `New Service Booking — ${serviceTitle}`,
      template: 'service-booking',
      html: `
        <h2>New Service Booking</h2>
        <p><b>Service:</b> ${serviceTitle}</p>
        <p><b>Customer:</b> ${user.name} (${user.email})</p>
        <p><b>Date:</b> ${date} at ${time}</p>
        <p><b>Phone:</b> ${phone || 'Not provided'}</p>
        <p><b>Address:</b> ${address || 'Not provided'}</p>
        <p><b>Notes:</b> ${notes || 'None'}</p>
        <p><b>Type:</b> ${type}</p>
      `,
    });
  }

  // Confirm to customer
  await sendEmail({
    to: user.email,
    toName: user.name,
    subject: `Booking Confirmed — ${serviceTitle}`,
    template: 'booking-confirmed',
    html: `
      <h2>Booking Received! 🎉</h2>
      <p>Hi ${user.name}, your booking for <strong>${serviceTitle}</strong> has been received.</p>
      <p><b>Date:</b> ${date} at ${time}</p>
      <p>Our team will contact you at <b>${phone || user.email}</b> to confirm the appointment.</p>
      <p>Contact us: <a href="tel:0787585826">0787585826</a> | articltd1@gmail.com</p>
    `,
  });

  return ApiResponse.created(res, {
    serviceTitle, date, time, status: 'PENDING',
  }, 'Booking submitted! We will confirm shortly.');
});

export default router;
