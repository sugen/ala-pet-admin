import { getAdminToken } from "@/lib/admin-session";

export type AdminRow = {
  id: string;
  name: string;
  status: string;
  owner: string;
  updatedAt: string;
  userId?: string;
  slug?: string;
  type?: string;
  path?: string;
  email?: string;
  role?: string;
  roleCode?: string;
  permissionCode?: string;
  action?: string;
  menuId?: string;
  menuCode?: string;
  description?: string;
  isSystem?: boolean;
  isVisible?: boolean;
  sortOrder?: number;
  menuIds?: string[];
  permissionIds?: string[];
  lastLoginAt?: string;
  organizationId?: string;
  extra?: string;
};

export type DashboardStat = {
  label: string;
  value: string;
};

export type EntityKind =
  | "admin-accounts"
  | "admin-roles"
  | "admin-menus"
  | "admin-permissions"
  | "users"
  | "navigation-menus"
  | "organization-applications"
  | "organizations"
  | "content-reviews"
  | "contents"
  | "comments"
  | "events"
  | "reports"
  | "files"
  | "operation-logs"
  | "system-settings";

export type AdminMenuItem = {
  id: string;
  menuCode: string;
  parentId: string;
  menuName: string;
  path: string;
  icon: string;
  component?: string;
  menuType: "menu" | "group" | "button";
  sortOrder: number;
  isVisible: boolean;
  isSystem: boolean;
  status: string;
};

export type AdminRoleItem = {
  id: string;
  roleCode: string;
  roleName: string;
  description?: string;
  isSystem: boolean;
  status: string;
};

export type AdminMe = {
  user: { id: string; username: string; email: string; displayName: string; status: string };
  admin: { id: string; userId: string; adminName: string; status: string; lastLoginAt?: string; lastLoginIp?: string };
  roles: AdminRoleItem[];
  menus: AdminMenuItem[];
  permissions: string[];
};

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
const resolvedApiBaseUrl = apiBaseUrl || "http://127.0.0.1:8080";

const initialRows: Record<EntityKind, AdminRow[]> = {
  "admin-accounts": [],
  "admin-roles": [],
  "admin-menus": [],
  "admin-permissions": [],
  users: [],
  "navigation-menus": [],
  "organization-applications": [],
  organizations: [],
  "content-reviews": [],
  contents: [],
  comments: [],
  events: [],
  reports: [],
  files: [],
  "operation-logs": [],
  "system-settings": []
};

const emptyAdminMe: AdminMe = {
  user: { id: "", username: "", email: "", displayName: "", status: "" },
  admin: { id: "", userId: "", adminName: "", status: "" },
  roles: [],
  menus: [],
  permissions: []
};

const initialStats: DashboardStat[] = [
  { label: "用户数", value: "0" },
  { label: "机构数", value: "0" },
  { label: "待审核机构数", value: "0" },
  { label: "待审核内容数", value: "0" },
  { label: "已发布内容数", value: "0" },
  { label: "评论数", value: "0" }
];

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
    { token: "", token_type: "Bearer", expires_at: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString() },
    { method: "POST", body: JSON.stringify(payload) },
    { auth: false }
  );
}

export async function getAdminMe() {
  return request<AdminMe>("/api/admin/me", emptyAdminMe);
}

export async function getDashboard() {
  return request<{ stats: DashboardStat[]; latestContents: AdminRow[]; latestApplications: AdminRow[] }>("/api/admin/dashboard", {
    stats: initialStats,
    latestContents: initialRows.contents,
    latestApplications: initialRows["organization-applications"]
  });
}

export async function listEntityRows(kind: EntityKind, options: { status?: string; pageSize?: number } = {}) {
  const data = await request<ListResponse<Record<string, unknown>>>(listPath(kind, options), listResult(initialRows[kind] ?? []));
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

function listPath(kind: EntityKind, options: { status?: string; pageSize?: number } = {}) {
  const query = new URLSearchParams();
  if (options.status) {
    query.set("status", options.status);
  }
  if (options.pageSize) {
    query.set("page_size", String(options.pageSize));
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
    userId: item.userId ? String(item.userId) : item.user_id ? String(item.user_id) : undefined,
    slug: typeof item.slug === "string" ? item.slug : undefined,
    type: typeof item.type === "string" ? item.type : typeof item.content_type === "string" ? item.content_type : undefined,
    path: typeof item.path === "string" ? item.path : typeof item.url === "string" ? item.url : undefined,
    email: typeof item.email === "string" ? item.email : undefined,
    role: typeof item.role === "string" ? item.role : undefined,
    roleCode: typeof item.roleCode === "string" ? item.roleCode : typeof item.role_code === "string" ? item.role_code : undefined,
    permissionCode: typeof item.permissionCode === "string" ? item.permissionCode : typeof item.permission_code === "string" ? item.permission_code : undefined,
    action: typeof item.action === "string" ? item.action : undefined,
    menuId: item.menuId ? String(item.menuId) : item.menu_id ? String(item.menu_id) : undefined,
    menuCode: typeof item.menuCode === "string" ? item.menuCode : typeof item.menu_code === "string" ? item.menu_code : undefined,
    description: typeof item.description === "string" ? item.description : undefined,
    isSystem: typeof item.isSystem === "boolean" ? item.isSystem : typeof item.is_system === "boolean" ? item.is_system : undefined,
    isVisible: typeof item.isVisible === "boolean" ? item.isVisible : typeof item.is_visible === "boolean" ? item.is_visible : undefined,
    sortOrder: typeof item.sortOrder === "number" ? item.sortOrder : typeof item.sort_order === "number" ? item.sort_order : undefined,
    menuIds: stringArrayValue(item.menuIds ?? item.menu_ids),
    permissionIds: stringArrayValue(item.permissionIds ?? item.permission_ids),
    lastLoginAt: typeof item.lastLoginAt === "string" ? item.lastLoginAt : typeof item.last_login_at === "string" ? item.last_login_at : undefined,
    organizationId: item.organization_id ? String(item.organization_id) : typeof item.organizationId === "string" ? item.organizationId : undefined,
    extra: typeof item.extra === "string" ? item.extra : typeof item.remark === "string" ? item.remark : undefined
  };
}

function stringArrayValue(value: unknown) {
  if (Array.isArray(value)) {
    return value.map((item) => String(item)).filter(Boolean);
  }
  if (typeof value === "string" && value) {
    return value.split(",").map((item) => item.trim()).filter(Boolean);
  }
  return undefined;
}