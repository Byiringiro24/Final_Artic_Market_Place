import type { Metadata } from 'next';
import ServicesClient from './services-client';

export const metadata: Metadata = {
  title: 'Services',
  description: 'Explore professional services offered by ARTIC Marketplace — photography, delivery, consulting and more.',
};

export default function ServicesPage() {
  return <ServicesClient />;
}
