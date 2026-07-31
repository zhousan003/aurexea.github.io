import type { Locale } from "@/lib/site-data";
import type { PublicDonationSetting } from "@/lib/db-data";

export function DonationSection({ locale, setting }: { locale: Locale; setting?: PublicDonationSetting | null }) {
  const zh = locale === "zh";
  const title = setting ? (zh ? setting.titleZh : setting.titleEn) : zh ? "请支持网站发展" : "Please support the site";
  const description = setting
    ? zh
      ? setting.descriptionZh
      : setting.descriptionEn
    : null;

  return (
    <section className="donate-preview">
      <div className="donate-icon">₮</div>
      <h2>{title}</h2>
      <p>
        {description ||
          (zh
            ? "你的打赏将用于服务器、文件存储、产品整理和网站持续更新。"
            : "Your donation helps cover servers, storage and content updates.")}
      </p>
      <div className="qr-donation-grid">
        <article className="qr-donation-card">
          <div className="qr-placeholder">
            {setting?.qr1ImageUrl ? <img src={setting.qr1ImageUrl} alt={setting.qr1Network} /> : <span>USDT</span>}
          </div>
          <h3>{setting?.qr1Network || "USDT TRC20"}</h3>
          <div className="wallet-box">
            <span>{zh ? "收款地址" : "Address"}</span>
            <strong>{setting?.qr1Address || "TAurexEAxxxxxxxxxxxxxxxxxxxx"}</strong>
          </div>
        </article>
        <article className="qr-donation-card">
          <div className="qr-placeholder alt">
            {setting?.qr2ImageUrl ? <img src={setting.qr2ImageUrl} alt={setting.qr2Network || "USDT"} /> : <span>USDT</span>}
          </div>
          <h3>{setting?.qr2Network || "USDT ERC20"}</h3>
          <div className="wallet-box">
            <span>{zh ? "收款地址" : "Address"}</span>
            <strong>{setting?.qr2Address || "0x7ec946743ef255f5E8AAAA4Ad6572Ebd7ce7165D4"}</strong>
          </div>
        </article>
      </div>
    </section>
  );
}
