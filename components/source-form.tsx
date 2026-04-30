"use client";

import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { PageTitle } from "@/components/page-title";
import { Button } from "@/components/ui/button";
import { apiFailureMessage, getEntity, submitEntity } from "@/lib/api";

const sourceSchema = z.object({
  name: z.string().min(2, "请填写来源名称"),
  source_type: z.enum(["news", "industry", "exhibition", "brand", "rss", "report", "government", "association", "other"]),
  base_url: z.string().url("请填写有效站点地址"),
  rss_url: z.string().url("请填写有效 RSS 地址").optional().or(z.literal("")),
  credibility_level: z.enum(["high", "medium", "low"]),
  robots_allowed: z.boolean(),
  status: z.enum(["active", "paused", "disabled"])
});

type SourceFormValues = z.infer<typeof sourceSchema>;

export function SourceForm({ id }: { id?: string }) {
  const [message, setMessage] = useState("");
  const router = useRouter();
  const form = useForm<SourceFormValues>({
    resolver: zodResolver(sourceSchema),
    defaultValues: { name: "", source_type: "other", base_url: "", rss_url: "", credibility_level: "medium", robots_allowed: true, status: "active" }
  });

  useEffect(() => {
    if (!id) {
      return;
    }
    void getEntity("sources", id)
      .then((item) => {
        form.reset({
          name: String(item.name ?? ""),
          source_type: (String(item.source_type ?? "other") as SourceFormValues["source_type"]),
          base_url: String(item.base_url ?? ""),
          rss_url: String(item.rss_url ?? ""),
          credibility_level: (String(item.credibility_level ?? "medium") as SourceFormValues["credibility_level"]),
          robots_allowed: Boolean(item.robots_allowed ?? true),
          status: (String(item.status ?? "active") as SourceFormValues["status"])
        });
      })
      .catch((error) => setMessage(apiFailureMessage(error, "加载来源失败")));
  }, [form, id]);

  async function onSubmit(values: SourceFormValues) {
    try {
      const result = await submitEntity("sources", values, id);
      setMessage(result.accepted ? "保存成功" : "保存失败");
      if (result.accepted && !id) {
        router.push("/sources");
        router.refresh();
      }
    } catch (error) {
      setMessage(apiFailureMessage(error, "保存来源失败"));
    }
  }

  return (
    <>
      <PageTitle title={id ? "编辑来源" : "创建来源"} description="维护公开来源、RSS 地址、可信度和采集状态。" />
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid max-w-3xl gap-5 rounded-md border border-line bg-white p-6 shadow-soft">
        <label className="grid gap-2 text-sm font-medium text-ink">
          来源名称
          <input className="h-11 rounded-md border border-line px-3 outline-none focus:border-gold" {...form.register("name")} />
          {form.formState.errors.name ? <span className="text-xs text-red-700">{form.formState.errors.name.message}</span> : null}
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="grid gap-2 text-sm font-medium text-ink">
            来源类型
            <select className="h-11 rounded-md border border-line px-3 outline-none focus:border-gold" {...form.register("source_type")}>
              <option value="news">新闻</option>
              <option value="industry">行业</option>
              <option value="exhibition">展会</option>
              <option value="brand">品牌</option>
              <option value="rss">RSS</option>
              <option value="report">报告</option>
              <option value="government">政府</option>
              <option value="association">协会</option>
              <option value="other">其他</option>
            </select>
          </label>
          <label className="grid gap-2 text-sm font-medium text-ink">
            可信度
            <select className="h-11 rounded-md border border-line px-3 outline-none focus:border-gold" {...form.register("credibility_level")}>
              <option value="high">高</option>
              <option value="medium">中</option>
              <option value="low">低</option>
            </select>
          </label>
        </div>
        <label className="grid gap-2 text-sm font-medium text-ink">
          站点地址
          <input className="h-11 rounded-md border border-line px-3 outline-none focus:border-gold" type="url" {...form.register("base_url")} />
          {form.formState.errors.base_url ? <span className="text-xs text-red-700">{form.formState.errors.base_url.message}</span> : null}
        </label>
        <label className="grid gap-2 text-sm font-medium text-ink">
          RSS 地址
          <input className="h-11 rounded-md border border-line px-3 outline-none focus:border-gold" type="url" {...form.register("rss_url")} />
          {form.formState.errors.rss_url ? <span className="text-xs text-red-700">{form.formState.errors.rss_url.message}</span> : null}
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="grid gap-2 text-sm font-medium text-ink">
            状态
            <select className="h-11 rounded-md border border-line px-3 outline-none focus:border-gold" {...form.register("status")}>
              <option value="active">启用</option>
              <option value="paused">暂停</option>
              <option value="disabled">禁用</option>
            </select>
          </label>
          <label className="flex items-center gap-3 pt-7 text-sm font-medium text-ink">
            <input className="h-4 w-4 accent-gold" type="checkbox" {...form.register("robots_allowed")} />
            robots 允许采集
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