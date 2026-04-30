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

  const loadRows = useCallback(async () => {
    try {
      const result = await listEntityRows(entity, entity === "articles" || entity === "leads" ? { status: statusFilter } : entity === "raw-contents" ? { processStatus: statusFilter } : {});
      setRows(result.items);
      setMessage("");
    } catch (error) {
      setMessage(apiFailureMessage(error, "加载列表失败"));
    }
  }, [entity, statusFilter]);

  useEffect(() => {
    void loadRows();
  }, [loadRows]);

  async function mutateArticle(id: string, action: "publish" | "offline") {
    try {
      if (action === "publish") {
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
      <DataTable rows={rows} entity={entity} onPublish={(id) => mutateArticle(id, "publish")} onOffline={(id) => mutateArticle(id, "offline")} onDelete={removeRow} onStatusChange={updateRowStatus} />
    </>
  );
}