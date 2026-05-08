"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BadgeCheck, CalendarDays, Circle, ClipboardCheck, FileArchive, FileText, LayoutDashboard, ListTree, MessageSquare, Newspaper, ScrollText, Settings, ShieldCheck, UserCog, Users } from "lucide-react";
import { useAdminAccess } from "@/components/admin-access-context";

const iconMap = {
  BadgeCheck,
  CalendarDays,
  ClipboardCheck,
  FileArchive,
  FileText,
  LayoutDashboard,
  ListTree,
  MessageSquare,
  Newspaper,
  ScrollText,
  Settings,
  ShieldCheck,
  UserCog,
  Users
};

export function AdminSidebar() {
  const pathname = usePathname() || "/";
  const { menus } = useAdminAccess();
  const visibleMenus = menus.filter((item) => item.menuType === "menu" && item.isVisible && item.path).sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <aside className="border-r border-line bg-ink px-4 py-5 text-ivory">
      <Link href="/" className="block text-lg font-semibold">
        Ala.pet Admin
      </Link>
      <nav className="mt-7 grid gap-1 text-sm" aria-label="后台主菜单">
        {visibleMenus.map((item, index) => {
          const Icon = iconMap[item.icon as keyof typeof iconMap] ?? Circle;
          const group = groupForMenu(item.menuCode);
          const previousGroup = visibleMenus[index - 1] ? groupForMenu(visibleMenus[index - 1].menuCode) : "";
          const showGroup = group && previousGroup !== group;
          const isActive = item.path === "/" ? pathname === "/" || pathname === "/dashboard" : pathname.startsWith(item.path);
          return (
            <div key={item.id}>
              {showGroup ? <p className="mt-3 px-3 text-[11px] font-semibold uppercase tracking-normal text-ivory/40">{group}</p> : null}
              <Link href={item.path} className={`flex items-center gap-3 rounded-md px-3 py-2 transition-colors ${isActive ? "bg-ivory/12 text-gold" : "text-ivory/75 hover:bg-ivory/10 hover:text-gold"}`}>
                <Icon className="h-4 w-4" />
                <span>{item.menuName}</span>
              </Link>
            </div>
          );
        })}
      </nav>
    </aside>
  );
}

function groupForMenu(menuCode: string) {
  if (menuCode === "dashboard") return "概览";
  if (["users", "admin_accounts", "admin_roles"].includes(menuCode)) return "账号与权限";
  if (["navigation_menus", "system_settings"].includes(menuCode)) return "配置";
  if (["organization_reviews", "organizations"].includes(menuCode)) return "机构";
  if (["content_reviews", "contents", "events"].includes(menuCode)) return "内容";
  if (menuCode === "comments") return "互动";
  if (["reports", "files"].includes(menuCode)) return "官方内容";
  if (menuCode === "operation_logs") return "系统";
  return "其他";
}