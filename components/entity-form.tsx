import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageTitle } from "@/components/page-title";

export function EntityForm({ title, description }: { title: string; description: string }) {
  return (
    <>
      <PageTitle title={title} description={description} />
      <form className="grid max-w-3xl gap-5 rounded-md border border-line bg-white p-6 shadow-soft">
        <label className="grid gap-2 text-sm font-medium text-ink">
          标题或名称
          <input className="h-11 rounded-md border border-line px-3 outline-none focus:border-gold" name="title" required />
        </label>
        <label className="grid gap-2 text-sm font-medium text-ink">
          Slug
          <input className="h-11 rounded-md border border-line px-3 outline-none focus:border-gold" name="slug" />
        </label>
        <label className="grid gap-2 text-sm font-medium text-ink">
          公开来源链接
          <input className="h-11 rounded-md border border-line px-3 outline-none focus:border-gold" name="source_url" type="url" />
        </label>
        <label className="grid gap-2 text-sm font-medium text-ink">
          摘要
          <textarea className="min-h-32 rounded-md border border-line px-3 py-3 outline-none focus:border-gold" name="summary" />
        </label>
        <Button type="submit" className="w-fit">
          <Save className="h-4 w-4" />
          保存
        </Button>
      </form>
    </>
  );
}