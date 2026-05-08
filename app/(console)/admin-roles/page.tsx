import { PageTitle } from "@/components/page-title";
import { RolePermissionEditor } from "@/components/role-permission-editor";

export default function AdminRolesPage() {
  return (
    <>
      <PageTitle title="角色权限管理" description="配置后台角色可访问的菜单和可执行的操作权限。" />
      <RolePermissionEditor />
    </>
  );
}