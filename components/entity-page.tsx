"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { DataTable } from "@/components/data-table";
import { PageTitle } from "@/components/page-title";
import { apiFailureMessage, deleteEntity, entityAction, listEntityRows, submitEntity, type AdminRow, type EntityKind } from "@/lib/api";

type EntityPageProps = {
  title: string;
  description: string;
  entity: EntityKind;
};

const statusOptions: Partial<Record<EntityKind, Array<{ value: string; label: string }>>> = {
  "organization-applications": [
    { value: "pending", label: "待审核" },
    { value: "reviewing", label: "审核中" },
    { value: "approved", label: "已通过" },
    { value: "rejected", label: "已拒绝" }
  ],
  "content-reviews": [
    { value: "pending", label: "待审核" },
    { value: "approved", label: "已通过" },
    { value: "rejected", label: "已拒绝" }
  ],
  contents: [
    { value: "draft", label: "草稿" },
    { value: "pending_review", label: "待审核" },
    { value: "published", label: "已发布" },
    { value: "offline", label: "已下线" }
  ],
  comments: [
    { value: "visible", label: "可见" },
    { value: "hidden", label: "已隐藏" },
    { value: "deleted", label: "已删除" }
  ],
  reports: [
    { value: "draft", label: "草稿" },
    { value: "published", label: "已发布" },
    { value: "offline", label: "已下线" }
  ]
};

export function EntityPage({ title, description, entity }: EntityPageProps) {
  const [rows, setRows] = useState<AdminRow[]>([]);
  const [message, setMessage] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const filters = useMemo(() => statusOptions[entity] ?? [], [entity]);

  const loadRows = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await listEntityRows(entity, statusFilter ? { status: statusFilter } : {});
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

  async function handleAction(id: string, action: string) {
    try {
      if (action === "delete") {
        await deleteEntity(entity, id);
      } else if (action === "show" || action === "hide") {
        await submitEntity(entity, { status: action === "show" ? "visible" : "hidden", is_visible: action === "show" }, id);
      } else if (action === "offline") {
        await entityAction(entity, id, "offline");
      } else {
        await entityAction(entity, id, action);
      }
      await loadRows();
      setMessage("操作已完成");
    } catch (error) {
      setMessage(apiFailureMessage(error, "操作失败"));
    }
  }

  const emptyText = message && rows.length === 0 ? "当前列表加载失败，请查看上方错误提示。" : statusFilter ? "当前筛选条件下暂无匹配记录。" : "暂无数据。";

  return (
    <>
      <PageTitle title={title} description={description} />
      <ModuleNotice entity={entity} />
      {filters.length ? (
        <div className="flex max-w-xs flex-col gap-2 text-sm font-medium text-ink">
          状态筛选
          <select className="h-10 rounded-md border border-line bg-white px-3 outline-none focus:border-gold" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
            <option value="">全部状态</option>
            {filters.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
          </select>
        </div>
      ) : null}
      {message ? <p className="rounded-md border border-line bg-white p-4 text-sm text-ink/70">{message}</p> : null}
      <DataTable rows={rows} entity={entity} isLoading={isLoading} emptyText={emptyText} onAction={handleAction} />
    </>
  );
}

function ModuleNotice({ entity }: { entity: EntityKind }) {
  const map: Partial<Record<EntityKind, { title: string; text: string }>> = {
    "navigation-menus": { title: "前台菜单只用 is_visible 控制显隐", text: "第一版没有二级菜单；首页、洞察、活动、报告、行业号、关于由后台排序和开关控制。" },
    "organization-applications": { title: "机构审核通过后生成认证机构号", text: "机构主页 slug 可编辑，但内容关联必须使用 organization_id，不使用 slug 作为业务外键。" },
    "content-reviews": { title: "内容必须审核后展示", text: "资讯、快讯、动态和活动都进入内容审核；通过后才进入前台。" },
    reports: { title: "报告仅平台官方发布", text: "第一版机构号不发布报告；报告附件通过文件管理维护。" },
    comments: { title: "评论可隐藏或删除", text: "一级评论和二级回复都由评论管理统一处理，前台只展示可见评论。" }
  };
  const item = map[entity];
  if (!item) return null;
  return <div className="rounded-md border border-line bg-white p-4 text-sm shadow-soft"><p className="font-semibold text-ink">{item.title}</p><p className="mt-2 leading-6 text-ink/65">{item.text}</p></div>;
}