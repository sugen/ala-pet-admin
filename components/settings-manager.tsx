"use client";

import { type ReactNode, useCallback, useEffect, useState } from "react";
import { Globe2, LayoutDashboard, Save, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageTitle } from "@/components/page-title";
import { apiFailureMessage, listSettings, updateSetting, type SettingRow } from "@/lib/api";

type SettingDraft = {
  configValue: string;
  valueType: string;
  description: string;
  status: string;
};

const requiredSiteSettings: SettingRow[] = [
  { id: "site.icp_number", name: "备案号", status: "active", owner: "网站基础设置", updatedAt: "D21B", configKey: "site.icp_number", configValue: "沪ICP备15028254号", valueType: "string", description: "Footer 展示备案号" },
  { id: "site.contact_email", name: "联系邮箱", status: "active", owner: "网站基础设置", updatedAt: "D21B", configKey: "site.contact_email", configValue: "info@ala.pet", valueType: "string", description: "Footer 和商务合作联系邮箱" },
  { id: "site.copyright", name: "版权信息", status: "active", owner: "网站基础设置", updatedAt: "D21B", configKey: "site.copyright", configValue: "Copyright © 2026 Ala.pet 阿拉宠", valueType: "string", description: "Footer 版权文案" },
  { id: "home.module_config", name: "首页模块配置", status: "active", owner: "首页运营", updatedAt: "D21B", configKey: "home.module_config", configValue: "hero=1,secondary=4,flash=8,hot=10,indices=5,trends=4,reports=3,brands=6,topics=6", valueType: "string", description: "首页模块数量约定；正式配置 UI 后可替换" },
  { id: "home.recommendation_slots", name: "推荐位配置", status: "active", owner: "首页运营", updatedAt: "D21B", configKey: "home.recommendation_slots", configValue: "headline,recommended,newsflash,report,topic", valueType: "string", description: "当前通过 publish_type/source_type/seo_keywords 运营标记承载" }
];

export function SettingsManager() {
  const [settings, setSettings] = useState<SettingRow[]>([]);
  const [drafts, setDrafts] = useState<Record<string, SettingDraft>>({});
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const loadSettings = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await listSettings();
      const mergedSettings = mergeRequiredSettings(result.items);
      setSettings(mergedSettings);
      setDrafts(Object.fromEntries(mergedSettings.map((item) => [item.configKey, toDraft(item)])));
      setMessage("");
    } catch (error) {
      const mergedSettings = mergeRequiredSettings([]);
      setSettings(mergedSettings);
      setDrafts(Object.fromEntries(mergedSettings.map((item) => [item.configKey, toDraft(item)])));
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
      <div className="grid gap-4 md:grid-cols-3">
        <SettingCapability icon={<Globe2 className="h-5 w-5 text-evergreen" />} title="网站基础设置" text="备案号、联系邮箱、版权文案已作为 D21B 固定配置项展示，可保存到 settings。" />
        <SettingCapability icon={<LayoutDashboard className="h-5 w-5 text-evergreen" />} title="首页模块配置" text="Hero、次头条、快讯、热榜、指数、趋势、报告、品牌和专题数量在这里有配置说明。" />
        <SettingCapability icon={<Star className="h-5 w-5 text-evergreen" />} title="推荐位配置" text="头条、推荐、快讯、报告、专题暂用 publish_type、source_type 和 seo_keywords 承载。" />
      </div>
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

function mergeRequiredSettings(items: SettingRow[]) {
  const current = new Map(items.map((item) => [item.configKey, item]));
  for (const item of requiredSiteSettings) {
    if (!current.has(item.configKey)) {
      current.set(item.configKey, item);
    }
  }
  return Array.from(current.values());
}

function SettingCapability({ icon, title, text }: { icon: ReactNode; title: string; text: string }) {
  return (
    <section className="rounded-md border border-line bg-white p-4 shadow-soft">
      {icon}
      <h2 className="mt-3 text-base font-semibold text-ink">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-ink/65">{text}</p>
    </section>
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