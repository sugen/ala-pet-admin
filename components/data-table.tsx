"use client";

import { flexRender, getCoreRowModel, useReactTable, type ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { Ban, CheckCircle2, Eye, Pencil, PauseCircle, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { AdminRow, EntityKind } from "@/lib/api";

type DataTableProps = {
  rows?: AdminRow[];
  entity?: EntityKind;
  onPublish?: (id: string) => void;
  onOffline?: (id: string) => void;
  onDelete?: (id: string) => void;
  onStatusChange?: (id: string, status: string) => void;
};

export function DataTable({ rows = [], entity, onPublish, onOffline, onDelete, onStatusChange }: DataTableProps) {
  const baseColumns: ColumnDef<AdminRow>[] = entity === "raw-contents" ? rawContentColumns() : defaultColumns();
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
      <table className="w-full border-collapse text-left text-sm">
        <thead className="bg-ink text-ivory">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th key={header.id} className="px-4 py-3 font-medium">
                  {flexRender(header.column.columnDef.header, header.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.length ? (
            table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="border-t border-line">
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-4 py-3 text-ink/75">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td className="px-4 py-8 text-center text-ink/55" colSpan={columns.length}>
                暂无数据
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function defaultColumns(): ColumnDef<AdminRow>[] {
  return [
    { accessorKey: "id", header: "ID" },
    { accessorKey: "name", header: "名称" },
    { accessorKey: "status", header: "状态", cell: ({ row }) => <StatusBadge value={row.original.status} /> },
    { accessorKey: "owner", header: "负责人" },
    { accessorKey: "updatedAt", header: "更新时间" }
  ];
}

function rawContentColumns(): ColumnDef<AdminRow>[] {
  return [
    { accessorKey: "id", header: "ID" },
    { accessorKey: "name", header: "标题" },
    { accessorKey: "owner", header: "来源" },
    { accessorKey: "sourceUrl", header: "原文链接", cell: ({ row }) => <span className="line-clamp-1 break-all">{row.original.sourceUrl}</span> },
    { accessorKey: "status", header: "处理状态", cell: ({ row }) => <StatusBadge value={row.original.status} /> },
    { accessorKey: "riskLevel", header: "风险" },
    { accessorKey: "updatedAt", header: "创建时间" }
  ];
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