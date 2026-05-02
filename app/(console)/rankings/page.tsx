import { EntityPage } from "@/components/entity-page";

export default function RankingsAdminPage() {
  return <EntityPage title="行业榜单" description="查看已入库的榜单维度、状态和更新时间；榜单明细由公开 API 展示。" entity="rankings" />;
}