import { EntityPage } from "@/components/entity-page";

export default function OrganizationsPage() {
  return <EntityPage entity="organizations" title="机构管理" description="维护认证状态、机构资料和唯一主页 slug；内容关联使用 organization_id。" />;
}