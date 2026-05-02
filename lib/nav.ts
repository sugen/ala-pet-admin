import { BarChart3, Bot, Briefcase, FileText, Gauge, Globe2, LayoutDashboard, LineChart, Newspaper, Search, Settings, Tags, Users } from "lucide-react";

export const sidebarNav = [
  { href: "/dashboard", label: "工作台", icon: LayoutDashboard },
  { href: "/articles", label: "头条 / 动态", icon: Newspaper, group: "Web 内容" },
  { href: "/daily", label: "快讯 / 日报", icon: FileText, group: "Web 内容" },
  { href: "/beauty", label: "洗护专题", icon: Tags, group: "Web 内容" },
  { href: "/samples", label: "报告 / 样本", icon: Globe2, group: "Web 内容" },
  { href: "/brands", label: "品牌库", icon: Briefcase, group: "Web 内容" },
  { href: "/indices", label: "行业指数", icon: LineChart, group: "Web 数据" },
  { href: "/rankings", label: "行业榜单", icon: BarChart3, group: "Web 数据" },
  { href: "/public-voice", label: "数据趋势", icon: LineChart, group: "Web 数据" },
  { href: "/leads", label: "投稿合作", icon: Users, group: "线索" },
  { href: "/raw-contents", label: "原始内容", icon: FileText, group: "生产链路" },
  { href: "/sources", label: "来源管理", icon: Search },
  { href: "/crawl-tasks", label: "采集任务", icon: Gauge },
  { href: "/ai-tasks", label: "AI任务", icon: Bot },
  { href: "/public-events", label: "公开事件", icon: BarChart3 },
  { href: "/seo", label: "SEO管理", icon: Globe2 },
  { href: "/settings", label: "系统设置", icon: Settings }
];