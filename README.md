# Fit Together

双人健身打卡网站。进入 `/room/[roomId]` 后选择身份 A/B，身份只保存在当前设备的 `localStorage`。每日打卡日期由服务端按 `Asia/Shanghai` 自然日计算。

## 功能

- 今日打卡和编辑今日记录
- 训练 / 休息状态
- 训练类型、训练时长、备注
- 月度日历展示 A/B 每天状态
- 月度总结：打卡、休息、缺卡、连续打卡、共同打卡
- Neon Postgres + Drizzle ORM 持久化
- 成员昵称、头像底色和 Vercel Blob 头像上传

## 本地运行

```bash
npm install
cp .env.example .env.local
npm run db:migrate
npm run dev
```

打开 `http://localhost:3000/room/fit-together`。

没有配置 `DATABASE_URL` 时页面仍可预览，但无法保存打卡。没有配置 `BLOB_READ_WRITE_TOKEN` 时可以保存昵称和头像底色，但不能上传图片头像。

## 数据库

1. 在 Neon 创建 Postgres 数据库。
2. 把连接串填入 `.env.local`：

```bash
DATABASE_URL="postgresql://USER:PASSWORD@HOST.neon.tech/DB?sslmode=require"
```

3. 生成迁移：

```bash
npm run db:generate
```

4. 执行迁移：

```bash
npm run db:migrate
```

当前迁移文件在 `drizzle/`。

## Vercel 部署

1. 在 Vercel 导入仓库。
2. 在 Project Settings -> Storage 创建或连接 Vercel Blob。
3. 在 Project Settings -> Environment Variables 添加 `DATABASE_URL` 和 `BLOB_READ_WRITE_TOKEN`。
4. 部署前确保 Neon 已执行 `npm run db:migrate`。
5. Build Command 使用默认 `next build`。

## 验证

```bash
npm run lint
npm run test
npm run build
```
