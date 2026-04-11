import PetshopTemplate from '@/components/templates/petshop/template';

export default async function PetshopPage({
  searchParams,
}: {
  searchParams: Promise<{ name?: string }>;
}) {
  const { name } = await searchParams;
  return <PetshopTemplate businessName={name} />;
}
