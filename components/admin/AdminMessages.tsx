import { PublishStatus } from "@prisma/client";
import { deleteGuestMessage, replyGuestMessage, setGuestMessageStatus } from "@/app/admin/(protected)/actions";
import type { AdminGuestMessage } from "@/lib/admin-data";

function statusLabel(status: PublishStatus) {
  if (status === PublishStatus.PUBLISHED) return "已公开";
  if (status === PublishStatus.ARCHIVED) return "已隐藏";
  return "待审核";
}

function localeLabel(locale: "zh" | "en") {
  return locale === "zh" ? "中文" : "English";
}

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(value);
}

export function GuestMessageAdminPage({ messages }: { messages: AdminGuestMessage[] }) {
  const pendingCount = messages.filter((message) => message.status === PublishStatus.DRAFT).length;

  return (
    <>
      <div className="admin-heading">
        <div>
          <p className="eyebrow">留言管理</p>
          <h1>站内留言板</h1>
        </div>
      </div>
      <div className="metric-grid">
        <article className="metric-card">
          <span>全部留言</span>
          <strong>{messages.length.toLocaleString()}</strong>
          <small>前台提交的留言</small>
        </article>
        <article className="metric-card">
          <span>待审核</span>
          <strong>{pendingCount.toLocaleString()}</strong>
          <small>回复并公开后显示</small>
        </article>
      </div>
      <section className="admin-panel">
        <div className="panel-head">
          <h2>留言列表</h2>
          <span>回复 / 公开 / 隐藏 / 删除</span>
        </div>
        <div className="admin-message-list">
          {messages.length ? messages.map((message) => (
            <article className="admin-message-card" key={message.id}>
              <div className="admin-message-head">
                <div>
                  <strong>{message.name}</strong>
                  <span>{localeLabel(message.locale)} · {formatDate(message.createdAt)} · {message.country || "未知地区"}</span>
                </div>
                <span className={`status ${message.status === PublishStatus.PUBLISHED ? "on" : "off"}`}>
                  {statusLabel(message.status)}
                </span>
              </div>
              {message.email ? <p className="admin-message-email">邮箱：{message.email}</p> : null}
              <p className="admin-message-content">{message.content}</p>
              <form className="admin-form compact-admin-form" action={replyGuestMessage}>
                <input type="hidden" name="id" value={message.id} />
                <label>
                  管理员回复
                  <textarea name="reply" defaultValue={message.reply || ""} placeholder="输入回复内容，保存后可选择公开显示。" />
                </label>
                <div className="form-grid">
                  <label>
                    状态
                    <select name="status" defaultValue={message.status}>
                      <option value="DRAFT">待审核</option>
                      <option value="PUBLISHED">公开显示</option>
                      <option value="ARCHIVED">隐藏</option>
                    </select>
                  </label>
                  <div className="form-actions align-end">
                    <button className="primary-button" type="submit">保存回复</button>
                  </div>
                </div>
              </form>
              <div className="table-actions message-actions-row">
                <form action={setGuestMessageStatus}>
                  <input type="hidden" name="id" value={message.id} />
                  <input type="hidden" name="status" value={message.status === PublishStatus.PUBLISHED ? "ARCHIVED" : "PUBLISHED"} />
                  <button type="submit">{message.status === PublishStatus.PUBLISHED ? "隐藏" : "公开"}</button>
                </form>
                <form action={deleteGuestMessage}>
                  <input type="hidden" name="id" value={message.id} />
                  <button type="submit">删除</button>
                </form>
              </div>
            </article>
          )) : (
            <div className="empty-message">暂无留言。</div>
          )}
        </div>
      </section>
    </>
  );
}
