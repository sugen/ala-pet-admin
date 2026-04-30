import { EntityForm } from "@/components/entity-form";

export default function SettingsPage() {
  return <EntityForm entity="settings" title="系统设置" description="管理系统配置、发布规则和内部服务地址。" />;
}