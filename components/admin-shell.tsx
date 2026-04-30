import Link from "next/link";
import { sidebarNav } from "@/lib/nav";

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
        <header className="border-b border-line bg-white/75 px-6 py-4 backdrop-blur">
          <p className="text-sm text-ink/65">宠物行业公开信息与趋势观察平台后台</p>
        </header>
        <main className="px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}