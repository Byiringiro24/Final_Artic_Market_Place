import type { Metadata } from 'next';
import DealsClient from './deals-client';

export const metadata: Metadata = {
  title: "Today's Deals",
  description: 'Shop the best deals on ARTIC Marketplace — limited time offers every day.',
};

export default function DealsPage() {
  return <DealsClient />;
}
