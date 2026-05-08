"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AdminAccessProvider } from "@/components/admin-access-context";
import { getAdminMe, type AdminMe } from "@/lib/api";
import { clearAdminToken, getAdminToken } from "@/lib/admin-session";

export function AdminAccessGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname() || "/";
  const [me, setMe] = useState<AdminMe | null>(null);

  useEffect(() => {
    if (!getAdminToken()) {
      router.replace("/login");
      return;
    }
    let cancelled = false;
    getAdminMe()
      .then((data) => {
        if (!cancelled) {
          setMe(data);
        }
      })
      .catch(() => {
        if (!cancelled) {
          clearAdminToken();
          router.replace("/login");
        }
      });
    return () => {
      cancelled = true;
    };
  }, [router]);

  if (!me) {
    return <div className="grid min-h-screen place-items-center bg-[#f4f1ea] text-sm font-medium text-ink/60">正在确认登录状态</div>;
  }

  if (!canAccessPath(me, pathname)) {
    return <AccessDenied />;
  }

  return <AdminAccessProvider value={me}>{children}</AdminAccessProvider>;
}

function canAccessPath(me: AdminMe, pathname: string) {
  const normalized = pathname === "/dashboard" ? "/" : pathname;
  return me.menus.some((menu) => {
    if (menu.menuType !== "menu" || !menu.path) return false;
    const menuPath = menu.path === "/dashboard" ? "/" : menu.path;
    return menuPath === "/" ? normalized === "/" : normalized === menuPath || normalized.startsWith(`${menuPath}/`);
  });
}

function AccessDenied() {
  return (
    <div className="grid min-h-screen place-items-center bg-[#f4f1ea] px-6 text-ink">
      <div className="max-w-md rounded-md border border-line bg-white p-8 text-center shadow-soft">
        <p className="text-sm font-semibold uppercase tracking-normal text-ink/45">403</p>
        <h1 className="mt-3 text-2xl font-semibold">无权限访问</h1>
        <p className="mt-3 text-sm leading-6 text-ink/65">当前后台账号没有访问该页面的菜单权限，请联系超级管理员调整角色授权。</p>
      </div>
    </div>
  );
}