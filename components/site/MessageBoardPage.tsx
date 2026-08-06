import type { PublicGuestMessage } from "@/lib/db-data";
import type { Locale } from "@/lib/site-data";

function formatDate(locale: Locale, value: string) {
  return new Intl.DateTimeFormat(locale === "zh" ? "zh-CN" : "en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}

export function MessageBoardPage({
  locale,
  messages,
  sent,
  error,
}: {
  locale: Locale;
  messages: PublicGuestMessage[];
  sent?: boolean;
  error?: boolean;
}) {
  const zh = locale === "zh";

  return (
    <div className="message-page">
      <section className="message-hero">
        <p className="eyebrow">{zh ? "站内留言" : "Message Board"}</p>
        <h1>{zh ? "留下你的 EA 需求或使用反馈" : "Share your EA requests or feedback"}</h1>
        <p>
          {zh
            ? "你可以提交想找的 EA、参数文件需求、下载问题或使用反馈。管理员回复并审核后，会显示在留言板中。"
            : "Submit EA requests, setfile needs, download issues or feedback. Messages appear here after admin review and reply."}
        </p>
      </section>

      <div className="message-layout">
        <section className="message-form-panel">
          <div className="section-bar compact-bar">
            <div>
              <p className="eyebrow">{zh ? "提交留言" : "Submit"}</p>
              <h2>{zh ? "告诉我们你的需求" : "Tell us what you need"}</h2>
            </div>
          </div>
          {sent ? (
            <div className="admin-toast success">
              {zh ? "留言已提交，审核后会在前台显示。" : "Message submitted. It will appear after review."}
            </div>
          ) : null}
          {error ? (
            <div className="admin-toast error">
              {zh ? "请填写昵称和至少 6 个字的留言内容。" : "Please enter your name and a message of at least 6 characters."}
            </div>
          ) : null}
          <form className="message-form" action="/api/messages" method="post">
            <input type="hidden" name="locale" value={locale} />
            <label className="hidden-field">
              Website
              <input name="website" type="text" tabIndex={-1} autoComplete="off" />
            </label>
            <div className="form-grid">
              <label>
                {zh ? "昵称" : "Name"}
                <input name="name" type="text" maxLength={40} required />
              </label>
              <label>
                {zh ? "邮箱（不公开）" : "Email (private)"}
                <input name="email" type="email" maxLength={120} />
              </label>
            </div>
            <label>
              {zh ? "留言内容" : "Message"}
              <textarea
                name="content"
                maxLength={1200}
                required
                placeholder={zh ? "例如：想找 XAUUSD 的低频趋势 EA，支持 MT5。" : "Example: Looking for a low-frequency XAUUSD trend EA for MT5."}
              />
            </label>
            <button className="primary-button" type="submit">
              {zh ? "提交留言" : "Submit Message"}
            </button>
          </form>
        </section>

        <section className="message-list-panel">
          <div className="section-bar compact-bar">
            <div>
              <p className="eyebrow">{zh ? "公开回复" : "Public Replies"}</p>
              <h2>{zh ? "最新留言" : "Latest Messages"}</h2>
            </div>
          </div>
          <div className="message-list">
            {messages.length ? messages.map((message) => (
              <article className="message-card" key={message.id}>
                <div className="message-meta">
                  <strong>{message.name}</strong>
                  <span>{formatDate(locale, message.createdAt)}</span>
                </div>
                <p>{message.content}</p>
                {message.reply ? (
                  <div className="message-reply">
                    <span>{zh ? "管理员回复" : "Admin Reply"}</span>
                    <p>{message.reply}</p>
                  </div>
                ) : null}
              </article>
            )) : (
              <div className="empty-message">
                {zh ? "暂时还没有公开留言，欢迎提交第一个问题。" : "No public messages yet. Be the first to submit a question."}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
