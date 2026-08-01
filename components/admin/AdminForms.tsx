import { AdNetwork, PublishStatus } from "@prisma/client";
import { DonationSection } from "@/components/site/DonationSection";
import { ProductIdentityFields } from "@/components/admin/ProductIdentityFields";
import { DonationQrUploadFields, ProductUploadFields } from "@/components/admin/ProductUploadFields";
import type { AdminCategory, AdminProductRecord } from "@/lib/admin-data";
import type { PublicDonationSetting } from "@/lib/db-data";
import {
  deleteCategory,
  deleteProduct,
  saveAdSlot,
  saveCategory,
  saveDonationSetting,
  saveProduct,
  saveSeoSetting,
  setCategoryStatus,
  setProductStatus,
} from "@/app/admin/(protected)/actions";

function productTitle(product: AdminProductRecord) {
  return product.translations.find((translation) => translation.locale === "zh")?.title || product.slug;
}

function productTranslation(product: AdminProductRecord | null | undefined, locale: "zh" | "en") {
  return product?.translations.find((translation) => translation.locale === locale);
}

function categoryName(category: Pick<AdminCategory, "slug" | "translations">, locale: "zh" | "en") {
  return category.translations.find((translation) => translation.locale === locale)?.name || category.slug;
}

function categoryTranslation(category: AdminCategory | null | undefined, locale: "zh" | "en") {
  return category?.translations.find((translation) => translation.locale === locale);
}

function statusLabel(status: PublishStatus) {
  if (status === PublishStatus.PUBLISHED) return "上架";
  if (status === PublishStatus.ARCHIVED) return "下架";
  return "草稿";
}

