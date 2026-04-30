"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/data-table";
import { PageTitle } from "@/components/page-title";
import { listEntityRows, offlineArticle, publishArticle, type AdminRow, type EntityKind } from "@/lib/api";

type EntityPageProps = {
  title: string;
  description: string;
  entity: EntityKind;
  createHref?: string;
};

export function EntityPage({ title, description, entity, createHref }: EntityPageProps) {
  const [rows, setRows] = useState<AdminRow[]>([]);
  const [message, setMessage] = useState("");

  const loadRows = useCallback(async () => {
    try {
      const result = await listEntityRows(entity);
      setRows(result.items);
      setMessage("");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "加载失败");
    }
  }, [entity]);

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
      setMessage(error instanceof Error ? error.message : "操作失败");
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
      {message ? <p className="rounded-md border border-line bg-white p-4 text-sm text-red-700">{message}</p> : null}
      <DataTable rows={rows} entity={entity} onPublish={(id) => mutateArticle(id, "publish")} onOffline={(id) => mutateArticle(id, "offline")} />
    </>
  );
}