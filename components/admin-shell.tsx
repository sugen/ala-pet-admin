import Link from "next/link";
import { Bell, UserCircle } from "lucide-react";
import { sidebarNav } from "@/lib/nav";
import { Button } from "@/components/ui/button";

export function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f4f1ea] text-ink lg:grid lg:grid-cols-[260px_1fr]">
      <aside className="border-r border-line bg-ink px-4 py-5 text-ivory">
        <Link href="/dashboard" className="block text-lg font-semibold">
          Ala.pet Admin
        </Link>
        <nav className="mt-7 grid gap-1 text-sm">
          {sidebarNav.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href} className="flex items-center gap-3 rounded-md px-3 py-2 text-ivory/75 transition-colors hover:bg-ivory/10 hover:text-gold">
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>
      <div>
        <header className="flex items-center justify-between gap-4 border-b border-line bg-white/75 px-6 py-4 backdrop-blur">
          <div>
            <p className="text-sm font-semibold text-ink">宠物行业公开信息与趋势观察平台后台</p>
            <p className="mt-1 text-xs text-ink/55">内容审核、采集任务、AI 任务和系统配置</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden rounded-md border border-line px-3 py-1 text-xs font-medium text-ink/65 sm:inline-flex">mock</span>
            <Button variant="ghost" size="icon" aria-label="通知">
              <Bell className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm">
              <UserCircle className="h-4 w-4" />
              管理员
            </Button>
          </div>
        </header>
        <main className="px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}