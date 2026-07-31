type DashboardData = {
  todayVisits: number;
  todayDownloads: number;
  publishedProducts: number;
  activeAds: number;
  dailyVisits: Array<{ label: string; count: number }>;
  downloadRanking: Array<{ id: string; title: string; downloads: number }>;
};

export function AdminDashboard({ data }: { data: DashboardData }) {
  const maxVisits = Math.max(...data.dailyVisits.map((item) => item.count), 1);

  return (
    <>
      <div className="admin-heading">
        <div>
          <p className="eyebrow">后台管理</p>
          <h1>后台仪表盘</h1>
        </div>
      </div>
      <div className="metric-grid">
        <article className="metric-card">
          <span>今日访问量</span>
          <strong>{data.todayVisits.toLocaleString()}</strong>
          <small>来自 visit_events 实时统计</small>
        </article>
        <article className="metric-card">
          <span>今日下载</span>
          <strong>{data.todayDownloads.toLocaleString()}</strong>
          <small>来自 download_events 实时统计</small>
        </article>
        <article className="metric-card">
          <span>上架产品</span>
          <strong>{data.publishedProducts.toLocaleString()}</strong>
          <small>按 MT4 / MT5 / 分类管理</small>
        </article>
        <article className="metric-card">
          <span>广告位</span>
          <strong>{data.activeAds.toLocaleString()}</strong>
          <small>首页、详情页、下载页、侧栏</small>
        </article>
      </div>
      <div className="admin-grid">
        <section className="admin-panel">
          <div className="panel-head">
            <h2>每日访问量</h2>
            <span>最近 7 天</span>
          </div>
          <div className="bar-chart" aria-label="每日访问量图表">
            {(data.dailyVisits.length ? data.dailyVisits : [{ label: "Today", count: 0 }]).map((item) => (
              <span key={item.label} style={{ height: `${Math.max(8, (item.count / maxVisits) * 100)}%` }}>
                <b>{item.label}</b>
              </span>
            ))}
          </div>
        </section>
        <section className="admin-panel">
          <div className="panel-head">
            <h2>下载排名</h2>
            <span>Top Products</span>
          </div>
          <ol className="ranking-list">
            {(data.downloadRanking.length ? data.downloadRanking : [{ id: "empty", title: "暂无下载数据", downloads: 0 }]).map((item) => (
              <li key={item.id}><span>{item.title}</span><strong>{item.downloads.toLocaleString()}</strong></li>
            ))}
          </ol>
        </section>
      </div>
    </>
  );
}
