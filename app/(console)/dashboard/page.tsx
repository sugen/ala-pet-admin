import { AlertTriangle, Bot, CheckCircle2, Clock, Database, FileText, LineChart, Newspaper, Shield, Wallet } from "lucide-react";
import { DataTable } from "@/components/data-table";
import { PageTitle } from "@/components/page-title";

const stats = [
  { label: "今日采集数量", value: "0", icon: Database },
  { label: "今日生成文章", value: "0", icon: Newspaper },
  { label: "今日发布数量", value: "0", icon: CheckCircle2 },
  { label: "今日风险拦截", value: "0", icon: Shield },
  { label: "今日 AI 成本", value: "0.00", icon: Wallet },
  { label: "采集失败任务", value: "0", icon: AlertTriangle },
  { label: "来源健康状态", value: "0", icon: LineChart },
  { label: "AI任务状态", value: "0", icon: Bot }
];

export default function DashboardPage() {
  return (
    <>
      <PageTitle title="工作台" description="采集、生成、发布、风险、成本、来源和 AI 任务状态概览。" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((item) => {
          const Icon = item.icon;
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
          <DataTable />
        </div>
        <div>
          <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold"><FileText className="h-4 w-4 text-gold" />最新线索</h2>
          <DataTable />
        </div>
      </section>
    </>
  );
}