import Link from "next/link";
import { Brand } from "@/components/site/Brand";

const nav = [
  ["仪表盘", "/admin"],
  ["产品管理", "/admin/products"],
  ["分类管理", "/admin/categories"],
  ["广告配置", "/admin/ads"],
  ["打赏配置", "/admin/donations"],
  ["SEO设置", "/admin/seo"],
  ["访问统计", "/admin/analytics"],
  ["留言管理", "/admin/messages"],
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="admin-page">
      <div className="admin-shell">
        <aside className="admin-sidebar">
          <div className="compact">
            <Brand href="/admin" label="AurexEA 管理后台" />
          </div>
          {nav.map(([label, href]) => (
            <Link className="admin-nav" key={href} href={href}>
              {label}
            </Link>
          ))}
          <Link className="admin-return" href="/zh">
            返回前台
          </Link>
          <form action="/api/admin/logout" method="post">
            <button className="admin-return logout-button" type="submit">
              退出登录
            </button>
          </form>
        </aside>
        <div className="admin-main">{children}</div>
      </div>
    </main>
  );
}
