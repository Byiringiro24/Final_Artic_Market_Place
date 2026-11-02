import { Router } from 'express';
import { prisma } from '../db/prisma';
import { sendEmail } from '../lib/email';
import { ApiResponse } from '../lib/apiResponse';
import { strictLimiter } from '../middleware/rateLimiter.middleware';

const router = Router();

const CATEGORIES: Record<string, string> = {
  'new-service': 'New service',
  'platform-improvement': 'Platform improvement',
  partnership: 'Partnership',
  other: 'Other',
};

const HTML_ENTITIES: Record<string, string> = {
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
};

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => HTML_ENTITIES[character]);
}

router.post('/', strictLimiter, async (req, res) => {
  const { name, email, category, idea, website } = req.body as Record<string, unknown>;

  // Honeypot submissions get a quiet success response and are not mailed.
  if (typeof website === 'string' && website.trim()) {
    return ApiResponse.success(res, { received: true }, 'Thank you for your idea.', 202);
  }

  if (
    typeof name !== 'string' || name.trim().length < 2 || name.length > 100 ||
    typeof email !== 'string' || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
    typeof category !== 'string' || !CATEGORIES[category] ||
    typeof idea !== 'string' || idea.trim().length < 10 || idea.length > 3000
  ) {
    return ApiResponse.badRequest(res, 'Please provide a valid name, email, category, and idea (10–3000 characters).');
  }

  const admins = await prisma.user.findMany({
    where: { role: 'ADMIN' },
    select: { email: true, name: true },
  });

  if (admins.length === 0) {
    return ApiResponse.error(res, 'Idea submissions are temporarily unavailable. Please contact ARTIC directly.', 503);
  }

  const safeName = escapeHtml(name.trim());
  const safeEmail = escapeHtml(email.trim());
  const safeIdea = escapeHtml(idea.trim()).replace(/\r?\n/g, '<br />');
  const categoryLabel = CATEGORIES[category];

  const results = await Promise.all(admins.map((admin) => sendEmail({
    to: admin.email,
    toName: admin.name,
    subject: `ARTIC HUB idea submission — ${categoryLabel}`,
    template: 'hub-idea-submission',
    html: `
      <h2>New ARTIC HUB idea</h2>
      <p><b>From:</b> ${safeName} (${safeEmail})</p>
      <p><b>Category:</b> ${categoryLabel}</p>
      <p><b>Idea:</b></p>
      <p>${safeIdea}</p>
      <p><a href="mailto:${safeEmail}">Reply to ${safeName}</a></p>
    `,
  })));

  if (!results.some(Boolean)) {
    return ApiResponse.error(res, 'We could not send your idea right now. Please try again later.', 503);
  }

  return ApiResponse.created(res, { received: true }, 'Thank you. Your idea has been sent to the ARTIC team.');
});

export default router;
