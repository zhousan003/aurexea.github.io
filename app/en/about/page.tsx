import { AboutPage, getAboutCopy } from "@/components/site/AboutPage";
import { createMetadata } from "@/lib/seo";

export const revalidate = 3600;

const copy = getAboutCopy("en");
export const metadata = createMetadata("en", copy.title, copy.description, "/en/about");

export default function Page() {
  return <AboutPage locale="en" />;
}
