import { SourceForm } from "@/components/source-form";

export default async function EditSourcePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <SourceForm id={id} />;
}