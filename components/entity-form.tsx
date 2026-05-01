"use client";

import { type ReactNode, useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { PageTitle } from "@/components/page-title";
import { apiFailureMessage, getEntity, submitEntity, type EntityKind } from "@/lib/api";

const entitySchema = z.object({
  title: z.string().min(2, "请填写标题或名称"),
  slug: z.string().optional(),
  source_name: z.string().optional(),
  source_url: z.string().url("请填写有效链接").optional().or(z.literal("")),
  original_title: z.string().optional(),
  source_type: z.enum(["unknown", "web", "rss", "brand", "exhibition", "report", "association", "government", "other"]),
  rewrite_method: z.enum(["manual", "ai_rewrite", "mock_rewrite", "summary_rewrite"]),
  cover_image_url: z.string().optional(),
  cover_image_source: z.enum(["ai_generated", "mock_generated", "oss", "local"]),
  copyright_risk: z.enum(["low", "medium", "high"]),
  compliance_notes: z.string().optional(),
  human_review_required: z.boolean(),
  summary: z.string().optional(),
  content: z.string().optional(),
  publish_type: z.enum(["news", "daily", "beauty", "observer", "brand", "sample", "metric"]),
  risk_level: z.enum(["low", "medium", "high"]),
  beauty_channel: z.enum(["none", "news", "products", "stores", "mobile-grooming", "groomers", "trends"]),
  status: z.enum(["draft", "ai_generated", "risk_blocked", "published", "offline"])
});

type EntityFormValues = z.infer<typeof entitySchema>;

export function EntityForm({ title, description, entity, id }: { title: string; description: string; entity: EntityKind; id?: string }) {
  const [message, setMessage] = useState("");
  const router = useRouter();
  const form = useForm<EntityFormValues>({
    resolver: zodResolver(entitySchema),
    defaultValues: { title: "", slug: "", source_name: "后台手动创建", source_url: "", original_title: "", source_type: "unknown", rewrite_method: "manual", cover_image_url: "", cover_image_source: "mock_generated", copyright_risk: "medium", compliance_notes: "", human_review_required: true, summary: "", content: "", publish_type: "news", risk_level: "low", beauty_channel: "none", status: "draft" }
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
          original_title: String(item.originalTitle ?? item.original_title ?? ""),
          source_type: (String(item.sourceType ?? item.source_type ?? "unknown") as EntityFormValues["source_type"]),
          rewrite_method: (String(item.rewriteMethod ?? item.rewrite_method ?? "manual") as EntityFormValues["rewrite_method"]),
          cover_image_url: String(item.coverImageUrl ?? item.cover_image_url ?? ""),
          cover_image_source: (String(item.coverImageSource ?? item.cover_image_source ?? "mock_generated") as EntityFormValues["cover_image_source"]),
          copyright_risk: (String(item.copyrightRisk ?? item.copyright_risk ?? item.riskLevel ?? item.risk_level ?? "medium") as EntityFormValues["copyright_risk"]),
          compliance_notes: String(item.complianceNotes ?? item.compliance_notes ?? ""),
          human_review_required: Boolean(item.humanReviewRequired ?? item.human_review_required ?? true),
          summary: String(item.summary ?? ""),
          content: String(item.content ?? ""),
          publish_type: (String(item.publishType ?? item.publish_type ?? "news") as EntityFormValues["publish_type"]),
          risk_level: (String(item.riskLevel ?? item.risk_level ?? "low") as EntityFormValues["risk_level"]),
          beauty_channel: (String(item.beautyChannel || item.beauty_channel || "none") as EntityFormValues["beauty_channel"]),
          status: (String(item.status ?? "draft") as EntityFormValues["status"])
        });
      })
      .catch((error) => setMessage(apiFailureMessage(error, "加载记录失败")));
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
      setMessage(apiFailureMessage(error, "保存失败"));
    }
  }

  return (
    <>
      <PageTitle title={title} description={description} />
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid max-w-3xl gap-5 rounded-md border border-line bg-white p-6 shadow-soft">
        <FormSection title="基础内容" description="先填写文章主体、栏目归属和展示状态。">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2 text-sm font-medium text-ink">
              标题或名称
              <input className="h-11 rounded-md border border-line px-3 outline-none focus:border-gold" {...form.register("title")} />
              {form.formState.errors.title ? <span className="text-xs text-red-700">{form.formState.errors.title.message}</span> : null}
            </label>
            <label className="grid gap-2 text-sm font-medium text-ink">
              Slug
              <input className="h-11 rounded-md border border-line px-3 outline-none focus:border-gold" {...form.register("slug")} />
            </label>
          </div>
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
                <option value="ai_generated">AI 已生成</option>
                <option value="risk_blocked">风险拦截</option>
                <option value="published">已发布</option>
                <option value="offline">已下线</option>
              </select>
            </label>
          </div>
          <label className="grid gap-2 text-sm font-medium text-ink">
            摘要
            <textarea className="min-h-32 rounded-md border border-line px-3 py-3 outline-none focus:border-gold" {...form.register("summary")} />
          </label>
          <label className="grid gap-2 text-sm font-medium text-ink">
            正文
            <textarea className="min-h-48 rounded-md border border-line px-3 py-3 outline-none focus:border-gold" {...form.register("content")} />
          </label>
        </FormSection>

        <FormSection title="来源信息" description="保留来源追踪信息，便于人工复核和后续追溯。">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2 text-sm font-medium text-ink">
              来源名称
              <input className="h-11 rounded-md border border-line px-3 outline-none focus:border-gold" {...form.register("source_name")} />
            </label>
            <label className="grid gap-2 text-sm font-medium text-ink">
              公开来源链接
              <input className="h-11 rounded-md border border-line px-3 outline-none focus:border-gold" type="url" {...form.register("source_url")} />
              <span className="text-xs font-normal text-ink/55">填写公开来源原始链接，便于审核追溯和来源校验。</span>
              {form.formState.errors.source_url ? <span className="text-xs text-red-700">{form.formState.errors.source_url.message}</span> : null}
            </label>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2 text-sm font-medium text-ink">
              原始标题
              <input className="h-11 rounded-md border border-line px-3 outline-none focus:border-gold" {...form.register("original_title")} />
            </label>
            <label className="grid gap-2 text-sm font-medium text-ink">
              来源类型
              <select className="h-11 rounded-md border border-line px-3 outline-none focus:border-gold" {...form.register("source_type")}>
                <option value="unknown">unknown</option>
                <option value="web">web</option>
                <option value="rss">rss</option>
                <option value="brand">brand</option>
                <option value="exhibition">exhibition</option>
                <option value="report">report</option>
                <option value="association">association</option>
                <option value="government">government</option>
                <option value="other">other</option>
              </select>
            </label>
          </div>
          <label className="grid gap-2 text-sm font-medium text-ink">
            生成方式
            <select className="h-11 rounded-md border border-line px-3 outline-none focus:border-gold" {...form.register("rewrite_method")}>
              <option value="manual">manual</option>
              <option value="ai_rewrite">ai_rewrite</option>
              <option value="mock_rewrite">mock_rewrite</option>
              <option value="summary_rewrite">summary_rewrite</option>
            </select>
          </label>
        </FormSection>

        <FormSection title="封面与展示" description="维护前台封面素材和展示来源，不在这里处理来源原图。">
          <label className="grid gap-2 text-sm font-medium text-ink">
            封面图
            <input className="h-11 rounded-md border border-line px-3 outline-none focus:border-gold" {...form.register("cover_image_url")} />
          </label>
          <label className="grid gap-2 text-sm font-medium text-ink">
            封面来源
            <select className="h-11 rounded-md border border-line px-3 outline-none focus:border-gold" {...form.register("cover_image_source")}>
              <option value="mock_generated">mock_generated</option>
              <option value="ai_generated">ai_generated</option>
              <option value="oss">oss</option>
              <option value="local">local</option>
            </select>
          </label>
        </FormSection>

        <FormSection title="合规与审核" description="发布前核对风险等级、版权风险和人工审核要求。">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2 text-sm font-medium text-ink">
              风险等级
              <select className="h-11 rounded-md border border-line px-3 outline-none focus:border-gold" {...form.register("risk_level")}>
                <option value="low">低</option>
                <option value="medium">中</option>
                <option value="high">高</option>
              </select>
            </label>
            <label className="grid gap-2 text-sm font-medium text-ink">
              版权风险
              <select className="h-11 rounded-md border border-line px-3 outline-none focus:border-gold" {...form.register("copyright_risk")}>
                <option value="low">low</option>
                <option value="medium">medium</option>
                <option value="high">high</option>
              </select>
              <span className="text-xs font-normal text-ink/55">按公开来源使用风险评估；高风险内容不应直接发布。</span>
            </label>
          </div>
          <label className="grid gap-2 text-sm font-medium text-ink">
            合规说明
            <textarea className="min-h-24 rounded-md border border-line px-3 py-3 outline-none focus:border-gold" {...form.register("compliance_notes")} />
          </label>
          <div className="rounded-md border border-line px-3 py-3 text-sm text-ink">
            <label className="flex items-center gap-3 font-medium">
              <input type="checkbox" className="h-4 w-4" {...form.register("human_review_required")} />
              发布前需要人工审核
            </label>
            <p className="mt-2 text-xs text-ink/55">保留勾选，表示发布前仍需人工确认来源、改写边界和合规结论。</p>
          </div>
        </FormSection>

        <Button type="submit" className="w-fit" disabled={form.formState.isSubmitting}>
          <Save className="h-4 w-4" />
          {form.formState.isSubmitting ? "保存中" : "保存"}
        </Button>
        {message ? <p className="text-sm text-evergreen">{message}</p> : null}
      </form>
    </>
  );
}

function FormSection({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  return (
    <section className="grid gap-4 rounded-md border border-line bg-ivory/35 p-4">
      <div>
        <h2 className="text-base font-semibold text-ink">{title}</h2>
        <p className="mt-1 text-sm text-ink/60">{description}</p>
      </div>
      {children}
    </section>
  );
}