export type AdminRow = {
  id: string;
  name: string;
  status: string;
  owner: string;
  updatedAt: string;
  slug?: string;
  type?: string;
  path?: string;
  email?: string;
  role?: string;
  organizationId?: string;
  extra?: string;
};

export type DashboardStat = {
  label: string;
  value: string;
};

export type EntityKind =
  | "users"
  | "navigation-menus"
  | "organization-applications"
  | "organizations"
  | "content-reviews"
  | "contents"
  | "comments"
  | "reports"
  | "files"
  | "operation-logs";

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
  users: [
    { id: "1", name: "平台管理员", status: "active", owner: "Ala.pet", role: "admin", email: "admin@ala.pet", updatedAt: "2026-05-07 10:00" },
    { id: "2", name: "机构运营员", status: "active", owner: "PetDaily", role: "organization_editor", email: "editor@petdaily.cn", updatedAt: "2026-05-07 09:20" }
  ],
  "navigation-menus": [
    { id: "1", name: "首页", status: "visible", owner: "前台", path: "/", extra: "home / sort 10", updatedAt: "2026-05-07 10:00" },
    { id: "2", name: "洞察", status: "visible", owner: "前台", path: "/insights", extra: "insights / sort 20", updatedAt: "2026-05-07 10:00" },
    { id: "3", name: "活动", status: "visible", owner: "前台", path: "/events", extra: "events / sort 30", updatedAt: "2026-05-07 10:00" },
    { id: "4", name: "报告", status: "visible", owner: "前台", path: "/reports", extra: "reports / sort 40", updatedAt: "2026-05-07 10:00" }
  ],
  "organization-applications": [
    { id: "101", name: "上海宠物服务协会", status: "pending", owner: "联系人：王女士", type: "association", email: "apply@example.org", updatedAt: "2026-05-07 11:12" },
    { id: "102", name: "样例宠物品牌", status: "reviewing", owner: "联系人：陈先生", type: "pet_brand", email: "brand@example.com", updatedAt: "2026-05-07 10:31" }
  ],
  organizations: [
    { id: "1", name: "Ala.pet 官方", status: "verified", owner: "平台", slug: "alapet-official", type: "official", updatedAt: "2026-05-07 10:00" },
    { id: "2", name: "PetDaily 行业观察", status: "verified", owner: "PetDaily", slug: "petdaily", type: "industry_media", updatedAt: "2026-05-07 10:00" }
  ],
  "content-reviews": [
    { id: "501", name: "宠物营养品牌强化适口性研究沟通", status: "pending", owner: "PetDaily 行业观察", organizationId: "2", type: "article", updatedAt: "2026-05-07 12:40" },
    { id: "502", name: "华东宠物服务公开课报名启动", status: "pending", owner: "上海宠物服务协会", organizationId: "4", type: "event", updatedAt: "2026-05-07 11:18" }
  ],
  contents: [
    { id: "1001", name: "宠物营养品牌强化适口性研究沟通", status: "published", owner: "PetDaily 行业观察", organizationId: "2", type: "article", updatedAt: "2026-05-07 09:00" },
    { id: "2001", name: "华东宠物服务公开课报名启动", status: "published", owner: "上海宠物服务协会", organizationId: "4", type: "brief", updatedAt: "2026-05-07 08:30" }
  ],
  comments: [
    { id: "90001", name: "希望看到更多认证机构发布活动。", status: "visible", owner: "普通用户", type: "user", updatedAt: "2026-05-07 10:42" },
    { id: "90002", name: "一级评论样例：平台后台可以隐藏或删除。", status: "visible", owner: "认证机构观察员", type: "organization", updatedAt: "2026-05-07 10:30" }
  ],
  reports: [
    { id: "9001", name: "2026 宠物行业认证信息发布平台观察报告", status: "published", owner: "Ala.pet 官方", type: "official_report", updatedAt: "2026-05-07 10:00" }
  ],
  files: [
    { id: "7001", name: "report-9001.pdf", status: "active", owner: "Ala.pet 官方", type: "application/pdf", path: "/reports/9001.pdf", updatedAt: "2026-05-07 10:00" }
  ],
  "operation-logs": [
    { id: "8001", name: "approve_content", status: "success", owner: "平台管理员", extra: "content_id=1001", updatedAt: "2026-05-07 09:00" },
    { id: "8002", name: "update_navigation_menu", status: "success", owner: "平台管理员", extra: "menu_key=reports", updatedAt: "2026-05-07 08:45" }
  ]
};

