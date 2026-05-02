"use client";

import { flexRender, getCoreRowModel, useReactTable, type ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { Ban, CheckCircle2, Eye, Pencil, PauseCircle, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { AdminRow, EntityKind } from "@/lib/api";

type DataTableProps = {
  rows?: AdminRow[];
  entity?: EntityKind;
  isLoading?: boolean;
  emptyText?: string;
  onPublish?: (id: string) => void;
  onOffline?: (id: string) => void;
  onDelete?: (id: string) => void;
  onStatusChange?: (id: string, status: string) => void;
};

export function DataTable({ rows = [], entity, isLoading = false, emptyText = "暂无数据", onPublish, onOffline, onDelete, onStatusChange }: DataTableProps) {
  const baseColumns: ColumnDef<AdminRow>[] = entity === "raw-contents" ? rawContentColumns() : entity === "articles" ? articleColumns() : defaultColumns();
  const columns: ColumnDef<AdminRow>[] = [
    ...baseColumns,
    ...(entity === "articles"
      ? [
          {
            id: "actions",
            header: "操作",
            cell: ({ row }) => (
              <div className="flex flex-wrap gap-2">
                <Button asChild variant="outline" className="h-8 px-2 text-xs">
                  <Link href={`/articles/${row.original.id}/edit`}>
                    <Pencil className="h-3.5 w-3.5" />
                    编辑
                  </Link>
                </Button>
                <Button type="button" variant="outline" className="h-8 px-2 text-xs" onClick={() => onPublish?.(row.original.id)}>
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  发布
                </Button>
                <Button type="button" variant="outline" className="h-8 px-2 text-xs" onClick={() => onOffline?.(row.original.id)}>
                  <PauseCircle className="h-3.5 w-3.5" />
                  下线
                </Button>
              </div>
            )
          } satisfies ColumnDef<AdminRow>
        ]
      : entity === "raw-contents"
        ? [
            {
              id: "actions",
              header: "操作",
              cell: ({ row }) => (
                <Button asChild variant="outline" className="h-8 px-2 text-xs">
                  <Link href={`/raw-contents/${row.original.id}`}>
                    <Eye className="h-3.5 w-3.5" />
                    查看详情
                  </Link>
                </Button>
              )
            } satisfies ColumnDef<AdminRow>
          ]
        : entity === "sources"
          ? [
              {
                id: "actions",
                header: "操作",
                cell: ({ row }) => (
                  <div className="flex flex-wrap gap-2">
                    <Button asChild variant="outline" className="h-8 px-2 text-xs">
                      <Link href={`/sources/${row.original.id}/edit`}>
                        <Pencil className="h-3.5 w-3.5" />
                        编辑
                      </Link>
                    </Button>
                    <Button type="button" variant="outline" className="h-8 px-2 text-xs" onClick={() => onDelete?.(row.original.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                      删除
                    </Button>
                  </div>
                )
              } satisfies ColumnDef<AdminRow>
            ]
        : entity === "leads"
          ? [
              {
                id: "actions",
                header: "操作",
                cell: ({ row }) => (
                  <div className="flex flex-wrap gap-2">
                    <Button type="button" variant="outline" className="h-8 px-2 text-xs" onClick={() => onStatusChange?.(row.original.id, "processing")}>
                      <PauseCircle className="h-3.5 w-3.5" />
                      处理中
                    </Button>
                    <Button type="button" variant="outline" className="h-8 px-2 text-xs" onClick={() => onStatusChange?.(row.original.id, "resolved")}>
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      解决
                    </Button>
                    <Button type="button" variant="outline" className="h-8 px-2 text-xs" onClick={() => onStatusChange?.(row.original.id, "rejected")}>
                      <Ban className="h-3.5 w-3.5" />
                      拒绝
                    </Button>
                    <Button type="button" variant="outline" className="h-8 px-2 text-xs" onClick={() => onStatusChange?.(row.original.id, "spam")}>
                      <Trash2 className="h-3.5 w-3.5" />
                      垃圾
                    </Button>
                  </div>
                )
              } satisfies ColumnDef<AdminRow>
            ]
      : [])
  ];
  const table = useReactTable({ data: rows, columns, getCoreRowModel: getCoreRowModel() });

  return (
    <div className="overflow-hidden rounded-md border border-line bg-white shadow-soft">
      <div className="overflow-x-auto">
      <table className="min-w-[860px] w-full border-collapse text-left text-sm">
        <thead className="bg-ink text-ivory">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th key={header.id} className="whitespace-nowrap px-4 py-3 font-medium">
                  {flexRender(header.column.columnDef.header, header.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {isLoading ? (
            <tr>
              <td className="px-4 py-8 text-center text-ink/55" colSpan={columns.length}>
                正在加载列表...
              </td>
            </tr>
          ) : table.getRowModel().rows.length ? (
            table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="border-t border-line">
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-4 py-3 align-top text-ink/75">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td className="px-4 py-8 text-center text-ink/55" colSpan={columns.length}>
                {emptyText}
              </td>
            </tr>
          )}
        </tbody>
      </table>
      </div>
    </div>
  );
}

function defaultColumns(): ColumnDef<AdminRow>[] {
  return [
    { accessorKey: "id", header: "ID", cell: ({ row }) => <TruncatedText value={row.original.id} className="max-w-[88px] font-medium text-ink" /> },
    { accessorKey: "name", header: "名称", cell: ({ row }) => <TruncatedText value={row.original.name} className="max-w-[360px] font-medium text-ink" /> },
    { accessorKey: "status", header: "状态", cell: ({ row }) => <StatusBadge value={row.original.status} /> },
    { accessorKey: "owner", header: "负责人", cell: ({ row }) => <TruncatedText value={row.original.owner} className="max-w-[160px]" /> },
    { accessorKey: "updatedAt", header: "更新时间", cell: ({ row }) => <TruncatedText value={row.original.updatedAt} className="max-w-[160px]" /> }
  ];
}

function articleColumns(): ColumnDef<AdminRow>[] {
  return [
    { accessorKey: "id", header: "ID", cell: ({ row }) => <TruncatedText value={row.original.id} className="max-w-[76px] font-medium text-ink" /> },
    { accessorKey: "name", header: "标题", cell: ({ row }) => <TruncatedText value={row.original.name} className="max-w-[300px] font-medium text-ink" /> },
    { accessorKey: "publishType", header: "频道", cell: ({ row }) => <TypeBadge value={row.original.publishType || "news"} /> },
    { accessorKey: "status", header: "状态", cell: ({ row }) => <StatusBadge value={row.original.status} /> },
    { accessorKey: "sourceType", header: "来源类型", cell: ({ row }) => <TruncatedText value={row.original.sourceType ?? "-"} className="max-w-[120px]" /> },
    { accessorKey: "riskLevel", header: "风险", cell: ({ row }) => <TruncatedText value={row.original.riskLevel ?? row.original.copyrightRisk ?? "-"} className="max-w-[88px]" /> },
    { accessorKey: "updatedAt", header: "更新时间", cell: ({ row }) => <TruncatedText value={row.original.updatedAt} className="max-w-[150px]" /> }
  ];
}

function rawContentColumns(): ColumnDef<AdminRow>[] {
  return [
    { accessorKey: "id", header: "ID", cell: ({ row }) => <TruncatedText value={row.original.id} className="max-w-[88px] font-medium text-ink" /> },
    { accessorKey: "name", header: "标题", cell: ({ row }) => <TruncatedText value={row.original.name} className="max-w-[320px] font-medium text-ink" /> },
    { accessorKey: "owner", header: "来源", cell: ({ row }) => <TruncatedText value={row.original.owner} className="max-w-[180px]" /> },
    { accessorKey: "sourceUrl", header: "原文链接", cell: ({ row }) => <TruncatedText value={row.original.sourceUrl ?? ""} className="max-w-[280px]" /> },
    { accessorKey: "status", header: "处理状态", cell: ({ row }) => <StatusBadge value={row.original.status} /> },
    { accessorKey: "riskLevel", header: "风险", cell: ({ row }) => <TruncatedText value={row.original.riskLevel ?? ""} className="max-w-[120px]" /> },
    { accessorKey: "updatedAt", header: "创建时间", cell: ({ row }) => <TruncatedText value={row.original.updatedAt} className="max-w-[160px]" /> }
  ];
}

function TruncatedText({ value, className = "" }: { value: string; className?: string }) {
  return <span className={`block truncate ${className}`} title={value}>{value || "-"}</span>;
}

function StatusBadge({ value }: { value: string }) {
  const normalized = value || "unknown";
  const labelMap: Record<string, string> = {
    draft: "草稿",
    ai_generated: "AI 已生成",
    risk_blocked: "风险拦截",
    published: "已发布",
    offline: "已下线",
    pending: "待处理",
    processing: "处理中",
    processed: "已处理",
    article_generated: "已生成文章",
    failed: "失败",
    duplicate: "重复",
    blocked: "已拦截",
    resolved: "已解决",
    rejected: "已拒绝",
    spam: "垃圾线索"
  };
  const toneMap: Record<string, string> = {
    published: "border-evergreen/25 bg-evergreen/10 text-evergreen",
    ai_generated: "border-gold/40 bg-gold/15 text-ink",
    draft: "border-line bg-ivory text-ink/70",
    risk_blocked: "border-red-200 bg-red-50 text-red-700",
    failed: "border-red-200 bg-red-50 text-red-700",
    blocked: "border-red-200 bg-red-50 text-red-700",
    offline: "border-line bg-muted text-ink/55",
    article_generated: "border-evergreen/25 bg-evergreen/10 text-evergreen",
    processed: "border-evergreen/25 bg-evergreen/10 text-evergreen",
    processing: "border-gold/40 bg-gold/15 text-ink",
    resolved: "border-evergreen/25 bg-evergreen/10 text-evergreen",
    rejected: "border-red-200 bg-red-50 text-red-700",
    spam: "border-red-200 bg-red-50 text-red-700"
  };
  return <span className={`inline-flex rounded px-2 py-1 text-xs font-medium ${toneMap[normalized] ?? "border-line bg-ivory text-ink/70"}`}>{labelMap[normalized] ?? normalized}</span>;
}

function TypeBadge({ value }: { value: string }) {
  const labelMap: Record<string, string> = {
    news: "动态",
    daily: "快讯",
    beauty: "洗护",
    sample: "报告/样本",
    brand: "品牌",
    metric: "数据"
  };
  return <span className="inline-flex rounded border border-line bg-ivory px-2 py-1 text-xs font-medium text-ink/70">{labelMap[value] ?? value}</span>;
}