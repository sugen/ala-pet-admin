import { AdminShell } from "@/components/admin-shell";
import { DashboardOverview } from "@/components/dashboard-overview";

export default function AdminIndexPage() {
  return (
    <AdminShell>
      <DashboardOverview />
    </AdminShell>
  );
}