const mockStats: DashboardStat[] = [
  { label: "待审核机构", value: "2" },
  { label: "认证机构", value: "4" },
  { label: "待审核内容", value: "2" },
  { label: "已发布内容", value: "4" },
  { label: "可见评论", value: "2" },
  { label: "官方报告", value: "1" },
  { label: "前台菜单", value: "6" },
  { label: "今日操作", value: "12" }
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
  return request<{ stats: DashboardStat[]; latestContents: AdminRow[]; latestApplications: AdminRow[] }>("/api/admin/dashboard", {
    stats: mockStats,
    latestContents: mockRows.contents,
    latestApplications: mockRows["organization-applications"]
  });
}

export async function listEntityRows(kind: EntityKind, options: { status?: string } = {}) {
  const data = await request<ListResponse<Record<string, unknown>>>(listPath(kind, options), listResult(mockRows[kind] ?? []));
  return { items: data.items.map(toAdminRow), total: data.total };
}

export async function submitEntity(kind: EntityKind, payload: Record<string, unknown>, id?: string) {
  const method = id ? "PUT" : "POST";
  const path = id ? `/api/admin/${kind}/${id}` : `/api/admin/${kind}`;
  const data = await request<Record<string, unknown>>(path, {}, { method, body: JSON.stringify(payload) });
  return { accepted: true, resource: kind, payload, data };
}

export async function deleteEntity(kind: EntityKind, id: string) {
  return request<Record<string, unknown>>(`/api/admin/${kind}/${id}`, {}, { method: "DELETE" });
}

export async function entityAction(kind: EntityKind, id: string, action: string, payload: Record<string, unknown> = {}) {
  return request<Record<string, unknown>>(`/api/admin/${kind}/${id}/${action}`, {}, { method: "POST", body: JSON.stringify(payload) });
}

function listPath(kind: EntityKind, options: { status?: string } = {}) {
  const query = new URLSearchParams();
  if (options.status) {
    query.set("status", options.status);
  }
  const suffix = query.toString();
  return `/api/admin/${kind}${suffix ? `?${suffix}` : ""}`;
}

function toAdminRow(item: Record<string, unknown>): AdminRow {
  const id = String(item.id ?? "");
  return {
    id,
    name: String(item.name ?? item.title ?? item.content ?? item.file_name ?? item.action ?? id),
    status: String(item.status ?? item.review_status ?? item.visibility ?? ""),
    owner: String(item.owner ?? item.organization_name ?? item.author_name ?? item.created_by_name ?? item.role ?? ""),
    updatedAt: String(item.updatedAt ?? item.updated_at ?? item.created_at ?? ""),
    slug: typeof item.slug === "string" ? item.slug : undefined,
    type: typeof item.type === "string" ? item.type : typeof item.content_type === "string" ? item.content_type : undefined,
    path: typeof item.path === "string" ? item.path : typeof item.url === "string" ? item.url : undefined,
    email: typeof item.email === "string" ? item.email : undefined,
    role: typeof item.role === "string" ? item.role : undefined,
    organizationId: item.organization_id ? String(item.organization_id) : typeof item.organizationId === "string" ? item.organizationId : undefined,
    extra: typeof item.extra === "string" ? item.extra : typeof item.remark === "string" ? item.remark : undefined
  };
}