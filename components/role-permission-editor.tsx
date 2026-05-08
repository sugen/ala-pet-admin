"use client";

import { useEffect, useMemo, useState } from "react";
import { RefreshCw, Save, ShieldCheck } from "lucide-react";
import { useAdminAccess } from "@/components/admin-access-context";
import { Button } from "@/components/ui/button";
import { apiFailureMessage, listEntityRows, submitEntity, type AdminRow } from "@/lib/api";

const emptyRoleForm = { roleCode: "", roleName: "", description: "" };

export function RolePermissionEditor() {
  const { can } = useAdminAccess();
  const [roles, setRoles] = useState<AdminRow[]>([]);
  const [menus, setMenus] = useState<AdminRow[]>([]);
  const [permissions, setPermissions] = useState<AdminRow[]>([]);
  const [selectedRoleId, setSelectedRoleId] = useState("");
  const [selectedMenuIds, setSelectedMenuIds] = useState<string[]>([]);
  const [selectedPermissionIds, setSelectedPermissionIds] = useState<string[]>([]);
  const [roleForm, setRoleForm] = useState(emptyRoleForm);
  const [newRoleForm, setNewRoleForm] = useState(emptyRoleForm);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const selectedRole = useMemo(() => roles.find((role) => role.id === selectedRoleId), [roles, selectedRoleId]);
  const permissionsByMenu = useMemo(() => {
    const map = new Map<string, AdminRow[]>();
    permissions.forEach((permission) => {
      const key = permission.menuId || "other";
      map.set(key, [...(map.get(key) ?? []), permission]);
    });
    return map;
  }, [permissions]);

  async function loadData(nextSelectedId = selectedRoleId) {
    setIsLoading(true);
    try {
      const [roleResult, menuResult, permissionResult] = await Promise.all([
        listEntityRows("admin-roles", { pageSize: 100 }),
        listEntityRows("admin-menus", { pageSize: 100 }),
        listEntityRows("admin-permissions", { pageSize: 100 })
      ]);
      setRoles(roleResult.items);
      setMenus(menuResult.items);
      setPermissions(permissionResult.items);
      const nextRole = roleResult.items.find((role) => role.id === nextSelectedId) ?? roleResult.items[0];
      if (nextRole) {
        selectRole(nextRole);
      }
      setMessage("");
    } catch (error) {
      setMessage(apiFailureMessage(error, "加载角色权限失败"));
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadData();
  }, []);

  function selectRole(role: AdminRow) {
    setSelectedRoleId(role.id);
    setSelectedMenuIds(role.menuIds ?? []);
    setSelectedPermissionIds(role.permissionIds ?? []);
    setRoleForm({ roleCode: role.roleCode ?? "", roleName: role.name, description: role.description ?? "" });
  }

  function toggleValue(values: string[], value: string) {
    return values.includes(value) ? values.filter((item) => item !== value) : [...values, value];
  }

  async function handleCreateRole(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      const result = await submitEntity("admin-roles", { roleCode: newRoleForm.roleCode, roleName: newRoleForm.roleName, description: newRoleForm.description, menuIds: [], permissionIds: [] });
      setNewRoleForm(emptyRoleForm);
      setMessage("角色已创建");
      await loadData(String(result.data.id ?? selectedRoleId));
    } catch (error) {
      setMessage(apiFailureMessage(error, "创建角色失败"));
    }
  }

  async function handleSaveRole() {
    if (!selectedRole) return;
    try {
      await submitEntity("admin-roles", { roleName: roleForm.roleName, description: roleForm.description }, selectedRole.id);
      setMessage("角色信息已保存");
      await loadData(selectedRole.id);
    } catch (error) {
      setMessage(apiFailureMessage(error, "保存角色失败"));
    }
  }

  async function handleSaveMenus() {
    if (!selectedRole) return;
    try {
      await submitEntity("admin-roles", { menuIds: selectedMenuIds }, selectedRole.id);
      setMessage("菜单权限已保存");
      await loadData(selectedRole.id);
    } catch (error) {
      setMessage(apiFailureMessage(error, "保存菜单权限失败"));
    }
  }

  async function handleSavePermissions() {
    if (!selectedRole) return;
    try {
      await submitEntity("admin-roles", { permissionIds: selectedPermissionIds }, selectedRole.id);
      setMessage("操作权限已保存");
      await loadData(selectedRole.id);
    } catch (error) {
      setMessage(apiFailureMessage(error, "保存操作权限失败"));
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
      <div className="grid gap-4 content-start">
        {message ? <p className="rounded-md border border-line bg-white p-4 text-sm text-ink/70">{message}</p> : null}
        <div className="rounded-md border border-line bg-white shadow-soft">
          <div className="flex items-center justify-between border-b border-line px-4 py-3">
            <p className="font-semibold text-ink">角色列表</p>
            <Button type="button" variant="outline" size="sm" onClick={() => void loadData()}><RefreshCw className="h-4 w-4" />刷新</Button>
          </div>
          <div className="grid gap-1 p-2">
            {isLoading ? <p className="px-3 py-6 text-center text-sm text-ink/55">正在加载角色...</p> : roles.map((role) => (
              <button key={role.id} type="button" onClick={() => selectRole(role)} className={`rounded-md px-3 py-3 text-left text-sm transition-colors ${role.id === selectedRoleId ? "bg-gold/15 text-ink" : "text-ink/70 hover:bg-[#f4f1ea]"}`}>
                <span className="block font-semibold">{role.name}</span>
                <span className="mt-1 block text-xs text-ink/50">{role.roleCode}</span>
              </button>
            ))}
          </div>
        </div>

        {can("admin_roles:create") ? (
          <form onSubmit={handleCreateRole} className="grid gap-3 rounded-md border border-line bg-white p-4 shadow-soft">
            <p className="font-semibold text-ink">新增角色</p>
            <label className="grid gap-1 text-xs font-semibold text-ink/60">角色编码<input value={newRoleForm.roleCode} onChange={(event) => setNewRoleForm({ ...newRoleForm, roleCode: event.target.value })} className="h-10 rounded-md border border-line px-3 text-sm font-normal text-ink outline-none focus:border-gold" /></label>
            <label className="grid gap-1 text-xs font-semibold text-ink/60">角色名称<input value={newRoleForm.roleName} onChange={(event) => setNewRoleForm({ ...newRoleForm, roleName: event.target.value })} className="h-10 rounded-md border border-line px-3 text-sm font-normal text-ink outline-none focus:border-gold" /></label>
            <label className="grid gap-1 text-xs font-semibold text-ink/60">角色说明<input value={newRoleForm.description} onChange={(event) => setNewRoleForm({ ...newRoleForm, description: event.target.value })} className="h-10 rounded-md border border-line px-3 text-sm font-normal text-ink outline-none focus:border-gold" /></label>
            <Button type="submit" disabled={!newRoleForm.roleCode || !newRoleForm.roleName}><ShieldCheck className="h-4 w-4" />创建角色</Button>
          </form>
        ) : null}
      </div>

      <div className="grid gap-5">
        <div className="rounded-md border border-line bg-white p-5 shadow-soft">
          <div className="grid gap-4 lg:grid-cols-2">
            <label className="grid gap-2 text-sm font-medium text-ink">角色编码<input value={roleForm.roleCode} disabled className="h-10 rounded-md border border-line bg-[#f4f1ea] px-3 text-ink/55" /></label>
            <label className="grid gap-2 text-sm font-medium text-ink">角色名称<input value={roleForm.roleName} onChange={(event) => setRoleForm({ ...roleForm, roleName: event.target.value })} className="h-10 rounded-md border border-line px-3 outline-none focus:border-gold" /></label>
            <label className="grid gap-2 text-sm font-medium text-ink lg:col-span-2">角色说明<input value={roleForm.description} onChange={(event) => setRoleForm({ ...roleForm, description: event.target.value })} className="h-10 rounded-md border border-line px-3 outline-none focus:border-gold" /></label>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {can("admin_roles:update") ? <Button type="button" onClick={() => void handleSaveRole()}><Save className="h-4 w-4" />保存角色信息</Button> : null}
            {selectedRole?.isSystem ? <span className="rounded-md bg-[#f4f1ea] px-3 py-2 text-xs font-medium text-ink/60">系统内置角色</span> : null}
          </div>
        </div>

        <section className="rounded-md border border-line bg-white p-5 shadow-soft">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="font-semibold text-ink">菜单权限</h2>
            {can("admin_roles:assign_menu") ? <Button type="button" variant="outline" size="sm" onClick={() => void handleSaveMenus()}><Save className="h-4 w-4" />保存菜单</Button> : null}
          </div>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {menus.map((menu) => (
              <label key={menu.id} className={`flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm ${selectedMenuIds.includes(menu.id) ? "border-gold bg-gold/15 text-ink" : "border-line text-ink/70"}`}>
                <input type="checkbox" checked={selectedMenuIds.includes(menu.id)} onChange={() => setSelectedMenuIds((values) => toggleValue(values, menu.id))} className="h-4 w-4 accent-[#b28b2e]" />
                {menu.name}
              </label>
            ))}
          </div>
        </section>

        <section className="rounded-md border border-line bg-white p-5 shadow-soft">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="font-semibold text-ink">操作权限</h2>
            {can("admin_roles:assign_permission") ? <Button type="button" variant="outline" size="sm" onClick={() => void handleSavePermissions()}><Save className="h-4 w-4" />保存权限</Button> : null}
          </div>
          <div className="grid gap-4">
            {menus.map((menu) => {
              const items = permissionsByMenu.get(menu.id) ?? [];
              if (!items.length) return null;
              return (
                <div key={menu.id} className="rounded-md border border-line p-3">
                  <p className="mb-2 text-sm font-semibold text-ink">{menu.name}</p>
                  <div className="flex flex-wrap gap-2">
                    {items.map((permission) => (
                      <label key={permission.id} className={`inline-flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-xs ${selectedPermissionIds.includes(permission.id) ? "border-gold bg-gold/15 text-ink" : "border-line text-ink/70"}`}>
                        <input type="checkbox" checked={selectedPermissionIds.includes(permission.id)} onChange={() => setSelectedPermissionIds((values) => toggleValue(values, permission.id))} className="h-4 w-4 accent-[#b28b2e]" />
                        {permission.permissionCode}
                      </label>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}