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
  seo_title: z.string().optional(),
  seo_description: z.string().optional(),
  seo_keywords: z.string().optional(),
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
  const [activeTab, setActiveTab] = useState("basic");
  const router = useRouter();
  const form = useForm<EntityFormValues>({
    resolver: zodResolver(entitySchema),
    defaultValues: { title: "", slug: "", source_name: "后台手动创建", source_url: "", original_title: "", source_type: "unknown", rewrite_method: "manual", cover_image_url: "", cover_image_source: "mock_generated", copyright_risk: "medium", compliance_notes: "", seo_title: "", seo_description: "", seo_keywords: "", human_review_required: true, summary: "", content: "", publish_type: "news", risk_level: "low", beauty_channel: "none", status: "draft" }
  });

  const tabs = [
    { id: "basic", label: "基础内容" },
    { id: "source", label: "来源信息" },
    { id: "placement", label: "运营标记" },
    { id: "cover", label: "封面展示" },
    { id: "compliance", label: "合规审核" },
    { id: "seo", label: "SEO 标签" }
  ];

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
          seo_title: String(item.seoTitle ?? item.seo_title ?? ""),
          seo_description: String(item.seoDescription ?? item.seo_description ?? ""),
          seo_keywords: formatSeoKeywords(item.seoKeywords ?? item.seo_keywords),
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
      const payload = { ...values, beauty_channel: values.beauty_channel === "none" ? "none" : values.beauty_channel, seo_keywords: parseSeoKeywords(values.seo_keywords) };
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
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid max-w-5xl gap-5 rounded-md border border-line bg-white p-5 shadow-soft sm:p-6">
        <div className="flex gap-2 overflow-x-auto border-b border-line pb-3" role="tablist" aria-label="文章编辑分区">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.id}
              className={`min-w-fit rounded border px-3 py-2 text-sm font-medium ${activeTab === tab.id ? "border-evergreen bg-evergreen text-white" : "border-line bg-ivory text-ink/70 hover:border-gold"}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "basic" ? <FormSection title="基础内容" description="先填写文章主体、栏目归属和展示状态。">
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
        </FormSection> : null}

        {activeTab === "source" ? <FormSection title="来源信息" description="保留来源追踪信息，便于人工复核和后续追溯。">
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
        </FormSection> : null}

        {activeTab === "placement" ? <FormSection title="运营标记" description="D21A 不新增数据库字段，先用现有字段承载前台首页、快讯、报告和专题位置。">
          <div className="grid gap-4 md:grid-cols-2">
            <PlacementCard title="首页主头条" text="publish_type=news，seo_keywords 添加 headline；状态必须为 published，发布前需人工审核。" />
            <PlacementCard title="首页推荐 / 右侧栏" text="seo_keywords 添加 recommended；可被首页次头条、右侧推荐或专题卡片使用。" />
            <PlacementCard title="快讯 / 日报" text="publish_type=daily；如需独立 newsflash 类型，后续需要新增字段或枚举。" />
            <PlacementCard title="报告 / 专题" text="publish_type=sample，source_type=report，seo_keywords 可添加 topic、report。" />
          </div>
          <div className="rounded-md border border-line bg-ivory/60 p-4 text-sm leading-7 text-ink/65">
            头条、推荐、专题当前属于运营约定，不是强约束字段。保存时请在 SEO 关键词中写入对应标签；缺口已同步记录到 WEB_ADMIN_MODULE_MAP.md。
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2 text-sm font-medium text-ink">
              类型映射
              <select className="h-11 rounded-md border border-line px-3 outline-none focus:border-gold" {...form.register("publish_type")}>
                <option value="news">动态 / 首页资讯</option>
                <option value="daily">快讯 / 日报</option>
                <option value="beauty">洗护专题</option>
                <option value="sample">报告 / 样本</option>
                <option value="brand">品牌内容</option>
                <option value="metric">数据内容</option>
                <option value="observer">观察</option>
              </select>
            </label>
            <label className="grid gap-2 text-sm font-medium text-ink">
              运营标签
              <textarea className="min-h-24 rounded-md border border-line px-3 py-3 outline-none focus:border-gold" placeholder="headline，recommended，topic，report" {...form.register("seo_keywords")} />
              <span className="text-xs font-normal text-ink/55">可用标签：headline、recommended、topic、report、newsflash。</span>
            </label>
          </div>
        </FormSection> : null}

        {activeTab === "cover" ? <FormSection title="封面与展示" description="维护前台封面素材和展示来源，不在这里处理来源原图。">
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
        </FormSection> : null}

        {activeTab === "compliance" ? <FormSection title="合规与审核" description="发布前核对风险等级、版权风险和人工审核要求。">
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
        </FormSection> : null}

        {activeTab === "seo" ? <FormSection title="SEO 标签" description="维护文章搜索展示信息，关键词将按逗号或换行转换为数组保存。">
          <label className="grid gap-2 text-sm font-medium text-ink">
            SEO 标题
            <input className="h-11 rounded-md border border-line px-3 outline-none focus:border-gold" {...form.register("seo_title")} />
          </label>
          <label className="grid gap-2 text-sm font-medium text-ink">
            SEO 描述
            <textarea className="min-h-28 rounded-md border border-line px-3 py-3 outline-none focus:border-gold" {...form.register("seo_description")} />
          </label>
          <label className="grid gap-2 text-sm font-medium text-ink">
            SEO 关键词
            <textarea className="min-h-24 rounded-md border border-line px-3 py-3 outline-none focus:border-gold" placeholder="宠物美容，洗护用品，行业观察" {...form.register("seo_keywords")} />
            <span className="text-xs font-normal text-ink/55">支持中文逗号、英文逗号或换行分隔，提交时会保存为 seo_keywords 数组。</span>
          </label>
        </FormSection> : null}

        <div className="sticky bottom-4 z-10 flex flex-col gap-3 rounded-md border border-line bg-white/95 p-3 shadow-soft backdrop-blur sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-ink/55">当前分区：{tabs.find((tab) => tab.id === activeTab)?.label}</p>
          <div className="flex flex-wrap items-center gap-3">
            {message ? <p className="text-sm text-evergreen">{message}</p> : null}
            <Button type="submit" className="w-fit" disabled={form.formState.isSubmitting}>
              <Save className="h-4 w-4" />
              {form.formState.isSubmitting ? "保存中" : "保存"}
            </Button>
          </div>
        </div>
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

function PlacementCard({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-md border border-line bg-white p-4 text-sm">
      <p className="font-semibold text-ink">{title}</p>
      <p className="mt-2 leading-6 text-ink/65">{text}</p>
    </div>
  );
}

function parseSeoKeywords(value?: string) {
  return (value ?? "")
    .split(/[，,\n]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function formatSeoKeywords(value: unknown) {
  if (Array.isArray(value)) {
    return value.map((item) => String(item)).filter(Boolean).join("，");
  }
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) {
      return "";
    }
    try {
      const parsed = JSON.parse(trimmed) as unknown;
      if (Array.isArray(parsed)) {
        return parsed.map((item) => String(item)).filter(Boolean).join("，");
      }
    } catch {
      return trimmed;
    }
    return trimmed;
  }
  return "";
}