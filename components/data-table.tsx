"use client";

import { flexRender, getCoreRowModel, useReactTable, type ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { CheckCircle2, Pencil, PauseCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { AdminRow, EntityKind } from "@/lib/api";

type DataTableProps = {
  rows?: AdminRow[];
  entity?: EntityKind;
  onPublish?: (id: string) => void;
  onOffline?: (id: string) => void;
};

export function DataTable({ rows = [], entity, onPublish, onOffline }: DataTableProps) {
  const columns: ColumnDef<AdminRow>[] = [
    { accessorKey: "id", header: "ID" },
    { accessorKey: "name", header: "名称" },
    { accessorKey: "status", header: "状态" },
    { accessorKey: "owner", header: "负责人" },
    { accessorKey: "updatedAt", header: "更新时间" },
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