"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { AdminMe } from "@/lib/api";

type AdminAccessContextValue = AdminMe & {
  can: (permissionCode: string) => boolean;
};

const emptyAccess: AdminAccessContextValue = {
  user: { id: "", username: "", email: "", displayName: "", status: "" },
  admin: { id: "", userId: "", adminName: "", status: "" },
  roles: [],
  menus: [],
  permissions: [],
  can: () => false
};

const AdminAccessContext = createContext<AdminAccessContextValue>(emptyAccess);

export function AdminAccessProvider({ value, children }: { value: AdminMe; children: ReactNode }) {
  const permissions = new Set(value.permissions);
  return <AdminAccessContext.Provider value={{ ...value, can: (permissionCode) => permissions.has(permissionCode) }}>{children}</AdminAccessContext.Provider>;
}

export function useAdminAccess() {
  return useContext(AdminAccessContext);
}