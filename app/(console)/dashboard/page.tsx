"use client";

import { useEffect, useState } from "react";
import { BadgeCheck, ClipboardCheck, FileText, ListTree, MessageSquare, Newspaper, ScrollText, ShieldCheck } from "lucide-react";
import { DataTable } from "@/components/data-table";
import { PageTitle } from "@/components/page-title";
import { apiFailureMessage, getDashboard, type AdminRow, type DashboardStat } from "@/lib/api";

const statIcons = [ClipboardCheck, BadgeCheck, ShieldCheck, Newspaper, MessageSquare, FileText, ListTree, ScrollText];

export default function DashboardPage() {
  const [dashboard, setDashboard] = useState<{ stats: DashboardStat[]; latestContents: AdminRow[]; latestApplications: AdminRow[] }>({ stats: [], latestContents: [], latestApplications: [] });
  const [message, setMessage] = useState("");

  useEffect(() => {
    void getDashboard()
      .then((data) => {
        setDashboard(data);
        setMessage("");
      })
      .catch((error) => setMessage(apiFailureMessage(error, "加载控制台失败")));
  }, []);

  return (
    <>
      <PageTitle title="控制台" description="认证机构号、内容审核、前台菜单、评论、报告和操作日志的第一版 MVP 概览。" />
      {message ? <p className="rounded-md border border-line bg-white p-4 text-sm text-red-700">{message}</p> : null}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {dashboard.stats.map((item, index) => {
          const Icon = statIcons[index] ?? ClipboardCheck;
          return <div key={item.label} className="rounded-md border border-line bg-white p-5 shadow-soft"><div className="flex items-center justify-between gap-3"><p className="text-sm text-ink/60">{item.label}</p><Icon className="h-4 w-4 text-gold" /></div><p className="mt-4 text-3xl font-semibold text-ink">{item.value}</p></div>;
        })}
      </div>
      <section className="mt-6 rounded-md border border-line bg-white p-5 shadow-soft">
        <h2 className="text-lg font-semibold text-ink">第一版业务边界</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-4">
          {[
            ["机构先认证", "申请通过后获得蓝V或官方认证"],
            ["内容先审核", "资讯、快讯、动态、活动审核后展示"],
            ["报告官方发", "报告仅平台官方发布并绑定文件"],
            ["菜单后台控", "前台菜单通过 is_visible 控制显隐"]
          ].map(([title, text]) => <article key={title} className="rounded-md border border-line bg-ivory/55 p-4"><p className="font-semibold text-ink">{title}</p><p className="mt-2 text-xs leading-5 text-ink/60">{text}</p></article>)}
        </div>
      </section>
      <section className="mt-8 grid gap-6 xl:grid-cols-2">
        <div>
          <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold"><Newspaper className="h-4 w-4 text-gold" />最新内容</h2>
          <DataTable rows={dashboard.latestContents} />
        </div>
        <div>
          <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold"><ClipboardCheck className="h-4 w-4 text-gold" />最新机构申请</h2>
          <DataTable rows={dashboard.latestApplications} />
        </div>
      </section>
    </>
  );
}