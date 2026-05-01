"use client";

import { useCallback, useEffect, useState } from "react";
import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageTitle } from "@/components/page-title";
import { apiFailureMessage, listSettings, updateSetting, type SettingRow } from "@/lib/api";

type SettingDraft = {
  configValue: string;
  valueType: string;
  description: string;
  status: string;
};

export function SettingsManager() {
  const [settings, setSettings] = useState<SettingRow[]>([]);
  const [drafts, setDrafts] = useState<Record<string, SettingDraft>>({});
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const loadSettings = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await listSettings();
      setSettings(result.items);
      setDrafts(Object.fromEntries(result.items.map((item) => [item.configKey, toDraft(item)])));
      setMessage("");
    } catch (error) {
      setMessage(apiFailureMessage(error, "加载系统设置失败"));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadSettings();
  }, [loadSettings]);

  function updateDraft(configKey: string, patch: Partial<SettingDraft>) {
    setDrafts((current) => ({ ...current, [configKey]: { ...current[configKey], ...patch } }));
  }

  async function saveSetting(configKey: string) {
    const draft = drafts[configKey];
    if (!draft) {
      return;
    }
    try {
      await updateSetting({
        config_key: configKey,
        config_value: draft.configValue,
        value_type: draft.valueType || "string",
        description: draft.description,
        status: draft.status || "active"
      });
      await loadSettings();
      setMessage("系统设置已保存");
    } catch (error) {
      setMessage(apiFailureMessage(error, "保存系统设置失败"));
    }
  }

  return (
    <>
      <PageTitle title="系统设置" description="查看和更新系统配置、发布规则和内部服务地址。" />
      {message ? <p className="rounded-md border border-line bg-white p-4 text-sm text-evergreen">{message}</p> : null}
      <div className="overflow-hidden rounded-md border border-line bg-white shadow-soft">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="bg-muted text-xs uppercase tracking-wide text-ink/55">
            <tr>
              <th className="px-4 py-3 font-semibold">配置项</th>
              <th className="px-4 py-3 font-semibold">配置值</th>
              <th className="px-4 py-3 font-semibold">类型</th>
              <th className="px-4 py-3 font-semibold">说明</th>
              <th className="px-4 py-3 font-semibold">状态</th>
              <th className="px-4 py-3 font-semibold">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {isLoading ? (
              <tr>
                <td className="px-4 py-6 text-center text-ink/55" colSpan={6}>正在加载配置...</td>
              </tr>
            ) : settings.length ? (
              settings.map((item) => {
                const draft = drafts[item.configKey] ?? toDraft(item);
                return (
                  <tr key={item.configKey}>
                    <td className="px-4 py-3 font-medium text-ink">{item.configKey}</td>
                    <td className="px-4 py-3">
                      <input className="h-10 w-full rounded-md border border-line px-3 outline-none focus:border-gold" value={draft.configValue} onChange={(event) => updateDraft(item.configKey, { configValue: event.target.value })} />
                    </td>
                    <td className="px-4 py-3">
                      <input className="h-10 w-full rounded-md border border-line px-3 outline-none focus:border-gold" value={draft.valueType} onChange={(event) => updateDraft(item.configKey, { valueType: event.target.value })} />
                    </td>
                    <td className="px-4 py-3">
                      <input className="h-10 w-full rounded-md border border-line px-3 outline-none focus:border-gold" value={draft.description} onChange={(event) => updateDraft(item.configKey, { description: event.target.value })} />
                    </td>
                    <td className="px-4 py-3">
                      <select className="h-10 rounded-md border border-line bg-white px-3 outline-none focus:border-gold" value={draft.status} onChange={(event) => updateDraft(item.configKey, { status: event.target.value })}>
                        <option value="active">启用</option>
                        <option value="disabled">停用</option>
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <Button type="button" variant="outline" className="h-9 px-3" onClick={() => void saveSetting(item.configKey)}>
                        <Save className="h-4 w-4" />
                        保存
                      </Button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td className="px-4 py-6 text-center text-ink/55" colSpan={6}>{message ? "系统设置加载失败，请查看上方错误提示。" : "暂无配置项"}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}

function toDraft(item: SettingRow): SettingDraft {
  return {
    configValue: item.configValue,
    valueType: item.valueType || "string",
    description: item.description,
    status: item.status || "active"
  };
}