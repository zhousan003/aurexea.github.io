"use client";

import { useEffect, useState } from "react";
import type { Locale, ProductCard } from "@/lib/site-data";
import { getLocalizedTitle } from "@/lib/site-data";
import type { PublicAdSlot } from "@/lib/db-data";

export function DownloadWait({
  locale,
  product,
  adSlot,
}: {
  locale: Locale;
  product: ProductCard;
  adSlot: PublicAdSlot | null;
}) {
  const countdownSeconds = adSlot?.countdownSeconds ?? 5;
  const [seconds, setSeconds] = useState(countdownSeconds);
  const [ready, setReady] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState(product.fileUrl || "");
  const adCode = adSlot?.desktopCode || adSlot?.fallbackCode || "";

  useEffect(() => {
    setReady(false);
    setSeconds(countdownSeconds);

    let current = countdownSeconds;
    const timer = window.setInterval(() => {
      current -= 1;
      setSeconds(current);
      if (current <= 0) {
        window.clearInterval(timer);
        fetch("/api/download-token", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            productId: product.id,
            slug: product.slug,
            locale,
          }),
        })
          .then((response) => response.json())
          .then((result: { downloadUrl?: string }) => {
            if (result.downloadUrl && result.downloadUrl !== "#download-file") {
              setDownloadUrl(result.downloadUrl);
            }
          })
          .finally(() => {
            void fetch("/api/analytics/download", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                productId: product.id,
                fileId: product.fileId,
                locale,
              }),
            });
          });
        setReady(true);
      }
    }, 1000);

    return () => {
      window.clearInterval(timer);
    };
  }, [countdownSeconds, locale, product.fileId, product.fileUrl, product.id, product.slug]);

  return (
    <div className="download-page-shell">
      <div className="download-page-heading">
        <p className="eyebrow">{locale === "zh" ? "免费下载" : "Free Download"}</p>
        <h1>{getLocalizedTitle(locale, product)}</h1>
        <p>
          {locale === "zh"
            ? "请等待广告展示完成，倒计时结束后将显示下载地址。"
            : "Please wait for the ad display. The download link will appear after the countdown."}
        </p>
      </div>
      <div className="responsive-ad-stage">
        <div className="large-ad-box">
          {adCode ? (
            <div
              className="ad-code-render"
              dangerouslySetInnerHTML={{ __html: adCode }}
            />
          ) : (
            <strong>{locale === "zh" ? "广告位招商" : "Ad Space Available"}</strong>
          )}
        </div>
      </div>
      <div className="download-wait-card">
        <div className="download-result is-visible">
          {ready ? (
            <a href={downloadUrl || "#download-file"}>{locale === "zh" ? "下载 EA 文件" : "Download EA File"}</a>
          ) : (
            <>
              <span>{seconds}</span>
              <p>{locale === "zh" ? "秒后显示下载链接" : "seconds left"}</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
