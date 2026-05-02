import { EntityPage } from "@/components/entity-page";

export default function ArticlesPage() {
  return <EntityPage entity="articles" title="头条 / 动态 / 推荐位" description="管理首页主头条、推荐位、快讯、报告样本和专题内容；缺少正式字段时使用 publish_type、source_type、seo_keywords 和 status 承载。" createHref="/articles/create" />;
}