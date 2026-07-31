import { getAdminLoginHint } from "@/lib/admin-auth";

type AdminLoginPageProps = {
  searchParams?: Promise<{
    error?: string;
    from?: string;
  }>;
};

export default async function AdminLoginPage({ searchParams }: AdminLoginPageProps) {
  const params = await searchParams;
  const loginHint = getAdminLoginHint();
  const from = params?.from || "/admin";

  return (
    <main className="admin-login-page">
      <section className="admin-login-card">
        <div className="admin-login-brand">
          <span className="brand-mark"><span /></span>
          <div>
            <strong>AurexEA</strong>
            <small>管理后台</small>
          </div>
        </div>
        <p className="eyebrow">管理员登录</p>
        <h1>登录后台</h1>
        <p className="admin-login-copy">请输入管理员邮箱和密码，登录后可管理产品、广告、打赏二维码和访问统计。</p>
        {params?.error ? <div className="admin-login-error">邮箱或密码不正确，请重新输入。</div> : null}
        <form className="admin-form" action="/api/admin/login" method="post">
          <input type="hidden" name="from" value={from} />
          <label>
            邮箱
            <input type="email" name="email" defaultValue={loginHint.email} autoComplete="username" required />
          </label>
          <label>
            密码
            <input type="password" name="password" autoComplete="current-password" required />
          </label>
          <button className="primary-button full" type="submit">登录</button>
        </form>
        {loginHint.usesDefaultPassword ? (
          <p className="admin-login-hint">本地测试默认密码：admin123456。部署前请在 Vercel 环境变量中修改。</p>
        ) : null}
      </section>
    </main>
  );
}
