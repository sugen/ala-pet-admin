"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/data-table";
import { PageTitle } from "@/components/page-title";
import { apiFailureMessage, deleteEntity, listEntityRows, offlineArticle, publishArticle, submitEntity, type AdminRow, type EntityKind } from "@/lib/api";

type EntityPageProps = {
  title: string;
  description: string;
  entity: EntityKind;
  createHref?: string;
};

export function EntityPage({ title, description, entity, createHref }: EntityPageProps) {
  const [rows, setRows] = useState<AdminRow[]>([]);
  const [message, setMessage] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const loadRows = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await listEntityRows(entity, entity === "articles" || entity === "leads" ? { status: statusFilter } : entity === "raw-contents" ? { processStatus: statusFilter } : {});
      setRows(result.items);
      setMessage("");
    } catch (error) {
      setMessage(apiFailureMessage(error, "加载列表失败"));
    } finally {
      setIsLoading(false);
    }
  }, [entity, statusFilter]);

  useEffect(() => {
    void loadRows();
  }, [loadRows]);

  async function mutateArticle(id: string, action: "publish" | "offline") {
    try {
      if (action === "publish") {
        if (!window.confirm("确认已完成来源、版权风险和人工审核检查，并发布这篇文章？")) {
          return;
        }
        await publishArticle(id);
      } else {
        await offlineArticle(id);
      }
      await loadRows();
    } catch (error) {
      setMessage(apiFailureMessage(error, "文章操作失败"));
    }
  }

  async function removeRow(id: string) {
    try {
      await deleteEntity(entity, id);
      await loadRows();
    } catch (error) {
      setMessage(apiFailureMessage(error, "删除记录失败"));
    }
  }

  async function updateRowStatus(id: string, status: string) {
    try {
      await submitEntity(entity, { status, handled_by: 1 }, id);
      await loadRows();
      setMessage("处理状态已更新");
    } catch (error) {
      setMessage(apiFailureMessage(error, "状态更新失败"));
    }
  }

  const emptyText = message && rows.length === 0
    ? "当前列表加载失败，请查看上方错误提示。"
    : statusFilter
      ? "当前筛选条件下暂无匹配记录。"
      : "暂无数据。";

  return (
    <>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <PageTitle title={title} description={description} />
        {createHref ? (
          <Button asChild>
            <Link href={createHref}>
              <Plus className="h-4 w-4" />
              新建
            </Link>
          </Button>
        ) : null}
      </div>
      <ModuleMapNotice entity={entity} />
      {entity === "articles" || entity === "raw-contents" || entity === "leads" ? (
        <div className="flex max-w-xs flex-col gap-2 text-sm font-medium text-ink">
          状态筛选
          <select className="h-10 rounded-md border border-line bg-white px-3 outline-none focus:border-gold" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
            {entity === "articles" ? (
              <>
                <option value="">全部状态</option>
                <option value="draft">草稿</option>
                <option value="ai_generated">AI 已生成</option>
                <option value="risk_blocked">风险拦截</option>
                <option value="published">已发布</option>
                <option value="offline">已下线</option>
              </>
            ) : entity === "leads" ? (
              <>
                <option value="">全部处理状态</option>
                <option value="pending">待处理</option>
                <option value="processing">处理中</option>
                <option value="resolved">已解决</option>
                <option value="rejected">已拒绝</option>
                <option value="spam">垃圾线索</option>
              </>
            ) : (
              <>
                <option value="">全部处理状态</option>
                <option value="pending">待处理</option>
                <option value="processing">处理中</option>
                <option value="processed">已处理</option>
                <option value="failed">失败</option>
                <option value="duplicate">重复</option>
                <option value="blocked">已拦截</option>
              </>
            )}
          </select>
        </div>
      ) : null}
      {message ? <p className="rounded-md border border-line bg-white p-4 text-sm text-red-700">{message}</p> : null}
      <DataTable rows={rows} entity={entity} isLoading={isLoading} emptyText={emptyText} onPublish={(id) => mutateArticle(id, "publish")} onOffline={(id) => mutateArticle(id, "offline")} onDelete={removeRow} onStatusChange={updateRowStatus} />
    </>
  );
}

function ModuleMapNotice({ entity }: { entity: EntityKind }) {
  const map: Partial<Record<EntityKind, { title: string; text: string }>> = {
    articles: { title: "前台对应：首页头条 / 动态 / 快讯 / 报告 / 专题 / 推荐位", text: "头条、推荐、专题暂用 seo_keywords 标签；快讯使用 publish_type=daily；报告样本使用 publish_type=sample + source_type=report；demo/sample 不进入正式新闻流。" },
    brands: { title: "前台对应：品牌库 / 首页品牌精选 / 品牌榜", text: "品牌资料展示公开字段；纠错和新增品牌由投稿合作进入线索管理。" },
    indices: { title: "前台对应：行业指数 / 首页指数 / 数据中心", text: "当前为只读入口；正式编辑、规则、审核和版本管理待后续补齐。" },
    rankings: { title: "前台对应：榜单中心 / 首页热榜 / 品牌榜", text: "当前为只读入口；正式榜单规则、人工审核和发布流程待后续补齐。" },
    "raw-contents": { title: "前台对应：数据中心来源链路", text: "原始内容只作为处理链路和证据来源，不直接进入正式新闻流。" },
    samples: { title: "前台对应：报告中心 / 数据中心样本资料", text: "样本资料必须保留来源、公开链接和审核边界。" },
    leads: { title: "前台对应：投稿合作", text: "前台 /submit-brand 提交的品牌资料、纠错和合作线索在此处理。" },
    "public-voice": { title: "前台对应：数据趋势", text: "公开指标和趋势卡片只用于行业观察，不构成排名或商业评价。" }
  };
  const item = map[entity];
  if (!item) {
    return null;
  }
  return (
    <div className="rounded-md border border-line bg-white p-4 text-sm shadow-soft">
      <p className="font-semibold text-ink">{item.title}</p>
      <p className="mt-2 leading-6 text-ink/65">{item.text}</p>
    </div>
  );
}