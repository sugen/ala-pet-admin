import { EntityPage } from "@/components/entity-page";

export default function BrandsPage() {
  return <EntityPage entity="brands" title="品牌库" description="管理基于公开资料整理的品牌页面。" createHref="/brands/create" />;
}