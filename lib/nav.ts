import { BarChart3, Bot, Briefcase, FileText, Gauge, Globe2, LayoutDashboard, LineChart, Newspaper, Search, Settings, Tags, Users } from "lucide-react";

export const sidebarNav = [
  { href: "/dashboard", label: "工作台", icon: LayoutDashboard },
  { href: "/articles", label: "内容管理", icon: Newspaper, group: "内容管理" },
  { href: "/raw-contents", label: "原始内容", icon: FileText, group: "内容管理" },
  { href: "/daily", label: "日报管理", icon: FileText, group: "内容管理" },
  { href: "/beauty", label: "美容频道", icon: Tags, group: "内容管理" },
  { href: "/brands", label: "品牌库", icon: Briefcase },
  { href: "/public-voice", label: "声量观察", icon: LineChart },
  { href: "/samples", label: "样本库", icon: Globe2 },
  { href: "/sources", label: "来源管理", icon: Search },
  { href: "/crawl-tasks", label: "采集任务", icon: Gauge },
  { href: "/ai-tasks", label: "AI任务", icon: Bot },
  { href: "/public-events", label: "公开事件", icon: BarChart3 },
  { href: "/leads", label: "线索管理", icon: Users },
  { href: "/seo", label: "SEO管理", icon: Globe2 },
  { href: "/settings", label: "系统设置", icon: Settings }
];