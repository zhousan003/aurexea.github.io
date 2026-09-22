import { readFile } from "node:fs/promises";
import path from "node:path";

export const runtime = "nodejs";
export const dynamic = "force-static";

export async function GET() {
  const html = await readFile(path.join(process.cwd(), "public", "privacy.html"), "utf8");

  return new Response(html, {
    headers: {
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
      "Content-Type": "text/html; charset=utf-8",
    },
  });
}