export function ProductAdminPage({
  products,
  categories,
  editingProduct,
  savedSlug,
  deleted,
}: {
  products: AdminProductRecord[];
  categories: AdminCategory[];
  editingProduct?: AdminProductRecord | null;
  savedSlug?: string | null;
  deleted?: boolean;
}) {
  const zhTranslation = productTranslation(editingProduct, "zh");
  const enTranslation = productTranslation(editingProduct, "en");
  const defaultPlatform = editingProduct?.platform === "BOTH" ? "MT4/MT5" : editingProduct?.platform || "MT5";
  const defaultThumbnail = editingProduct?.images.find((image) => image.sortOrder === 0)?.url;
  const defaultReports = editingProduct?.images.filter((image) => image.sortOrder > 0).map((image) => image.url) || [];
  const defaultFile = editingProduct?.files[0]?.fileUrl;

  return (
    <>
      <div className="admin-heading">
        <div>
          <p className="eyebrow">产品管理</p>
          <h1>{editingProduct ? "编辑 EA 产品" : "EA 产品管理"}</h1>
        </div>
        <a className="primary-button admin-heading-action" href="#product-upload-form">
          {editingProduct ? "编辑当前产品" : "上传 EA 软件"}
        </a>
      </div>
      {savedSlug ? <div className="admin-toast success">已保存产品：{savedSlug}</div> : null}
      {deleted ? <div className="admin-toast success">产品已删除</div> : null}
      <div className="admin-two-column">
        <section className="admin-panel" id="product-upload-form">
          <div className="panel-head">
            <h2>{editingProduct ? "编辑产品" : "新增产品"}</h2>
            <span>保存后同步前台页面</span>
          </div>
          <form className="admin-form" action={saveProduct}>
            {editingProduct ? <input type="hidden" name="id" value={editingProduct.id} /> : null}
            <label>
              产品中文标题
              <input
                name="titleZh"
                type="text"
                defaultValue={zhTranslation?.title || "带 SetFiles 的黄金量化剥头皮 EA MT5"}
                required
              />
            </label>
            <ProductIdentityFields
              defaultTitleEn={enTranslation?.title || "Gold Quant Scalper MT5 + SetFiles"}
              defaultSlug={editingProduct?.slug || "gold-quant-scalper-mt5"}
            />
            <div className="form-grid">
              <label>平台<select name="platform" defaultValue={defaultPlatform}><option>MT5</option><option>MT4</option><option>MT4/MT5</option></select></label>
              <label>分类<select name="categoryId" defaultValue={editingProduct?.categoryId || categories[0]?.id || ""}><option value="">未分类</option>{categories.map((category) => <option key={category.id} value={category.id}>{categoryName(category, "zh")}</option>)}</select></label>
            </div>
            <div className="form-grid">
              <label>交易品种<input name="symbol" type="text" defaultValue={editingProduct?.symbol || "XAUUSD"} /></label>
              <label>时间周期<input name="timeframes" type="text" defaultValue={editingProduct?.timeframes.join(",") || "M5,M15,H1"} /></label>
            </div>
            <div className="form-grid">
              <label>推荐星级<input name="rating" type="number" min="0" max="5" step="0.5" defaultValue={editingProduct ? Number(editingProduct.rating) : 5} /></label>
              <label>原价 USD<input name="originalPrice" type="number" min="0" step="0.01" defaultValue={editingProduct ? Number(editingProduct.originalPrice ?? 0) : "399.00"} /></label>
            </div>
            <div className="form-grid">
              <label>下载价 USD<input name="freePrice" type="number" min="0" step="0.01" defaultValue={editingProduct ? Number(editingProduct.freePrice ?? 0) : "0.00"} /></label>
              <label>状态<select name="status" defaultValue={editingProduct?.status || "PUBLISHED"}><option value="PUBLISHED">上架</option><option value="ARCHIVED">下架</option><option value="DRAFT">草稿</option></select></label>
            </div>
            <label className="checkbox-line"><input name="isPopular" type="checkbox" defaultChecked={editingProduct?.isPopular ?? true} /> 热门 EA</label>
            <label>中文详情<textarea name="descriptionZh" className="code-area" defaultValue={zhTranslation?.description || "策略逻辑、适用品种、安装步骤、参数建议、回测说明和版本更新记录。"} /></label>
            <label>英文详情<textarea name="descriptionEn" className="code-area" defaultValue={enTranslation?.description || "Strategy logic, supported symbols, setup steps, parameters, backtest notes and version updates."} /></label>
            <ProductUploadFields thumbnailUrl={defaultThumbnail} reportImages={defaultReports} fileUrl={defaultFile} />
            <div className="form-actions">
              <button className="primary-button" type="submit">保存产品</button>
              {editingProduct ? <a className="text-button" href="/admin/products">取消编辑</a> : null}
            </div>
          </form>
        </section>
        <section className="admin-panel">
          <div className="panel-head"><h2>产品列表</h2><span>上架 / 下架 / 删除</span></div>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead><tr><th>产品</th><th>平台</th><th>分类</th><th>下载</th><th>状态</th><th>操作</th></tr></thead>
              <tbody>
                {products.length ? products.map((product) => (
                  <tr key={product.id}>
                    <td>{productTitle(product)}</td>
                    <td>{product.platform}</td>
                    <td>{product.category ? categoryName(product.category, "zh") : "未分类"}</td>
                    <td>{product.downloadCount}</td>
                    <td><span className={`status ${product.status === PublishStatus.PUBLISHED ? "on" : "off"}`}>{statusLabel(product.status)}</span></td>
                    <td>
                      <div className="table-actions">
                        <form action={setProductStatus}>
                          <input type="hidden" name="id" value={product.id} />
                          <input type="hidden" name="status" value={product.status === PublishStatus.PUBLISHED ? "ARCHIVED" : "PUBLISHED"} />
                          <button type="submit">{product.status === PublishStatus.PUBLISHED ? "下架" : "上架"}</button>
                        </form>
                        <a href={`/admin/products/${product.id}`}>编辑</a>
                        <form action={deleteProduct}>
                          <input type="hidden" name="id" value={product.id} />
                          <button type="submit">删除</button>
                        </form>
                      </div>
                    </td>
                  </tr>
                )) : <tr><td colSpan={6}>暂无数据库产品。请先配置 DATABASE_URL 并保存产品。</td></tr>}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </>
  );
}

