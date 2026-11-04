import DiscoveryPage from './discovery-page';

export const metadata = {
  title: 'Search ARTIC HUB | ARTIC Group Ltd',
  description: 'Find products, services, courses, and destinations across ARTIC HUB.',
};

export default async function Page({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q = '' } = await searchParams;
  return <DiscoveryPage initialQuery={q} />;
}
