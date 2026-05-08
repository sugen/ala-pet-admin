import { loginAdmin } from "@/lib/api";
import { saveAdminToken } from "@/lib/admin-session";

export const adminDevelopmentCredentials = {
  username: "admin",
  password: "admin123456"
};

export function isDevelopmentAdminLoginEnabled() {
  return process.env.NODE_ENV !== "production";
}

export function getAdminLoginInitialValues() {
  return isDevelopmentAdminLoginEnabled() ? adminDevelopmentCredentials : { username: "", password: "" };
}

export async function signInAdmin(values: { username: string; password: string }) {
  const result = await loginAdmin(values);
  if (!result.token) {
    throw new Error("登录接口未返回有效凭证");
  }
  saveAdminToken(result.token);
  return { source: "api" as const };
}