export function CategoryAdminPage({
  categories,
  editingCategory,
  savedSlug,
  deleted,
}: {
  categories: AdminCategory[];
  editingCategory?: AdminCategory | null;
  savedSlug?: string | null;
  deleted?: boolean;
}) {
  const zhTranslation = categoryTranslation(editingCategory, "zh");
  const enTranslation = categoryTranslation(editingCategory, "en");

  return (
    <>
      <div className="admin-heading">
        <div><p className="eyebrow">分类管理</p><h1>{editingCategory ? "编辑产品分类" : "产品分类管理"}</h1></div>
        <a className="primary-button admin-heading-action" href="#category-form">
          {editingCategory ? "编辑当前分类" : "新增分类"}
        </a>
      </div>
      {savedSlug ? <div className="admin-toast success">已保存分类：{savedSlug}</div> : null}
      {deleted ? <div className="admin-toast success">分类已删除</div> : null}
      <div className="admin-grid">
        <section className="admin-panel">
          <div className="panel-head"><h2>分类列表</h2><span>新增 / 编辑 / 上下架 / 删除</span></div>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead><tr><th>分类</th><th>Slug</th><th>产品</th><th>状态</th><th>操作</th></tr></thead>
              <tbody>
                {categories.length ? categories.map((category) => (
                  <tr key={category.id}>
                    <td>{categoryName(category, "zh")}</td>
                    <td>{category.slug}</td>
                    <td>{category._count.products}</td>
                    <td><span className={`status ${category.status === PublishStatus.PUBLISHED ? "on" : "off"}`}>{statusLabel(category.status)}</span></td>
                    <td>
                      <div className="table-actions">
                        <form action={setCategoryStatus}>
                          <input type="hidden" name="id" value={category.id} />
                          <input type="hidden" name="status" value={category.status === PublishStatus.PUBLISHED ? "ARCHIVED" : "PUBLISHED"} />
                          <button type="submit">{category.status === PublishStatus.PUBLISHED ? "下架" : "上架"}</button>
                        </form>
                        <a href={`/admin/categories/${category.id}`}>编辑</a>
                        <form action={deleteCategory}>
                          <input type="hidden" name="id" value={category.id} />
                          <button type="submit">删除</button>
                        </form>
                      </div>
                    </td>
                  </tr>
                )) : <tr><td colSpan={5}>暂无分类。请使用右侧新增分类表单创建。</td></tr>}
              </tbody>
            </table>
          </div>
        </section>
        <section className="admin-panel" id="category-form">
          <div className="panel-head">
            <h2>{editingCategory ? "编辑分类" : "新增分类"}</h2>
            <span>保存后前台分类和产品表单同步更新</span>
          </div>
          <form className="admin-form" action={saveCategory}>
            {editingCategory ? <input type="hidden" name="id" value={editingCategory.id} /> : null}
            <label>中文分类名<input name="nameZh" type="text" defaultValue={zhTranslation?.name || "黄金 EA"} required /></label>
            <label>英文分类名<input name="nameEn" type="text" defaultValue={enTranslation?.name || "Gold EA"} required /></label>
            <label>URL Slug<input name="slug" type="text" defaultValue={editingCategory?.slug || "gold-ea"} required /></label>
            <label>排序<input name="sortOrder" type="number" defaultValue={editingCategory?.sortOrder ?? 0} /></label>
            <label>状态<select name="status" defaultValue={editingCategory?.status || "PUBLISHED"}><option value="PUBLISHED">上架</option><option value="ARCHIVED">下架</option><option value="DRAFT">草稿</option></select></label>
            <label>中文描述<textarea name="descriptionZh" defaultValue={zhTranslation?.description || ""} /></label>
            <label>英文描述<textarea name="descriptionEn" defaultValue={enTranslation?.description || ""} /></label>
            <div className="form-actions">
              <button className="primary-button" type="submit">保存分类</button>
              {editingCategory ? <a className="text-button" href="/admin/categories">取消编辑</a> : null}
            </div>
          </form>
        </section>
      </div>
    </>
  );
}

export function AdsAdminPage({ adSlot }: { adSlot: { id: string; name: string; network: AdNetwork; desktopSize: string; mobileSize: string; desktopCode: string | null; mobileCode: string | null; fallbackCode: string | null; countdownSeconds: number; isActive: boolean } | null }) {
  return (
    <>
      <div className="admin-heading"><div><p className="eyebrow">广告配置</p><h1>下载广告配置</h1></div></div>
      <div className="admin-two-column">
        <section className="admin-panel">
          <div className="panel-head"><h2>广告位设置</h2><span>下载前展示倒计时</span></div>
          <form className="admin-form" action={saveAdSlot}>
            {adSlot?.id ? <input type="hidden" name="id" value={adSlot.id} /> : null}
            <label>广告位名称<input name="name" type="text" defaultValue={adSlot?.name || "下载等待页主广告位"} required /></label>
            <label>广告联盟<select name="network" defaultValue={adSlot?.network || "ADSENSE"}><option value="ADSENSE">Google AdSense</option><option value="CUSTOM">其他广告联盟 / 自定义代码</option></select></label>
            <label>倒计时秒数<input name="countdownSeconds" type="number" min="1" max="60" defaultValue={adSlot?.countdownSeconds || 5} /></label>
            <label>桌面端尺寸模板<input name="desktopSize" type="text" defaultValue={adSlot?.desktopSize || "RESPONSIVE"} /></label>
            <label>移动端尺寸模板<input name="mobileSize" type="text" defaultValue={adSlot?.mobileSize || "RESPONSIVE"} /></label>
            <label>桌面端广告代码<textarea name="desktopCode" className="code-area" defaultValue={adSlot?.desktopCode || ""} /></label>
            <label>移动端广告代码<textarea name="mobileCode" className="code-area" defaultValue={adSlot?.mobileCode || ""} /></label>
            <label>备用广告代码<textarea name="fallbackCode" className="code-area" defaultValue={adSlot?.fallbackCode || ""} /></label>
            <label className="checkbox-line"><input name="isActive" type="checkbox" defaultChecked={adSlot?.isActive ?? true} /> 启用广告位</label>
            <div className="form-actions"><button className="primary-button" type="submit">保存广告配置</button></div>
          </form>
        </section>
        <section className="admin-panel">
          <div className="panel-head"><h2>广告位预览</h2><span>下载等待页主广告</span></div>
          <div className="ad-preview-stack">
            <div className="ad-preview-size wide"><span>970x250</span><strong>桌面大横幅</strong></div>
            <div className="ad-preview-size banner"><span>728x90</span><strong>标准横幅</strong></div>
            <div className="ad-preview-size rectangle"><span>336x280</span><strong>矩形广告</strong></div>
            <div className="ad-preview-size mobile"><span>320x100</span><strong>移动端横幅</strong></div>
          </div>
        </section>
      </div>
    </>
  );
}

