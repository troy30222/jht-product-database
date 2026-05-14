# Product Database 開發計畫

## 1. 系統需求理解
本系統是公司內部 Product Database 後台，核心使用者包含業務、行銷、主管與 Admin。系統必須可管理產品基本資料、圖片、規格模板、不同類型的規格值、行銷內容、業務話術、比較、匯入匯出、Dashboard、Brand Positioning、Gap Analysis、權限與 Audit Log。整體 UI 使用繁體中文，品牌與系統 key 保持英文 lowercase。

## 2. 技術架構
採用 Next.js App Router + TypeScript，前後端都在 Next.js 專案內，但資料庫只能由 Server Components、Server Actions 或 API Routes 經 Prisma 存取。UI 使用 Tailwind CSS、shadcn/ui style components、TanStack Table、Recharts、lucide-react。表單使用 React Hook Form + Zod。登入使用 Auth.js / NextAuth Credentials Provider，密碼使用 bcrypt hash。

資料流固定為：

```txt
Frontend UI → Next.js Server Actions / API Routes → Prisma ORM → MySQL
```

## 3. MySQL / Prisma 設計注意事項
Prisma datasource provider 必須是 `mysql`。價格與可比較數值使用 `Decimal`，不使用 Float。MySQL 不支援 Prisma scalar list，因此規格別名使用 `SpecAlias` table，不使用 `String[]`。JSON 欄位只用於 FAQ、marketing points、import summary/error 等半結構化資料。產品規格不寫死在 Product table，而是透過 `SpecTemplate`、`SpecAttribute`、`SpecTemplateAttribute`、`ProductSpecValue` 建模。

## 4. 不同產品 Spec 處理方式
每個產品可以套用不同 `SpecTemplate`；模板透過 `SpecTemplateAttribute` 指定該模板有哪些 `SpecAttribute`、哪些 required、哪些 core specs。實際產品規格存在 `ProductSpecValue`，永遠保留 `rawValue`，另存 `displayValue` 與 normalized 欄位供比較、排序、篩選與分析使用。

## 5. 產品比較處理方式
比較引擎會先判斷比較模式：相同模板、相同 category 不同 subcategory、不同 category 定位比較、strength machineFunction 比較。不同大類不做硬性規格優劣；strength 必須 machineFunction 相同才做完整 benchmark。可比較規格依 `CompareType` 判斷 higher/lower/range/dimension/text/neutral。

## 6. Excel 匯入處理方式
匯入流程分成 upload、preview sheets、format selection、product detection、spec detection、mapping、validation、preview result、run import、report。Spec name 先 normalize 後比對 `SpecAttribute.key`，找不到再比對 `SpecAlias.normalizedAliasName`，仍找不到列入 unmapped specs 供 Admin mapping 或建立新 attribute。

## 7. Hostinger 部署處理方式
Hostinger 必須使用 Node.js / Next.js runtime，不可使用 static-only export。Production 需設定 `DATABASE_URL`、`NEXTAUTH_SECRET`、`NEXTAUTH_URL`、`UPLOAD_DIR`、`APP_URL`。部署流程使用 `npm install`、`npx prisma generate`、`npx prisma migrate deploy`、`npm run build`、`npm run start`。本機 storage 需確認 uploads 權限，正式環境可切換 Cloudflare R2 / S3。

## 8. 開發 Phase
- Phase 1：基礎架構、Next.js、Tailwind、Prisma MySQL schema、Auth、layout、權限、seed、README、env example。
- Phase 2：Brand / Category / Subcategory / Product CRUD、列表、詳細、新增編輯、圖片上傳。
- Phase 3：Spec dictionary、alias、template、dynamic spec form、normalization、completeness score。
- Phase 4：Compare engine、compare UI、comparison export。
- Phase 5：Dashboard、Brand Positioning、Price Bands、Gap Analysis、matrix、charts、suggestions。
- Phase 6：CSV / Excel import/export、preview、mapping、validation、reports。
- Phase 7：Marketing、Sales、Audit Log、權限強化、測試與文件補強。
