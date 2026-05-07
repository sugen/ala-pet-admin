"use client";

import { flexRender, getCoreRowModel, useReactTable, type ColumnDef } from "@tanstack/react-table";
import { CheckCircle2, EyeOff, PauseCircle, RotateCcw, Trash2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { AdminRow, EntityKind } from "@/lib/api";

type DataTableProps = {
  rows?: AdminRow[];
  entity?: EntityKind;
  isLoading?: boolean;
  emptyText?: string;
  onAction?: (id: string, action: string) => void;
};

export function DataTable({ rows = [], entity, isLoading = false, emptyText = "暂无数据", onAction }: DataTableProps) {
  const baseColumns = columnsFor(entity);
  const actionColumn: ColumnDef<AdminRow>[] = entity ? [{ id: "actions", header: "操作", cell: ({ row }) => <ActionButtons entity={entity} id={row.original.id} onAction={onAction} /> }] : [];
  const table = useReactTable({ data: rows, columns: [...baseColumns, ...actionColumn], getCoreRowModel: getCoreRowModel() });

  return (
    <div className="overflow-hidden rounded-md border border-line bg-white shadow-soft">
      <div className="overflow-x-auto">
        <table className="min-w-[920px] w-full border-collapse text-left text-sm">
          <thead className="bg-ink text-ivory">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>{headerGroup.headers.map((header) => <th key={header.id} className="whitespace-nowrap px-4 py-3 font-medium">{flexRender(header.column.columnDef.header, header.getContext())}</th>)}</tr>
            ))}
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td className="px-4 py-8 text-center text-ink/55" colSpan={table.getAllColumns().length}>正在加载列表...</td></tr>
            ) : table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => <tr key={row.id} className="border-t border-line">{row.getVisibleCells().map((cell) => <td key={cell.id} className="px-4 py-3 align-top text-ink/75">{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>)}</tr>)
            ) : (
              <tr><td className="px-4 py-8 text-center text-ink/55" colSpan={table.getAllColumns().length}>{emptyText}</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function columnsFor(entity?: EntityKind): ColumnDef<AdminRow>[] {
  const columns: ColumnDef<AdminRow>[] = [
    { accessorKey: "id", header: "ID", cell: ({ row }) => <TruncatedText value={row.original.id} className="max-w-[88px] font-medium text-ink" /> },
    { accessorKey: "name", header: nameHeader(entity), cell: ({ row }) => <TruncatedText value={row.original.name} className="max-w-[340px] font-medium text-ink" /> },
    { accessorKey: "status", header: "状态", cell: ({ row }) => <StatusBadge value={row.original.status} /> },
    { accessorKey: "owner", header: ownerHeader(entity), cell: ({ row }) => <TruncatedText value={row.original.owner} className="max-w-[170px]" /> }
  ];
  if (entity === "navigation-menus") {
    columns.splice(2, 0, { accessorKey: "path", header: "路径", cell: ({ row }) => <TruncatedText value={row.original.path ?? ""} className="max-w-[180px]" /> });
  }
  if (entity === "organizations") {
    columns.splice(2, 0, { accessorKey: "slug", header: "机构主页 slug", cell: ({ row }) => <TruncatedText value={row.original.slug ?? ""} className="max-w-[170px]" /> });
  }
  if (entity === "users") {
    columns.splice(2, 0, { accessorKey: "email", header: "邮箱", cell: ({ row }) => <TruncatedText value={row.original.email ?? ""} className="max-w-[190px]" /> });
    columns.splice(3, 0, { accessorKey: "role", header: "角色", cell: ({ row }) => <TruncatedText value={row.original.role ?? ""} className="max-w-[150px]" /> });
  }
  if (entity && ["contents", "content-reviews", "organization-applications", "reports", "files", "comments"].includes(entity)) {
    columns.splice(2, 0, { accessorKey: "type", header: "类型", cell: ({ row }) => <TypeBadge value={row.original.type ?? "-"} /> });
  }
  columns.push({ accessorKey: "updatedAt", header: "更新时间", cell: ({ row }) => <TruncatedText value={row.original.updatedAt} className="max-w-[160px]" /> });
  return columns;
}

function ActionButtons({ entity, id, onAction }: { entity: EntityKind; id: string; onAction?: (id: string, action: string) => void }) {
  const actions: Partial<Record<EntityKind, Array<{ label: string; action: string; icon: typeof CheckCircle2 }>>> = {
    "organization-applications": [{ label: "通过", action: "approve", icon: CheckCircle2 }, { label: "拒绝", action: "reject", icon: XCircle }],
    "content-reviews": [{ label: "通过", action: "approve", icon: CheckCircle2 }, { label: "拒绝", action: "reject", icon: XCircle }],
    contents: [{ label: "下线", action: "offline", icon: PauseCircle }],
    comments: [{ label: "隐藏", action: "hide", icon: EyeOff }, { label: "删除", action: "delete", icon: Trash2 }],
    "navigation-menus": [{ label: "显示", action: "show", icon: CheckCircle2 }, { label: "隐藏", action: "hide", icon: EyeOff }],
    reports: [{ label: "发布", action: "publish", icon: CheckCircle2 }, { label: "下线", action: "offline", icon: PauseCircle }],
    organizations: [{ label: "启用", action: "enable", icon: CheckCircle2 }, { label: "停用", action: "disable", icon: PauseCircle }],
    files: [{ label: "停用", action: "disable", icon: PauseCircle }],
    users: [{ label: "重置", action: "reset-password", icon: RotateCcw }]
  };
  const items = actions[entity] ?? [];
  if (!items.length) return <span className="text-ink/40">-</span>;
  return <div className="flex flex-wrap gap-2">{items.map((item) => { const Icon = item.icon; return <Button key={item.action} type="button" variant="outline" className="h-8 px-2 text-xs" onClick={() => onAction?.(id, item.action)}><Icon className="h-3.5 w-3.5" />{item.label}</Button>; })}</div>;
}

function nameHeader(entity?: EntityKind) {
  if (entity === "comments") return "评论内容";
  if (entity === "operation-logs") return "操作";
  return "名称";
}

function ownerHeader(entity?: EntityKind) {
  if (entity === "comments") return "评论人";
  if (entity === "contents" || entity === "content-reviews") return "机构";
  if (entity === "operation-logs") return "操作人";
  return "负责人";
}

function TruncatedText({ value, className = "" }: { value: string; className?: string }) {
  return <span className={`block truncate ${className}`} title={value}>{value || "-"}</span>;
}

function StatusBadge({ value }: { value: string }) {
  const normalized = value || "unknown";
  const labelMap: Record<string, string> = {
    active: "启用",
    visible: "可见",
    hidden: "隐藏",
    verified: "已认证",
    pending: "待审核",
    reviewing: "审核中",
    approved: "已通过",
    rejected: "已拒绝",
    published: "已发布",
    offline: "已下线",
    draft: "草稿",
    success: "成功"
  };
  const toneMap: Record<string, string> = {
    active: "border-evergreen/25 bg-evergreen/10 text-evergreen",
    visible: "border-evergreen/25 bg-evergreen/10 text-evergreen",
    verified: "border-evergreen/25 bg-evergreen/10 text-evergreen",
    approved: "border-evergreen/25 bg-evergreen/10 text-evergreen",
    published: "border-evergreen/25 bg-evergreen/10 text-evergreen",
    success: "border-evergreen/25 bg-evergreen/10 text-evergreen",
    pending: "border-gold/40 bg-gold/15 text-ink",
    reviewing: "border-gold/40 bg-gold/15 text-ink",
    rejected: "border-red-200 bg-red-50 text-red-700",
    hidden: "border-line bg-muted text-ink/55",
    offline: "border-line bg-muted text-ink/55"
  };
  return <span className={`inline-flex rounded px-2 py-1 text-xs font-medium ${toneMap[normalized] ?? "border-line bg-ivory text-ink/70"}`}>{labelMap[normalized] ?? normalized}</span>;
}

function TypeBadge({ value }: { value: string }) {
  return <span className="inline-flex rounded border border-line bg-ivory px-2 py-1 text-xs font-medium text-ink/70">{value}</span>;
}