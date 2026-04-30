export type AdminRow = {
  id: string;
  name: string;
  status: string;
  owner: string;
  updatedAt: string;
};

export type DashboardStat = {
  label: string;
  value: string;
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
const apiMode = process.env.NEXT_PUBLIC_API_MODE || "mock";

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

async function request<T>(path: string, fallback: T, init?: RequestInit): Promise<T> {
  if (apiMode !== "real" || !apiBaseUrl) {
    return fallback;
  }

  try {
    const response = await fetch(new URL(path, apiBaseUrl).toString(), {
      ...init,
      headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) }
    });
    if (!response.ok) {
      return fallback;
    }
    const body = (await response.json()) as ApiResponse<T>;
    return body.data ?? fallback;
  } catch {
    return fallback;
  }
}

function listResult<T>(items: T[]): ListResponse<T> {
  return { items, total: items.length };
}

export async function loginAdmin(payload: { username: string; password: string }) {
  return request<LoginResponse>(
    "/api/admin/login",
    { token: "mock-admin-token", token_type: "Bearer", expires_at: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString() },
    { method: "POST", body: JSON.stringify(payload) }
  );
}

export async function getDashboard() {
  return request<{ stats: DashboardStat[]; latestArticles: AdminRow[]; latestLeads: AdminRow[] }>("/api/admin/dashboard", {
    stats: mockStats,
    latestArticles: mockRows.articles,
    latestLeads: mockRows.leads
  });
}

export async function listEntityRows(kind: EntityKind) {
  return request<ListResponse<AdminRow>>(`/api/admin/${kind}`, listResult(mockRows[kind] ?? []));
}

export async function submitEntity(kind: EntityKind, payload: Record<string, unknown>) {
  return request<{ accepted: boolean; resource: EntityKind; payload: Record<string, unknown> }>(
    `/api/admin/${kind}`,
    { accepted: true, resource: kind, payload },
    { method: "POST", body: JSON.stringify(payload) }
  );
}
