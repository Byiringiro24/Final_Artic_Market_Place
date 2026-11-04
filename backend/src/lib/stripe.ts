import Stripe from 'stripe';
import { AppError } from '../middleware/error.middleware';

let stripeClient: Stripe | null = null;
let configuredKey: string | null = null;

/** Create the Stripe SDK only when a Stripe operation is requested.
 * ARTIC HUB can then start with Stripe disabled while other payment methods
 * and marketplace/API features continue to work.
 */
export function getStripeClient(): Stripe {
  const apiKey = process.env.STRIPE_SECRET_KEY?.trim();
  if (!apiKey) throw new AppError('Card payments are not configured on this site', 503);

  if (!stripeClient || configuredKey !== apiKey) {
    stripeClient = new Stripe(apiKey, { apiVersion: '2025-02-24.acacia' });
    configuredKey = apiKey;
  }
  return stripeClient;
}
