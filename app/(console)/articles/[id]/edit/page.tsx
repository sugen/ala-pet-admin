import { EntityForm } from "@/components/entity-form";

export default async function EditArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <EntityForm entity="articles" id={id} title="编辑文章" description="编辑文章内容、来源、SEO 和发布状态。" />;
}