import { EntityPage } from "@/components/entity-page";

export default function UsersPage() {
  return <EntityPage entity="users" title="用户管理" description="管理平台后台用户、普通用户和机构运营账号，第一版统一使用 tbl_users。" />;
}