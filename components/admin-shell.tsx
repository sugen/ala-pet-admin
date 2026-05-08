import type { ReactNode } from "react";
import { AdminAccessGuard } from "@/components/admin-access-guard";
import { AdminHeader } from "@/components/admin-header";
import { AdminSidebar } from "@/components/admin-sidebar";

export function AdminShell({ children }: { children: ReactNode }) {
  const apiMode = process.env.NEXT_PUBLIC_API_MODE || "real";

  return (
    <AdminAccessGuard>
      <div className="min-h-screen bg-[#f4f1ea] text-ink lg:grid lg:grid-cols-[260px_minmax(0,1fr)]">
        <AdminSidebar />
        <div className="min-w-0">
          <AdminHeader apiMode={apiMode} />
          <main className="min-w-0 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
        </div>
      </div>
    </AdminAccessGuard>
  );
}