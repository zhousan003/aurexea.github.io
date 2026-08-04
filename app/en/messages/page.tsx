import type { Metadata } from "next";
import { MessageBoardPage } from "@/components/site/MessageBoardPage";
import { SiteHeader } from "@/components/site/SiteHeader";
import { getPublicGuestMessages } from "@/lib/db-data";
import { createMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = createMetadata(
  "en",
  "EA Message Board - AurexEA",
  "Leave EA requests, download issues, setfile needs and trading tool feedback on AurexEA. Admin replies are published after review.",
  "/en/messages",
);

export default async function EnMessagesPage({
  searchParams,
}: {
  searchParams?: Promise<{ sent?: string; error?: string }>;
}) {
  const [messages, params] = await Promise.all([getPublicGuestMessages("en"), searchParams]);

  return (
    <>
      <SiteHeader locale="en" />
      <main>
        <MessageBoardPage locale="en" messages={messages} sent={params?.sent === "1"} error={params?.error === "1"} />
      </main>
    </>
  );
}
