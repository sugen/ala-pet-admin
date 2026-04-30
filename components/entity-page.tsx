import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/data-table";
import { PageTitle } from "@/components/page-title";
import { listEntityRows, type EntityKind } from "@/lib/api";

type EntityPageProps = {
  title: string;
  description: string;
  entity: EntityKind;
  createHref?: string;
};

export async function EntityPage({ title, description, entity, createHref }: EntityPageProps) {
  const rows = await listEntityRows(entity);

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
      <DataTable rows={rows.items} />
    </>
  );
}