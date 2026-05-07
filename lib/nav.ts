import { BadgeCheck, ClipboardCheck, FileArchive, FileText, LayoutDashboard, ListTree, MessageSquare, Newspaper, ScrollText, ShieldCheck, Users } from "lucide-react";

export const sidebarNav = [
  { href: "/dashboard", label: "控制台", icon: LayoutDashboard, group: "概览" },
  { href: "/users", label: "用户管理", icon: Users, group: "账号" },
  { href: "/navigation-menus", label: "前台菜单管理", icon: ListTree, group: "前台配置" },
  { href: "/organization-applications", label: "机构审核", icon: ClipboardCheck, group: "机构" },
  { href: "/organizations", label: "机构管理", icon: BadgeCheck, group: "机构" },
  { href: "/content-reviews", label: "内容审核", icon: ShieldCheck, group: "内容" },
  { href: "/contents", label: "内容管理", icon: Newspaper, group: "内容" },
  { href: "/comments", label: "评论管理", icon: MessageSquare, group: "互动" },
  { href: "/reports", label: "报告管理", icon: FileText, group: "官方内容" },
  { href: "/files", label: "文件管理", icon: FileArchive, group: "系统" },
  { href: "/operation-logs", label: "操作日志", icon: ScrollText, group: "系统" }
];