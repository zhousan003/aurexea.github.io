# AurexEA 曜汇EA 代码设计

本文件用于把当前静态页面原型迁移为可部署到 Vercel 的正式网站。

## 技术栈

- 框架：Next.js App Router + TypeScript
- 样式：Tailwind CSS + CSS Modules 或 shadcn/ui
- 数据库：PostgreSQL
- ORM：Prisma
- 文件存储：Vercel Blob
- 后台登录：Auth.js Credentials Provider
- 表单校验：Zod
- 富文本：TipTap 或 Markdown 编辑器
- 部署：Vercel

## 路由设计

前台中文：

- `/zh` 首页
- `/zh/mt4ea` MT4EA 分类
- `/zh/mt5ea` MT5EA 分类
- `/zh/popular` 热门 EA
- `/zh/products/[slug]` 产品详情
- `/zh/download/[slug]` 下载等待页

前台英文：

- `/en`
- `/en/mt4ea`
- `/en/mt5ea`
- `/en/popular`
- `/en/products/[slug]`
- `/en/download/[slug]`

后台：

- `/admin/login`
- `/admin`
- `/admin/products`
- `/admin/categories`
- `/admin/ads`
- `/admin/donations`
- `/admin/seo`
- `/admin/analytics`

后台路由全部加 `noindex, nofollow`，并通过 middleware 要求管理员登录。

## 目录结构

```txt
app/
  [locale]/
    page.tsx
    mt4ea/page.tsx
    mt5ea/page.tsx
    popular/page.tsx
    products/[slug]/page.tsx
    download/[slug]/page.tsx
  admin/
    login/page.tsx
    page.tsx
    products/page.tsx
    categories/page.tsx
    ads/page.tsx
    donations/page.tsx
    seo/page.tsx
    analytics/page.tsx
  api/
    analytics/page-view/route.ts
    analytics/download/route.ts
    upload/route.ts
    download-token/route.ts
components/
  site/
  product/
  download/
  admin/
lib/
  auth.ts
  db.ts
  i18n.ts
  seo.ts
  storage.ts
  analytics.ts
prisma/
  schema.prisma
```

## 数据模型

核心表：

- `User`：后台管理员
- `Category`：产品分类
- `CategoryTranslation`：分类中英文内容
- `Product`：EA 产品主表
- `ProductTranslation`：产品中英文标题、详情、SEO
- `ProductImage`：产品图片
- `ProductFile`：EA 文件、SetFiles、版本
- `AdSlot`：广告位配置
- `DonationSetting`：打赏配置，支持两张二维码
- `VisitEvent`：访问量事件
- `DownloadEvent`：下载事件
- `SeoSetting`：页面 SEO 配置

产品主字段：

- `platform`: `MT4 | MT5 | BOTH`
- `symbol`: 例如 `XAUUSD`
- `timeframes`: 字符串数组
- `slug`
- `status`: `DRAFT | PUBLISHED | ARCHIVED`
- `isPopular`
- `publishedAt`
- `downloadCount`

广告配置字段：

- `name`
- `placement`: `DOWNLOAD_PAGE_MAIN | HOME_SIDEBAR | PRODUCT_DETAIL`
- `network`: `ADSENSE | CUSTOM | DISABLED`
- `desktopSize`: `RESPONSIVE | 970x250 | 728x90 | 336x280 | 300x250 | 300x600`
- `mobileSize`: `RESPONSIVE | 320x100 | 300x250 | 336x280`
- `desktopCode`
- `mobileCode`
- `fallbackCode`
- `countdownSeconds`

打赏配置字段：

- `titleZh`
- `titleEn`
- `descriptionZh`
- `descriptionEn`
- `qr1Network`
- `qr1Address`
- `qr1ImageUrl`
- `qr2Network`
- `qr2Address`
- `qr2ImageUrl`

## API 设计

访问量：

- `POST /api/analytics/page-view`
- 参数：`path`, `locale`, `referrer`
- 服务端补充：国家、IP hash、User-Agent

下载事件：

- `POST /api/analytics/download`
- 参数：`productId`, `fileId`, `locale`
- 写入下载事件，同时更新产品 `downloadCount`

下载令牌：

- `POST /api/download-token`
- 参数：`productId`
- 返回短期下载 URL
- 下载等待页倒计时结束后调用

上传：

- `POST /api/upload`
- 仅管理员可用
- 上传产品图、EA 文件、USDT 二维码到 Vercel Blob

## 下载流程

1. 用户进入产品详情页。
2. 点击免费下载。
3. 跳转到 `/zh/download/[slug]` 或 `/en/download/[slug]`。
4. 页面展示后台配置的下载页主广告位。
5. 倒计时结束后请求 `/api/download-token`。
6. 显示真实下载按钮。
7. 用户点击下载时写入 `DownloadEvent`。

注意：不要求用户点击广告，只进行广告展示和等待。

## 国际化

中文和英文完全分开路由，不混合 UI 文案。

- URL 层：`/zh/*` 和 `/en/*`
- 数据层：使用 translation 表
- SEO：每个页面输出 `hreflang`
- 用户切换语言：跳转到对应 locale 的同一资源

## 后台权限

第一阶段只做管理员：

- 登录后台
- 管理产品、分类、广告、打赏、SEO
- 查看访问量和下载排名

后续可扩展角色：

- `ADMIN`
- `EDITOR`

## SEO 设计

- 每个产品详情页 SSR/ISR 输出
- sitemap 自动包含首页、分类、产品详情页
- robots 禁止 `/admin`
- 产品详情结构化数据：`SoftwareApplication`
- 面包屑结构化数据：`BreadcrumbList`
- 图片 alt 使用产品标题和平台
- canonical 指向当前语言页面
- `hreflang` 关联中英文页面

## Vercel 部署

需要配置环境变量：

```txt
DATABASE_URL=
AUTH_SECRET=
BLOB_READ_WRITE_TOKEN=
NEXT_PUBLIC_SITE_URL=
ADMIN_EMAIL=
ADMIN_PASSWORD=
ADMIN_PASSWORD_HASH=
```

推荐服务：

- Vercel Hosting
- Vercel Blob
- Neon PostgreSQL 或 Supabase PostgreSQL

## 从原型迁移

当前文件对应关系：

- `index.html` -> `/zh`、`/zh/mt4ea`、`/zh/mt5ea`、`/zh/popular`
- `en.html` -> `/en` 对应页面
- `admin.html` -> `/admin/*`
- `styles.css` -> Tailwind 组件样式或全局 CSS tokens
- `script.js` -> React 状态、下载倒计时组件
- `admin.js` -> Admin Layout + active route

## 开发顺序

1. 初始化 Next.js + TypeScript + Tailwind + Prisma。
2. 建立 Prisma schema 和数据库迁移。
3. 搭建中英文前台路由。
4. 迁移产品卡、详情页、下载等待页组件。
5. 搭建后台登录和后台 Layout。
6. 开发产品、分类、广告、打赏、SEO 管理。
7. 接入 Vercel Blob 上传。
8. 接入访问量和下载事件。
9. 完成 sitemap、robots、metadata、结构化数据。
10. 部署 Vercel 并配置域名。
