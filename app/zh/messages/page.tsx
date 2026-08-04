import type { Metadata } from "next";
import { MessageBoardPage } from "@/components/site/MessageBoardPage";
import { SiteHeader } from "@/components/site/SiteHeader";
import { getPublicGuestMessages } from "@/lib/db-data";
import { createMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = createMetadata(
  "zh",
  "EA 留言板 - 曜汇EA",
  "在曜汇EA留言提交 EA 需求、下载问题、参数文件需求和使用反馈，管理员审核后公开回复。",
  "/zh/messages",
);

export default async function ZhMessagesPage({
  searchParams,
}: {
  searchParams?: Promise<{ sent?: string; error?: string }>;
}) {
  const [messages, params] = await Promise.all([getPublicGuestMessages("zh"), searchParams]);

  return (
    <>
      <SiteHeader locale="zh" />
      <main>
        <MessageBoardPage locale="zh" messages={messages} sent={params?.sent === "1"} error={params?.error === "1"} />
      </main>
    </>
  );
}
