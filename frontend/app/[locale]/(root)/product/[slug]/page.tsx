import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ProductDetail from './product-detail';

interface Props { params: Promise<{ slug: string; locale: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return {
    title: slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
    description: `Shop ${slug} on ARTIC Marketplace`,
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  return <ProductDetail slug={slug} />;
}
