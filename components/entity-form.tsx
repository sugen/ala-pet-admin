"use client";

import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { PageTitle } from "@/components/page-title";
import { getEntity, submitEntity, type EntityKind } from "@/lib/api";

const entitySchema = z.object({
  title: z.string().min(2, "请填写标题或名称"),
  slug: z.string().optional(),
  source_name: z.string().optional(),
  source_url: z.string().url("请填写有效链接").optional().or(z.literal("")),
  summary: z.string().optional(),
  content: z.string().optional(),
  publish_type: z.enum(["news", "daily", "beauty", "observer", "brand", "sample", "metric"]),
  risk_level: z.enum(["low", "medium", "high"]),
  beauty_channel: z.enum(["none", "news", "products", "stores", "mobile-grooming", "groomers", "trends"]),
  status: z.enum(["draft", "published", "offline"])
});

type EntityFormValues = z.infer<typeof entitySchema>;

export function EntityForm({ title, description, entity, id }: { title: string; description: string; entity: EntityKind; id?: string }) {
  const [message, setMessage] = useState("");
  const router = useRouter();
  const form = useForm<EntityFormValues>({
    resolver: zodResolver(entitySchema),
    defaultValues: { title: "", slug: "", source_name: "后台手动创建", source_url: "", summary: "", content: "", publish_type: "news", risk_level: "low", beauty_channel: "none", status: "draft" }
  });

  useEffect(() => {
    if (!id) {
      return;
    }
    void getEntity(entity, id)
      .then((item) => {
        form.reset({
          title: String(item.title ?? item.name ?? ""),
          slug: String(item.slug ?? ""),
          source_name: String(item.sourceName ?? item.source_name ?? "后台手动创建"),
          source_url: String(item.sourceUrl ?? item.source_url ?? ""),
          summary: String(item.summary ?? ""),
          content: String(item.content ?? ""),
          publish_type: (String(item.publishType ?? item.publish_type ?? "news") as EntityFormValues["publish_type"]),
          risk_level: (String(item.riskLevel ?? item.risk_level ?? "low") as EntityFormValues["risk_level"]),
          beauty_channel: (String(item.beautyChannel || item.beauty_channel || "none") as EntityFormValues["beauty_channel"]),
          status: (String(item.status ?? "draft") as EntityFormValues["status"])
        });
      })
      .catch((error) => setMessage(error instanceof Error ? error.message : "加载失败"));
  }, [entity, form, id]);

  async function onSubmit(values: EntityFormValues) {
    try {
      const payload = { ...values, beauty_channel: values.beauty_channel === "none" ? "none" : values.beauty_channel };
      const result = await submitEntity(entity, payload, id);
      setMessage(result.accepted ? "保存成功" : "保存失败");
      if (result.accepted && !id) {
        router.push(`/${entity}`);
        router.refresh();
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "保存失败");
    }
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
          来源名称
          <input className="h-11 rounded-md border border-line px-3 outline-none focus:border-gold" {...form.register("source_name")} />
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
        <label className="grid gap-2 text-sm font-medium text-ink">
          正文
          <textarea className="min-h-48 rounded-md border border-line px-3 py-3 outline-none focus:border-gold" {...form.register("content")} />
        </label>
        <div className="grid gap-4 sm:grid-cols-3">
          <label className="grid gap-2 text-sm font-medium text-ink">
            类型
            <select className="h-11 rounded-md border border-line px-3 outline-none focus:border-gold" {...form.register("publish_type")}>
              <option value="news">动态</option>
              <option value="beauty">美容</option>
              <option value="daily">日报</option>
              <option value="observer">观察</option>
              <option value="brand">品牌</option>
              <option value="sample">样本</option>
              <option value="metric">声量</option>
            </select>
          </label>
          <label className="grid gap-2 text-sm font-medium text-ink">
            风险等级
            <select className="h-11 rounded-md border border-line px-3 outline-none focus:border-gold" {...form.register("risk_level")}>
              <option value="low">低</option>
              <option value="medium">中</option>
              <option value="high">高</option>
            </select>
          </label>
          <label className="grid gap-2 text-sm font-medium text-ink">
            美容栏目
            <select className="h-11 rounded-md border border-line px-3 outline-none focus:border-gold" {...form.register("beauty_channel")}>
              <option value="none">无</option>
              <option value="news">美容动态</option>
              <option value="products">洗护用品</option>
              <option value="stores">门店洗美</option>
              <option value="mobile-grooming">上门洗护</option>
              <option value="groomers">美容师</option>
              <option value="trends">趋势</option>
            </select>
          </label>
          <label className="grid gap-2 text-sm font-medium text-ink">
            状态
            <select className="h-11 rounded-md border border-line px-3 outline-none focus:border-gold" {...form.register("status")}>
              <option value="draft">草稿</option>
              <option value="published">已发布</option>
              <option value="offline">已下线</option>
            </select>
          </label>
        </div>
        <Button type="submit" className="w-fit" disabled={form.formState.isSubmitting}>
          <Save className="h-4 w-4" />
          {form.formState.isSubmitting ? "保存中" : "保存"}
        </Button>
        {message ? <p className="text-sm text-evergreen">{message}</p> : null}
      </form>
    </>
  );
}