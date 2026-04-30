import { EntityPage } from "@/components/entity-page";

export default function ArticlesPage() {
  return <EntityPage entity="articles" title="内容管理" description="管理行业动态、趋势观察、品牌动态、样本和声量内容。" createHref="/articles/create" />;
}