export function DonationAdminPage({ setting }: { setting: PublicDonationSetting & { id?: string } | null }) {
  return (
    <>
      <div className="admin-heading"><div><p className="eyebrow">打赏配置</p><h1>USDT 打赏设置</h1></div></div>
      <div className="admin-two-column">
        <section className="admin-panel">
          <div className="panel-head"><h2>收款信息</h2><span>两张二维码</span></div>
          <form className="admin-form" action={saveDonationSetting}>
            {setting?.id ? <input type="hidden" name="id" value={setting.id} /> : null}
            <label>弹窗中文标题<input name="titleZh" type="text" defaultValue={setting?.titleZh || "请支持网站发展"} required /></label>
            <label>弹窗英文标题<input name="titleEn" type="text" defaultValue={setting?.titleEn || "Please support the site"} required /></label>
            <label>中文说明<textarea name="descriptionZh" defaultValue={setting?.descriptionZh || "你的打赏将用于服务器、文件存储、产品整理和网站持续更新。"} /></label>
            <label>英文说明<textarea name="descriptionEn" defaultValue={setting?.descriptionEn || "Your donation helps cover servers, storage and content updates."} /></label>
            <div className="form-grid">
              <label>二维码一网络<input name="qr1Network" type="text" defaultValue={setting?.qr1Network || "USDT TRC20"} required /></label>
              <label>二维码二网络<input name="qr2Network" type="text" defaultValue={setting?.qr2Network || "USDT ERC20"} /></label>
            </div>
            <label>二维码一地址<input name="qr1Address" type="text" defaultValue={setting?.qr1Address || ""} required /></label>
            <label>二维码二地址<input name="qr2Address" type="text" defaultValue={setting?.qr2Address || ""} /></label>
            <DonationQrUploadFields qr1ImageUrl={setting?.qr1ImageUrl} qr2ImageUrl={setting?.qr2ImageUrl} />
            <div className="form-actions"><button className="primary-button" type="submit">保存打赏配置</button></div>
          </form>
        </section>
        <section className="admin-panel">
          <div className="panel-head"><h2>弹窗预览</h2><span>前台显示效果</span></div>
          <DonationSection locale="zh" setting={setting} />
        </section>
      </div>
    </>
  );
}

export function SeoAdminPage({ settings }: { settings: Array<{ id: string; path: string; locale: "zh" | "en"; title: string; description: string | null; canonical: string | null; ogImageUrl: string | null }> }) {
  return (
    <>
      <div className="admin-heading"><div><p className="eyebrow">SEO 设置</p><h1>SEO 与多语言页面</h1></div></div>
      <div className="admin-two-column">
        <section className="admin-panel">
          <div className="panel-head"><h2>页面 SEO</h2><span>中文和英文分别配置</span></div>
          <form className="admin-form" action={saveSeoSetting}>
            <label>页面路径<input name="path" type="text" defaultValue="/zh" required /></label>
            <label>语言<select name="locale" defaultValue="zh"><option value="zh">中文</option><option value="en">English</option></select></label>
            <label>页面标题<input name="title" type="text" defaultValue="免费 MT4/MT5 EA 下载 - 曜汇EA" required /></label>
            <label>页面描述<textarea name="description" defaultValue="曜汇EA提供免费的 MT4/MT5 EA、SetFiles、指标和量化交易工具下载。" /></label>
            <label>Canonical<input name="canonical" type="text" /></label>
            <label>OG 图片地址<input name="ogImageUrl" type="text" /></label>
            <div className="form-actions"><button className="primary-button" type="submit">保存 SEO</button></div>
          </form>
        </section>
        <section className="admin-panel">
          <ul className="seo-list">
            {settings.length ? settings.map((setting) => (
              <li key={setting.id}><strong>{setting.path} / {setting.locale}</strong><span>{setting.title}</span></li>
            )) : (
              <>
                <li><strong>sitemap.xml</strong><span>自动包含首页、分类页和产品详情页</span></li>
                <li><strong>robots.txt</strong><span>允许前台收录，禁止后台收录</span></li>
                <li><strong>hreflang</strong><span>中文和英文页面互相关联</span></li>
              </>
            )}
          </ul>
        </section>
      </div>
    </>
  );
}
