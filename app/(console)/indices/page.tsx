import { EntityPage } from "@/components/entity-page";

export default function IndicesAdminPage() {
  return <EntityPage title="行业指数" description="查看已入库的指数口径、状态和更新时间；指数生成规则接入前保持只读观察。" entity="indices" />;
}