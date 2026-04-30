import { EntityPage } from "@/components/entity-page";

export default function SourcesPage() {
  return <EntityPage entity="sources" title="来源管理" description="管理公开新闻源、行业网站、展会官网、品牌官网和 RSS 来源。" createHref="/sources/create" />;
}