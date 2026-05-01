export type AdminRow = {
  id: string;
  name: string;
  status: string;
  owner: string;
  updatedAt: string;
  slug?: string;
  publishType?: string;
  sourceUrl?: string;
  sourceType?: string;
  originalTitle?: string;
  rewriteMethod?: string;
  coverImageUrl?: string;
  coverImageSource?: string;
  copyrightRisk?: string;
  complianceNotes?: string;
  humanReviewRequired?: boolean;
  riskLevel?: string;
  contentHash?: string;
};

export type DashboardStat = {
  label: string;
  value: string;
};

export type SettingRow = AdminRow & {
  configKey: string;
  configValue: string;
  valueType: string;
  description: string;
};

export type EntityKind =
  | "articles"
  | "daily"
  | "beauty"
  | "brands"
  | "public-voice"
  | "samples"
  | "sources"
  | "crawl-tasks"
  | "ai-tasks"
  | "raw-contents"
  | "public-events"
  | "leads"
  | "seo"
  | "settings";

type ApiResponse<T> = {
  code: number;
  message: string;
  data: T;
  request_id?: string;
};

type ListResponse<T> = {
  items: T[];
  total: number;
};

type LoginResponse = {
  token: string;
  token_type: string;
  expires_at?: string;
};

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "";
const apiMode = process.env.NEXT_PUBLIC_API_MODE || "real";
if (process.env.NODE_ENV === "production" && apiMode === "mock") {
  throw new Error("NEXT_PUBLIC_API_MODE=mock is not allowed in production. Use NEXT_PUBLIC_API_MODE=real.");
}
const resolvedApiBaseUrl = apiBaseUrl || "http://127.0.0.1:8080";
const tokenStorageKey = "ala-pet-admin-token";

const mockRows: Record<EntityKind, AdminRow[]> = {
  articles: [
    { id: "ART-001", name: "宠物洗护门店关注标准化服务体验", status: "草稿", owner: "内容组", updatedAt: "2026-04-30 17:20" },
    { id: "ART-002", name: "洗护用品企业展示功能型护理方案", status: "待审核", owner: "美容频道", updatedAt: "2026-04-30 16:48" }
  ],
  daily: [
    { id: "DAY-20260430", name: "阿拉宠日报｜2026-04-30", status: "待生成", owner: "调度任务", updatedAt: "2026-04-30 08:00" }
  ],
  beauty: [
    { id: "BEA-001", name: "门店洗美公开动态", status: "已发布", owner: "美容频道", updatedAt: "2026-04-30 15:12" },
    { id: "BEA-002", name: "功能型洗护趋势观察", status: "草稿", owner: "美容频道", updatedAt: "2026-04-29 18:31" }
  ],
  brands: [
    { id: "BRD-001", name: "样例宠物洗护", status: "已发布", owner: "品牌库", updatedAt: "2026-04-30 14:10" },
    { id: "BRD-002", name: "样例功能洗护", status: "待审核", owner: "品牌库", updatedAt: "2026-04-29 11:05" }
  ],
  "public-voice": [
    { id: "MET-001", name: "美容公开提及", status: "已计算", owner: "声量观察", updatedAt: "2026-04-30 10:00" }
  ],
  samples: [
    { id: "SMP-001", name: "门店洗美服务流程公开样本", status: "已收录", owner: "样本库", updatedAt: "2026-04-30 09:30" }
  ],
  sources: [
    { id: "SRC-001", name: "中国国际宠物水族展官网", status: "启用", owner: "采集组", updatedAt: "2026-04-30 12:00" },
    { id: "SRC-002", name: "公开行业资讯样例源", status: "启用", owner: "采集组", updatedAt: "2026-04-29 10:20" }
  ],
  "crawl-tasks": [
    { id: "CRL-001", name: "美容关键词采集", status: "待执行", owner: "Crawler", updatedAt: "2026-04-30 07:30" },
    { id: "CRL-002", name: "RSS 来源采集", status: "运行中", owner: "Crawler", updatedAt: "2026-04-30 17:05" }
  ],
  "ai-tasks": [
    { id: "AI-001", name: "事实抽取与摘要", status: "成功", owner: "AI Worker", updatedAt: "2026-04-30 16:10" },
    { id: "AI-002", name: "合规检查", status: "排队中", owner: "AI Worker", updatedAt: "2026-04-30 16:42" }
  ],
  "raw-contents": [
    { id: "RAW-001", name: "宠物美容测试公开动态", status: "pending", owner: "本地公开测试源", updatedAt: "2026-04-30 22:58", sourceUrl: "http://127.0.0.1:18091/public-source.html", riskLevel: "unknown" }
  ],
  "public-events": [
    { id: "EVT-001", name: "宠物洗护门店关注标准化服务体验", status: "已确认", owner: "事件库", updatedAt: "2026-04-30 13:22" }
  ],
  leads: [
    { id: "LED-001", name: "提交样例品牌资料", status: "待处理", owner: "线索管理", updatedAt: "2026-04-30 12:35" }
  ],
  seo: [
    { id: "SEO-001", name: "首页 SEO", status: "已配置", owner: "SEO", updatedAt: "2026-04-28 18:00" },
    { id: "SEO-002", name: "sitemap 刷新", status: "待执行", owner: "SEO", updatedAt: "2026-04-30 09:00" }
  ],
  settings: [
    { id: "CFG-001", name: "自动发布规则", status: "启用", owner: "系统", updatedAt: "2026-04-30 08:15" }
  ]
};

