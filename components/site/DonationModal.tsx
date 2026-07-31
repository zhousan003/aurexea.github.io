"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { DonationSection } from "@/components/site/DonationSection";
import type { Locale } from "@/lib/site-data";
import type { PublicDonationSetting } from "@/lib/db-data";

export function DonationModal({ locale, setting }: { locale: Locale; setting: PublicDonationSetting | null }) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const modal =
    open && mounted
      ? createPortal(
          <div className="modal-backdrop" role="presentation" onClick={() => setOpen(false)}>
            <div className="modal-panel" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
              <button
                className="close-button"
                type="button"
                aria-label={locale === "zh" ? "关闭" : "Close"}
                onClick={() => setOpen(false)}
              >
                ×
              </button>
              <DonationSection locale={locale} setting={setting} />
            </div>
          </div>,
          document.body,
        )
      : null;

  return (
    <>
      <button className="donate-button" type="button" onClick={() => setOpen(true)}>
        {locale === "zh" ? "打赏 USDT" : "Donate USDT"}
      </button>
      {modal}
    </>
  );
}
