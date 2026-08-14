import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ReactMarkdown from 'react-markdown';

interface Props { params: Promise<{ slug: string }> }

async function fetchPage(slug: string) {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/pages/${slug}`,
      { next: { revalidate: 300 } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data.data;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const page = await fetchPage(slug);
  if (!page) return { title: 'Page not found' };
  return {
    title: page.metaTitle || page.title,
    description: page.metaDesc,
  };
}

export default async function CMSPage({ params }: Props) {
  const { slug } = await params;
  const page = await fetchPage(slug);
  if (!page) notFound();

  return (
    <div className="container mx-auto px-4 py-10 max-w-3xl">
      <h1 className="text-3xl font-bold mb-8">{page.title}</h1>
      <article className="prose prose-lg max-w-none">
        <ReactMarkdown>{page.content}</ReactMarkdown>
      </article>
    </div>
  );
}
