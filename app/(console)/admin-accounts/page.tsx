import { AdminAccountForm } from "@/components/admin-account-form";
import { PageTitle } from "@/components/page-title";

export default function AdminAccountsPage() {
  return (
    <>
      <PageTitle title="后台账号管理" description="管理拥有 Admin 后台身份的账号，并为账号分配一个或多个角色。" />
      <AdminAccountForm />
    </>
  );
}