"use client";

import { useEffect, useState } from "react";
import { PageTitle } from "@/components/page-title";
import { apiFailureMessage, getEntity } from "@/lib/api";

type RawContentRecord = {
  id?: string;
  title?: string;
  source_name?: string;
  source_url?: string;
  summary?: string;
  content_excerpt?: string;
  content_hash?: string;
  process_status?: string;
  risk_level?: string;
  created_at?: string;
};

export function RawContentDetail({ id }: { id: string }) {
  const [record, setRecord] = useState<RawContentRecord | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    void getEntity("raw-contents", id)
      .then((item) => {
        setRecord(item as RawContentRecord);
        setMessage("");
      })
      .catch((error) => setMessage(apiFailureMessage(error, "加载原始内容失败")));
  }, [id]);

  return (
    <>
      <PageTitle title="原始内容详情" description="查看 crawler 入库内容的来源、摘要、摘录和处理状态。" />
      {message ? <p className="rounded-md border border-line bg-white p-4 text-sm text-red-700">{message}</p> : null}
      <div className="grid gap-4 rounded-md border border-line bg-white p-6 text-sm shadow-soft">
        <DetailRow label="标题" value={record?.title} />
        <DetailRow label="来源" value={record?.source_name} />
        <DetailRow label="摘要" value={record?.summary} />
        <DetailRow label="原文链接" value={record?.source_url} href={record?.source_url} />
        <DetailRow label="内容摘录" value={record?.content_excerpt} multiline />
        <DetailRow label="content_hash" value={record?.content_hash} />
        <DetailRow label="process_status" value={record?.process_status} />
        <DetailRow label="risk_level" value={record?.risk_level} />
        <DetailRow label="创建时间" value={record?.created_at} />
      </div>
    </>
  );
}

function DetailRow({ label, value, href, multiline }: { label: string; value?: string; href?: string; multiline?: boolean }) {
  return (
    <div className="grid gap-1 border-b border-line pb-3 last:border-b-0 last:pb-0">
      <span className="text-xs font-medium uppercase text-ink/50">{label}</span>
      {href ? (
        <a className="break-all text-evergreen underline-offset-4 hover:underline" href={href} target="_blank" rel="noreferrer">
          {value || "-"}
        </a>
      ) : (
        <span className={multiline ? "whitespace-pre-wrap text-ink/75" : "break-all text-ink/75"}>{value || "-"}</span>
      )}
    </div>
  );
}