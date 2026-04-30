import { RawContentDetail } from "@/components/raw-content-detail";

export default async function RawContentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <RawContentDetail id={id} />;
}