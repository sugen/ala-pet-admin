"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Save } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { PageTitle } from "@/components/page-title";
import { submitEntity, type EntityKind } from "@/lib/api";

const entitySchema = z.object({
  title: z.string().min(2, "请填写标题或名称"),
  slug: z.string().optional(),
  source_url: z.string().url("请填写有效链接").optional().or(z.literal("")),
  summary: z.string().optional()
});

type EntityFormValues = z.infer<typeof entitySchema>;

export function EntityForm({ title, description, entity }: { title: string; description: string; entity: EntityKind }) {
  const [message, setMessage] = useState("");
  const form = useForm<EntityFormValues>({
    resolver: zodResolver(entitySchema),
    defaultValues: { title: "", slug: "", source_url: "", summary: "" }
  });

  async function onSubmit(values: EntityFormValues) {
    const result = await submitEntity(entity, values);
    setMessage(result.accepted ? "已保存为第一版骨架数据" : "保存失败");
  }

  return (
    <>
      <PageTitle title={title} description={description} />
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid max-w-3xl gap-5 rounded-md border border-line bg-white p-6 shadow-soft">
        <label className="grid gap-2 text-sm font-medium text-ink">
          标题或名称
          <input className="h-11 rounded-md border border-line px-3 outline-none focus:border-gold" {...form.register("title")} />
          {form.formState.errors.title ? <span className="text-xs text-red-700">{form.formState.errors.title.message}</span> : null}
        </label>
        <label className="grid gap-2 text-sm font-medium text-ink">
          Slug
          <input className="h-11 rounded-md border border-line px-3 outline-none focus:border-gold" {...form.register("slug")} />
        </label>
        <label className="grid gap-2 text-sm font-medium text-ink">
          公开来源链接
          <input className="h-11 rounded-md border border-line px-3 outline-none focus:border-gold" type="url" {...form.register("source_url")} />
          {form.formState.errors.source_url ? <span className="text-xs text-red-700">{form.formState.errors.source_url.message}</span> : null}
        </label>
        <label className="grid gap-2 text-sm font-medium text-ink">
          摘要
          <textarea className="min-h-32 rounded-md border border-line px-3 py-3 outline-none focus:border-gold" {...form.register("summary")} />
        </label>
        <Button type="submit" className="w-fit" disabled={form.formState.isSubmitting}>
          <Save className="h-4 w-4" />
          {form.formState.isSubmitting ? "保存中" : "保存"}
        </Button>
        {message ? <p className="text-sm text-evergreen">{message}</p> : null}
      </form>
    </>
  );
}