"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, Bot, CheckCircle2, Clock, Database, FileText, LineChart, Newspaper, Shield, Wallet } from "lucide-react";
import { DataTable } from "@/components/data-table";
import { PageTitle } from "@/components/page-title";
import { getDashboard, type AdminRow, type DashboardStat } from "@/lib/api";

const statIcons = [
  Database,
  Newspaper,
  CheckCircle2,
  Shield,
  Wallet,
  AlertTriangle,
  LineChart,
  Bot
];

export default function DashboardPage() {
  const [dashboard, setDashboard] = useState<{ stats: DashboardStat[]; latestArticles: AdminRow[]; latestLeads: AdminRow[] }>({ stats: [], latestArticles: [], latestLeads: [] });
  const [message, setMessage] = useState("");

  useEffect(() => {
    void getDashboard()
      .then((data) => {
        setDashboard(data);
        setMessage("");
      })
      .catch((error) => setMessage(error instanceof Error ? error.message : "加载失败"));
  }, []);

  return (
    <>
      <PageTitle title="工作台" description="采集、生成、发布、风险、成本、来源和 AI 任务状态概览。" />
      {message ? <p className="rounded-md border border-line bg-white p-4 text-sm text-red-700">{message}</p> : null}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {dashboard.stats.map((item, index) => {
          const Icon = statIcons[index] ?? Database;
          return (
            <div key={item.label} className="rounded-md border border-line bg-white p-5 shadow-soft">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm text-ink/60">{item.label}</p>
                <Icon className="h-4 w-4 text-gold" />
              </div>
              <p className="mt-4 text-3xl font-semibold text-ink">{item.value}</p>
            </div>
          );
        })}
      </div>
      <section className="mt-8 grid gap-6 xl:grid-cols-2">
        <div>
          <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold"><Clock className="h-4 w-4 text-gold" />最新动态</h2>
          <DataTable rows={dashboard.latestArticles} />
        </div>
        <div>
          <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold"><FileText className="h-4 w-4 text-gold" />最新线索</h2>
          <DataTable rows={dashboard.latestLeads} />
        </div>
      </section>
    </>
  );
}