const mockStats: DashboardStat[] = [
  { label: "今日采集数量", value: "24" },
  { label: "今日生成文章", value: "8" },
  { label: "今日发布数量", value: "3" },
  { label: "今日风险拦截", value: "2" },
  { label: "今日 AI 成本", value: "12.80" },
  { label: "采集失败任务", value: "1" },
  { label: "来源健康状态", value: "正常" },
  { label: "AI任务状态", value: "排队中" }
];

function getAdminToken() {
  if (typeof window === "undefined") {
    return "";
  }
  return window.localStorage.getItem(tokenStorageKey) ?? "";
}

export function saveAdminToken(token: string) {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(tokenStorageKey, token);
  }
}

async function request<T>(path: string, fallback: T, init?: RequestInit, options: { auth?: boolean } = { auth: true }): Promise<T> {
  if (apiMode !== "real" || !resolvedApiBaseUrl) {
    return fallback;
  }

  const headers: Record<string, string> = { "Content-Type": "application/json" };
  const initHeaders = init?.headers instanceof Headers ? Object.fromEntries(init.headers.entries()) : (init?.headers as Record<string, string> | undefined);
  Object.assign(headers, initHeaders ?? {});
  const token = options.auth === false ? "" : getAdminToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let response: Response;
  try {
    response = await fetch(new URL(path, resolvedApiBaseUrl).toString(), { ...init, headers, cache: "no-store" });
  } catch (error) {
    const detail = error instanceof Error && error.message ? error.message : "网络连接失败";
    throw new Error(`API 暂时不可用（${path}）：${detail}`);
  }
  const body = (await response.json().catch(() => null)) as ApiResponse<T> | null;
  if (!body) {
    throw new Error(`API 返回格式异常（${path}，HTTP ${response.status}）`);
  }
  if (!response.ok || body.code !== 0) {
    const requestId = body.request_id ? `，request_id=${body.request_id}` : "";
    throw new Error(`API 请求失败（${path}）：${body.message || `HTTP ${response.status}`}${requestId}`);
  }
  return body.data ?? fallback;
}

export function apiFailureMessage(error: unknown, action: string) {
  const detail = error instanceof Error && error.message ? error.message : "未知错误";
  return `${action}：${detail}`;
}

function listResult<T>(items: T[]): ListResponse<T> {
  return { items, total: items.length };
}

export async function loginAdmin(payload: { username: string; password: string }) {
  return request<LoginResponse>(
    "/api/admin/login",
    { token: "mock-admin-token", token_type: "Bearer", expires_at: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString() },
    { method: "POST", body: JSON.stringify(payload) },
    { auth: false }
  );
}

export async function getDashboard() {
  return request<{ stats: DashboardStat[]; latestArticles: AdminRow[]; latestLeads: AdminRow[] }>("/api/admin/dashboard", {
    stats: mockStats,
    latestArticles: mockRows.articles,
    latestLeads: mockRows.leads
  });
}

export async function listEntityRows(kind: EntityKind, options: { status?: string; processStatus?: string } = {}) {
  const data = await request<ListResponse<Record<string, unknown>>>(listPath(kind, options), listResult(mockRows[kind] ?? []));
  return { items: data.items.map(toAdminRow), total: data.total };
}

export async function listSettings() {
  const data = await request<ListResponse<Record<string, unknown>>>("/api/admin/settings", listResult([]));
  return { items: data.items.map(toSettingRow), total: data.total };
}

export async function getEntity(kind: EntityKind, id: string) {
  return request<Record<string, unknown>>(`/api/admin/${kind}/${id}`, {});
}

