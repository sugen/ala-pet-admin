"use client";

import { Bell, LogOut, UserCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAdminAccess } from "@/components/admin-access-context";
import { Button } from "@/components/ui/button";
import { clearAdminToken } from "@/lib/admin-session";

export function AdminHeader({ apiMode }: { apiMode: string }) {
  const router = useRouter();
  const { admin, roles } = useAdminAccess();

  function handleLogout() {
    clearAdminToken();
    router.replace("/login");
  }

  return (
    <header className="flex items-center justify-between gap-4 border-b border-line bg-white/80 px-6 py-4 backdrop-blur">
      <div>
        <p className="text-sm font-semibold text-ink">Ala.pet Admin</p>
        <p className="mt-1 text-xs text-ink/55">宠物行业认证信息发布平台后台</p>
      </div>
      <div className="flex items-center gap-2">
        <span className="hidden rounded-md border border-line px-3 py-1 text-xs font-medium text-ink/65 sm:inline-flex">{apiMode}</span>
        <Button variant="ghost" size="icon" aria-label="通知">
          <Bell className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="sm">
          <UserCircle className="h-4 w-4" />
          {admin.adminName || "当前管理员"}
        </Button>
        <span className="hidden rounded-md bg-[#f4f1ea] px-3 py-1 text-xs font-medium text-ink/65 lg:inline-flex">{roles.map((role) => role.roleName).join("、") || "未分配角色"}</span>
        <Button type="button" variant="ghost" size="sm" onClick={handleLogout}>
          <LogOut className="h-4 w-4" />
          退出登录
        </Button>
      </div>
    </header>
  );
}