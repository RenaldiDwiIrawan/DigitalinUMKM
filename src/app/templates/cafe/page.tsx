import CafeTemplate from '@/components/templates/cafe/template';

export default async function CafePage({
  searchParams,
}: {
  searchParams: Promise<{ name?: string }>;
}) {
  const { name } = await searchParams;
  return <CafeTemplate businessName={name} />;
}
