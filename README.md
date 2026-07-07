# Fit Together

双人健身打卡网站。进入 `/room/[roomId]` 后选择身份 A/B，身份只保存在当前设备的 `localStorage`。每日打卡日期由服务端按 `Asia/Shanghai` 自然日计算。

房间页和房间 API 使用轻量共享密码保护。登录成功后会写入 `HttpOnly` cookie，当前设备会保持登录 180 天。

## 功能

- 今日打卡和编辑今日记录
- 训练 / 休息状态
- 训练类型、训练时长、备注、打卡图片
- 拍照上传和图库选择打卡图片
- 朋友圈式打卡动态流
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

没有配置 `ROOM_PASSWORD` 时房间会保持锁定。没有配置 `DATABASE_URL` 时页面仍可预览，但无法保存打卡。没有配置 `BLOB_READ_WRITE_TOKEN` 时可以保存昵称和头像底色，但不能上传头像和打卡图片。

`AUTH_SECRET` 用于签名登录 cookie；建议在 Vercel 和本地都设置一个长随机字符串。如果不设置，会退回使用 `ROOM_PASSWORD` 签名。

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
3. 在 Project Settings -> Environment Variables 添加 `DATABASE_URL`、`BLOB_READ_WRITE_TOKEN`、`ROOM_PASSWORD` 和 `AUTH_SECRET`。
4. 部署前确保 Neon 已执行 `npm run db:migrate`。
5. Build Command 使用默认 `next build`。

## 验证

```bash
npm run lint
npm run test
npm run build
```
