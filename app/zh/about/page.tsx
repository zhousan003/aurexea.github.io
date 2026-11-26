import { AboutPage, getAboutCopy } from "@/components/site/AboutPage";
import { createMetadata } from "@/lib/seo";

export const revalidate = 3600;

const copy = getAboutCopy("zh");
export const metadata = createMetadata("zh", copy.title, copy.description, "/zh/about");

export default function Page() {
  return <AboutPage locale="zh" />;
}
