import { EntityPage } from "@/components/entity-page";

export default function CommentsPage() {
  return <EntityPage entity="comments" title="评论管理" description="管理一级评论和二级回复，可隐藏、删除或保留可见评论。" />;
}