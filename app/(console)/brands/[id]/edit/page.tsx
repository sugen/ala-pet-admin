import { EntityForm } from "@/components/entity-form";

export default async function EditBrandPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <EntityForm entity="brands" id={id} title="编辑品牌" description="更新品牌公开资料和审核状态。" />;
}