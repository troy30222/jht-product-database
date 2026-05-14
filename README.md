# JHT Product Database

公司內部 Product Database 後台系統，用於管理、查詢、比較、匯入、匯出與分析健身器材產品資料。

> Phase 1 已建立 Next.js / TypeScript / Tailwind / Prisma MySQL / Auth.js / 權限 helper / AuditLog / seed data / Hostinger 部署文件的基礎架構。Demo product 皆明確標示為 `sample / demo`，不可視為真實產品規格。

## 架構原則

前端不可直接連接 MySQL。所有資料庫操作必須經過 Next.js server-side layer：

```txt
Frontend UI → Next.js Server Actions / API Routes → Prisma ORM → MySQL
```

## 技術棧

- Next.js App Router
- TypeScript
- Server Components / Server Actions / API Routes
- MySQL + Prisma ORM
- Auth.js / NextAuth Credentials Provider
- bcryptjs password hash
- Tailwind CSS + shadcn/ui style components
- TanStack Table、Recharts、lucide-react
- React Hook Form、Zod
- xlsx / exceljs for import/export phases

## 本機安裝

```bash
npm install
cp .env.example .env
npx prisma generate
npx prisma migrate dev
npx prisma db seed
npm run dev
```

開啟：<http://localhost:3000>

## MySQL 設定

`.env` 至少需要：

```env
DATABASE_URL="mysql://USER:PASSWORD@HOST:3306/DATABASE_NAME"
NEXTAUTH_SECRET="replace-with-a-secure-random-secret"
NEXTAUTH_URL="http://localhost:3000"
UPLOAD_DIR="storage/uploads"
APP_URL="http://localhost:3000"
```

Hostinger MySQL database name、user、password、host 需填入 `DATABASE_URL`。請確認 MySQL 使用者有 migration 與資料表讀寫權限。

## Production build

```bash
npm run build
npm run start
```

## Hostinger Node.js / Next.js 部署注意事項

1. 必須使用 Node.js runtime，不能使用 static-only export。
2. 需要在 Hostinger Panel 設定環境變數：`DATABASE_URL`、`NEXTAUTH_SECRET`、`NEXTAUTH_URL`、`UPLOAD_DIR`、`APP_URL`。
3. 前端 bundle 不可包含 MySQL 帳密；所有 DB 存取都在 Prisma server-side。
4. 確認 `storage/uploads` 或設定的 `UPLOAD_DIR` 有寫入權限。
5. 若 Hostinger 本機 storage 不穩定，建議改用 Cloudflare R2 / AWS S3，專案已建立 storage abstraction layer。
6. Production migration 使用：

```bash
npx prisma generate
npx prisma migrate deploy
```

## Seed

```bash
npm run db:seed
```

Seed 內容包含：

- Brands：matrix、vision、horizon、bowflex、schwinn、other
- Categories / Subcategories
- Spec Templates / Spec Attributes / Spec Aliases
- Price Bands：Entry / Mid / Premium / Commercial
- Demo Products：sample / demo only
- Users：各角色 demo account

## 預設帳號

所有 demo 帳號預設密碼：`ChangeMe123!`

| Role | Email |
| --- | --- |
| super_admin | super_admin@example.com |
| admin | admin@example.com |
| manager | manager@example.com |
| marketing | marketing@example.com |
| sales | sales@example.com |
| viewer | viewer@example.com |

正式環境請立即更改所有預設密碼。

## Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
npm run typecheck
npm run prisma:generate
npm run prisma:migrate
npm run prisma:deploy
npm run prisma:seed
npm run db:seed
npm run test
```

## 安全提醒

- 正式環境必須更換 `NEXTAUTH_SECRET`。
- 不要 commit `.env`。
- MySQL 帳密不可出現在前端程式碼。
- Mutation 必須做 server-side 權限檢查與 AuditLog。
- 密碼只可儲存 bcrypt hash，不可明文儲存。
