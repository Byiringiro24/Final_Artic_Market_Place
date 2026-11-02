import type { Metadata } from 'next';
import ServicesClient from './services-client';

export const metadata: Metadata = {
  title: 'Services',
  description: 'Explore professional services offered by ARTIC HUB — photography, delivery, consulting and more.',
};

export default function ServicesPage() {
  return <ServicesClient />;
}
