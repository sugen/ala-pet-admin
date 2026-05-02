"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, Bot, CheckCircle2, Clock, Database, FileText, LineChart, Newspaper, Shield, Wallet } from "lucide-react";
import { DataTable } from "@/components/data-table";
import { PageTitle } from "@/components/page-title";
import { apiFailureMessage, getAiProviderStatus, getDashboard, type AdminRow, type AIProviderStatus, type DashboardStat } from "@/lib/api";

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

const moduleOverview = [
  { label: "首页头条", source: "articles + headline 标签", status: "运营映射" },
  { label: "快讯日报", source: "articles publish_type=daily", status: "已有入口" },
  { label: "行业指数", source: "indices API", status: "只读入口" },
  { label: "行业榜单", source: "rankings API", status: "只读入口" },
  { label: "报告中心", source: "sample/report 文章", status: "字段缺口" },
  { label: "品牌库", source: "brands API + leads", status: "已有入口" },
  { label: "数据中心", source: "metrics / indices / rankings", status: "开发示例" },
  { label: "投稿合作", source: "leads", status: "已有入口" }
];

export default function DashboardPage() {
  const [dashboard, setDashboard] = useState<{ stats: DashboardStat[]; latestArticles: AdminRow[]; latestLeads: AdminRow[] }>({ stats: [], latestArticles: [], latestLeads: [] });
  const [providerStatus, setProviderStatus] = useState<AIProviderStatus>({ provider: "unknown", status: "loading", model: "", message: "", storageMode: "unknown" });
  const [message, setMessage] = useState("");

  useEffect(() => {
    void getDashboard()
      .then((data) => {
        setDashboard(data);
        setMessage("");
      })
      .catch((error) => setMessage(apiFailureMessage(error, "加载工作台失败")));
    void getAiProviderStatus().then(setProviderStatus);
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
      <section className="mt-6 rounded-md border border-line bg-white p-5 shadow-soft">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="flex items-center gap-2 text-lg font-semibold text-ink"><LineChart className="h-4 w-4 text-gold" />内容运营概览</h2>
            <p className="mt-2 text-sm text-ink/65">对应 Web 首页、快讯、新闻、榜单、指数、报告、数据中心、品牌库和投稿合作。</p>
          </div>
          <span className="rounded border border-line bg-ivory px-3 py-1 text-xs font-medium text-ink/70">D21A module map</span>
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-4">
          {moduleOverview.map((item) => (
            <div key={item.label} className="rounded-md border border-line bg-ivory/50 p-4">
              <p className="text-sm font-semibold text-ink">{item.label}</p>
              <p className="mt-2 text-xs leading-5 text-ink/60">{item.source}</p>
              <span className="mt-3 inline-flex rounded border border-line bg-white px-2 py-1 text-xs text-ink/65">{item.status}</span>
            </div>
          ))}
        </div>
      </section>
      <section className="mt-6 rounded-md border border-line bg-white p-5 shadow-soft">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="flex items-center gap-2 text-lg font-semibold text-ink"><Bot className="h-4 w-4 text-gold" />AI Provider 配置</h2>
            <p className="mt-2 text-sm text-ink/65">{providerStatus.provider} / {providerStatus.status}</p>
          </div>
          <span className="rounded border border-line bg-ivory px-3 py-1 text-xs font-medium text-ink/70">storage: {providerStatus.storageMode}</span>
        </div>
        <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
          <p><span className="font-semibold text-ink">模型：</span>{providerStatus.model || "未配置"}</p>
          <p><span className="font-semibold text-ink">状态说明：</span>{providerStatus.message || "配置可用"}</p>
        </div>
      </section>
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