export async function submitEntity(kind: EntityKind, payload: Record<string, unknown>, id?: string) {
  const method = id ? "PUT" : "POST";
  const basePath = kind === "beauty" || kind === "daily" || kind === "samples" ? "articles" : kind;
  const path = id ? `/api/admin/${basePath}/${id}` : `/api/admin/${basePath}`;
  const data = await request<Record<string, unknown>>(path, {}, { method, body: JSON.stringify(payload) });
  return { accepted: true, resource: kind, payload, data };
}

export async function updateSetting(payload: { config_key: string; config_value: string; value_type: string; description: string; status: string }) {
  return request<Record<string, unknown>>("/api/admin/settings", {}, { method: "PUT", body: JSON.stringify(payload) });
}

export async function publishArticle(id: string) {
  return request<Record<string, unknown>>(`/api/admin/articles/${id}/publish`, {}, { method: "POST", body: JSON.stringify({ human_review_confirmed: true }) });
}

export async function offlineArticle(id: string) {
  return request<Record<string, unknown>>(`/api/admin/articles/${id}/offline`, {}, { method: "POST" });
}

export async function deleteEntity(kind: EntityKind, id: string) {
  return request<Record<string, unknown>>(`/api/admin/${kind}/${id}`, {}, { method: "DELETE" });
}

function toAdminRow(item: Record<string, unknown>): AdminRow {
  const id = String(item.id ?? "");
  return {
    id,
    name: String(item.name ?? item.title ?? item.task_name ?? id),
    status: String(item.status ?? item.process_status ?? ""),
    owner: String(item.owner ?? item.sourceName ?? item.source_name ?? item.role ?? ""),
    updatedAt: String(item.updatedAt ?? item.updated_at ?? item.created_at ?? ""),
    slug: typeof item.slug === "string" ? item.slug : undefined,
    publishType: typeof item.publishType === "string" ? item.publishType : undefined,
    sourceUrl: typeof item.source_url === "string" ? item.source_url : typeof item.sourceUrl === "string" ? item.sourceUrl : undefined,
    sourceType: typeof item.source_type === "string" ? item.source_type : typeof item.sourceType === "string" ? item.sourceType : undefined,
    originalTitle: typeof item.original_title === "string" ? item.original_title : typeof item.originalTitle === "string" ? item.originalTitle : undefined,
    rewriteMethod: typeof item.rewrite_method === "string" ? item.rewrite_method : typeof item.rewriteMethod === "string" ? item.rewriteMethod : undefined,
    coverImageUrl: typeof item.cover_image_url === "string" ? item.cover_image_url : typeof item.coverImageUrl === "string" ? item.coverImageUrl : undefined,
    coverImageSource: typeof item.cover_image_source === "string" ? item.cover_image_source : typeof item.coverImageSource === "string" ? item.coverImageSource : undefined,
    copyrightRisk: typeof item.copyright_risk === "string" ? item.copyright_risk : typeof item.copyrightRisk === "string" ? item.copyrightRisk : undefined,
    complianceNotes: typeof item.compliance_notes === "string" ? item.compliance_notes : typeof item.complianceNotes === "string" ? item.complianceNotes : undefined,
    humanReviewRequired: typeof item.human_review_required === "boolean" ? item.human_review_required : typeof item.humanReviewRequired === "boolean" ? item.humanReviewRequired : undefined,
    riskLevel: typeof item.risk_level === "string" ? item.risk_level : typeof item.riskLevel === "string" ? item.riskLevel : undefined,
    contentHash: typeof item.content_hash === "string" ? item.content_hash : undefined
  };
}

function toSettingRow(item: Record<string, unknown>): SettingRow {
  const row = toAdminRow(item);
  return {
    ...row,
    configKey: String(item.configKey ?? item.config_key ?? row.name),
    configValue: String(item.configValue ?? item.config_value ?? ""),
    valueType: String(item.valueType ?? item.value_type ?? row.owner),
    description: String(item.description ?? "")
  };
}

function listPath(kind: EntityKind, options: { status?: string; processStatus?: string } = {}) {
  const query = new URLSearchParams();
  if (options.status) {
    query.set("status", options.status);
  }
  if (options.processStatus) {
    query.set("process_status", options.processStatus);
  }
  if (kind === "daily") {
    return "/api/admin/articles?publish_type=daily";
  }
  if (kind === "beauty") {
    return "/api/admin/articles?publish_type=beauty";
  }
  if (kind === "samples") {
    return "/api/admin/articles?publish_type=sample";
  }
  if (kind === "public-voice") {
    return "/api/admin/public-metrics";
  }
  if (kind === "seo" || kind === "settings") {
    return "/api/admin/settings";
  }
  const suffix = query.toString();
  return `/api/admin/${kind}${suffix ? `?${suffix}` : ""}`;
}
