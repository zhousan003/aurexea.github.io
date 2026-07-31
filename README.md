# AurexEA 曜汇EA

免费 MT4/MT5 EA 资源站，使用 Next.js、Prisma、PostgreSQL 和 Vercel 部署。前台支持中文/英文页面，后台支持产品、分类、广告、打赏、SEO 和统计管理。

## 已完成模块

- 前台：首页、MT4EA、MT5EA、热门 EA、产品详情、下载等待页
- 中英文独立路由：`/zh`、`/en`
- 后台登录保护：`/admin/login`
- 后台产品管理：新增/编辑产品、首页列表小图上传、详情测试报告多图上传、上传 EA 文件、上架/下架、删除
- 后台分类管理：新增分类
- 后台广告配置：下载等待页广告代码、倒计时秒数
- 后台打赏配置：USDT 地址、两张二维码上传
- 后台 SEO 配置：按路径和语言保存 SEO 信息
- 访问统计：前台访问写入 `visit_events`
- 下载统计：下载倒计时完成后写入 `download_events` 并更新产品下载数

## 后台登录

- 后台地址：`/admin`
- 未登录访问后台会自动跳转到 `/admin/login`
- 本地默认账号：`admin@example.com`
- 本地默认密码：`admin123456`
- 部署到 Vercel 前请配置 `ADMIN_EMAIL`、`ADMIN_PASSWORD` 或 `ADMIN_PASSWORD_HASH`、`AUTH_SECRET`

## 数据库初始化

配置 `.env`：

```txt
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/aurexea?schema=public"
AUTH_SECRET="replace-with-random-secret"
ADMIN_EMAIL="admin@example.com"
ADMIN_PASSWORD="change-this-password"
NEXT_PUBLIC_SITE_URL="https://aurexea.com"
BLOB_READ_WRITE_TOKEN="vercel-blob-token"
```

初始化数据库：

```bash
npm run prisma:generate
npm run db:push
npm run db:seed
```

没有配置 `DATABASE_URL` 时，前台会使用内置示例产品兜底展示；后台保存功能需要数据库。

## 产品图片规则

- `首页产品小图上传`：显示在首页、MT4EA、MT5EA、热门 EA 等产品列表卡片中，前台固定为 4:3 裁切展示，避免图片变形。
- `详情测试报告图片`：可以一次上传多张，显示在产品详情页主图下方的报告图片区域。
- 中文简介和英文简介已取消，前台摘要会从中英详情介绍中自动截取。

## 本地运行

```bash
npm run dev
```

如果 `3000` 端口被占用，Next.js 会自动切换到下一个可用端口。

## 本地 PostgreSQL 完整测试

项目已提供 `docker-compose.yml` 和本地 `.env.local`。安装 Docker Desktop 后，在项目目录运行：

```bash
docker compose up -d
npm run prisma:generate
npm run db:push
npm run db:seed
npm run dev -- --port 3002
```

当前 `docker-compose.yml` 使用 DaoCloud 镜像源拉取 PostgreSQL，适合 Docker Hub 连接不稳定的网络环境。

本地数据库连接：

```txt
postgresql://aurexea:aurexea_local_password@localhost:5432/aurexea?schema=public
```

后台测试账号：

```txt
admin@example.com
admin123456
```

如果修改了 `.env.local`，需要重启 `npm run dev`。

## 广告下载合规建议

下载流程使用“下载等待页展示广告，倒计时结束后显示下载链接”。不要强制用户点击广告，也不要写“点击广告解锁下载”。Google AdSense 对诱导点击和激励点击限制较严，后台可配置 Google AdSense、自定义广告联盟代码或关闭广告。

## Vercel 部署

推荐服务：

- Vercel Hosting
- Vercel Blob
- Neon PostgreSQL 或 Supabase PostgreSQL

部署前在 Vercel Project Settings 中配置 `.env` 里的环境变量，然后执行数据库初始化命令。
