"use client";

import { useEffect, useMemo, useState } from "react";
import { RefreshCw, Save, ShieldCheck } from "lucide-react";
import { useAdminAccess } from "@/components/admin-access-context";
import { Button } from "@/components/ui/button";
import { apiFailureMessage, entityAction, listEntityRows, submitEntity, type AdminRow } from "@/lib/api";

type AccountFormState = {
  userId: string;
  username: string;
  email: string;
  password: string;
  adminName: string;
  roleIds: string[];
};

const initialForm: AccountFormState = { userId: "", username: "", email: "", password: "", adminName: "", roleIds: [] };

export function AdminAccountForm() {
  const { can } = useAdminAccess();
  const [accounts, setAccounts] = useState<AdminRow[]>([]);
  const [roles, setRoles] = useState<AdminRow[]>([]);
  const [form, setForm] = useState<AccountFormState>(initialForm);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const canCreate = can("admin_accounts:create");
  const canAssignRole = can("admin_accounts:assign_role");
  const canUpdate = can("admin_accounts:update");
  const roleMap = useMemo(() => new Map(roles.map((role) => [role.id, role.name])), [roles]);

  async function loadData() {
    setIsLoading(true);
    try {
      const [accountResult, roleResult] = await Promise.all([
        listEntityRows("admin-accounts", { pageSize: 100 }),
        listEntityRows("admin-roles", { pageSize: 100 })
      ]);
      setAccounts(accountResult.items);
      setRoles(roleResult.items.filter((role) => role.status === "active"));
      setMessage("");
    } catch (error) {
      setMessage(apiFailureMessage(error, "加载后台账号失败"));
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadData();
  }, []);

  function toggleRole(roleId: string) {
    setForm((current) => ({
      ...current,
      roleIds: current.roleIds.includes(roleId) ? current.roleIds.filter((item) => item !== roleId) : [...current.roleIds, roleId]
    }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.roleIds.length) {
      setMessage("请至少选择一个角色");
      return;
    }
    try {
      await submitEntity("admin-accounts", {
        userId: form.userId || undefined,
        username: form.username || undefined,
        email: form.email || undefined,
        password: form.password || undefined,
        adminName: form.adminName,
        roleIds: form.roleIds
      });
      setForm(initialForm);
      await loadData();
      setMessage("后台账号已保存");
    } catch (error) {
      setMessage(apiFailureMessage(error, "保存后台账号失败"));
    }
  }

  async function handleStatus(id: string, status: string) {
    try {
      await entityAction("admin-accounts", id, status === "active" ? "disable" : "enable");
      await loadData();
      setMessage("账号状态已更新");
    } catch (error) {
      setMessage(apiFailureMessage(error, "更新账号状态失败"));
    }
  }

  async function handleAssignRole(account: AdminRow, roleId: string) {
    try {
      await submitEntity("admin-accounts", { roleIds: [roleId] }, account.id);
      await loadData();
      setMessage("账号角色已更新");
    } catch (error) {
      setMessage(apiFailureMessage(error, "更新账号角色失败"));
    }
  }

  return (
    <div className="grid gap-6">
      {message ? <p className="rounded-md border border-line bg-white p-4 text-sm text-ink/70">{message}</p> : null}
      {canCreate ? (
        <form onSubmit={handleSubmit} className="grid gap-5 rounded-md border border-line bg-white p-5 shadow-soft">
          <div className="grid gap-4 lg:grid-cols-3">
            <label className="grid gap-2 text-sm font-medium text-ink">已有用户ID<input value={form.userId} onChange={(event) => setForm({ ...form, userId: event.target.value })} className="h-10 rounded-md border border-line px-3 outline-none focus:border-gold" /></label>
            <label className="grid gap-2 text-sm font-medium text-ink">用户名<input value={form.username} onChange={(event) => setForm({ ...form, username: event.target.value })} className="h-10 rounded-md border border-line px-3 outline-none focus:border-gold" /></label>
            <label className="grid gap-2 text-sm font-medium text-ink">初始密码<input type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} className="h-10 rounded-md border border-line px-3 outline-none focus:border-gold" /></label>
            <label className="grid gap-2 text-sm font-medium text-ink">邮箱<input value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} className="h-10 rounded-md border border-line px-3 outline-none focus:border-gold" /></label>
            <label className="grid gap-2 text-sm font-medium text-ink">后台显示名称<input value={form.adminName} onChange={(event) => setForm({ ...form, adminName: event.target.value })} className="h-10 rounded-md border border-line px-3 outline-none focus:border-gold" /></label>
          </div>
          <div className="grid gap-2">
            <p className="text-sm font-medium text-ink">分配角色</p>
            <div className="flex flex-wrap gap-2">
              {roles.map((role) => (
                <label key={role.id} className={`inline-flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm ${form.roleIds.includes(role.id) ? "border-gold bg-gold/15 text-ink" : "border-line bg-white text-ink/70"}`}>
                  <input type="checkbox" checked={form.roleIds.includes(role.id)} onChange={() => toggleRole(role.id)} className="h-4 w-4 accent-[#b28b2e]" />
                  {role.name}
                </label>
              ))}
            </div>
          </div>
          <Button type="submit" className="w-fit" disabled={!canAssignRole || !form.roleIds.length}><Save className="h-4 w-4" />保存后台账号</Button>
        </form>
      ) : null}

      <div className="overflow-hidden rounded-md border border-line bg-white shadow-soft">
        <div className="flex items-center justify-between border-b border-line px-4 py-3">
          <p className="font-semibold text-ink">后台账号列表</p>
          <Button type="button" variant="outline" size="sm" onClick={() => void loadData()}><RefreshCw className="h-4 w-4" />刷新</Button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-[960px] w-full text-left text-sm">
            <thead className="bg-ink text-ivory"><tr><th className="px-4 py-3">账号</th><th className="px-4 py-3">邮箱</th><th className="px-4 py-3">角色</th><th className="px-4 py-3">状态</th><th className="px-4 py-3">最后登录</th><th className="px-4 py-3">操作</th></tr></thead>
            <tbody>
              {isLoading ? <tr><td colSpan={6} className="px-4 py-8 text-center text-ink/55">正在加载列表...</td></tr> : accounts.length ? accounts.map((account) => (
                <tr key={account.id} className="border-t border-line">
                  <td className="px-4 py-3"><p className="font-medium text-ink">{account.name}</p><p className="text-xs text-ink/50">{account.owner}</p></td>
                  <td className="px-4 py-3 text-ink/70">{account.email || "-"}</td>
                  <td className="px-4 py-3 text-ink/70">{account.role || "-"}</td>
                  <td className="px-4 py-3"><span className="rounded border border-line px-2 py-1 text-xs text-ink/70">{account.status === "active" ? "启用" : "禁用"}</span></td>
                  <td className="px-4 py-3 text-ink/70">{account.lastLoginAt || "-"}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      {canUpdate ? <Button type="button" variant="outline" size="sm" onClick={() => void handleStatus(account.id, account.status)}>{account.status === "active" ? "禁用" : "启用"}</Button> : null}
                      {canAssignRole ? (
                        <select className="h-9 rounded-md border border-line bg-white px-2 text-xs outline-none focus:border-gold" value="" onChange={(event) => event.target.value && void handleAssignRole(account, event.target.value)} aria-label="分配角色">
                          <option value="">分配角色</option>
                          {roles.map((role) => <option key={role.id} value={role.id}>{roleMap.get(role.id)}</option>)}
                        </select>
                      ) : null}
                    </div>
                  </td>
                </tr>
              )) : <tr><td colSpan={6} className="px-4 py-8 text-center text-ink/55">暂无后台账号</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
      <div className="rounded-md border border-line bg-white p-4 text-sm text-ink/65"><ShieldCheck className="mr-2 inline h-4 w-4 text-gold" />后台账号必须关联有效自然人用户，并至少绑定一个有效角色。</div>
    </div>
  );
}