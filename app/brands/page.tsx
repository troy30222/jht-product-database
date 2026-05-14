import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Page() {
  return (
    <AppShell>
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-bold">Brands</h1>
          <p className="text-muted-foreground">此頁已納入後台路由與權限保護，後續 Phase 會補上完整操作 MVP。</p>
        </div>
        <Card>
          <CardHeader><CardTitle>開發狀態</CardTitle></CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Phase 1 建立基礎 UI shell、Server-side auth 與資料模型。此路由會在後續 Phase 依需求加入表格、表單、匯入匯出與分析功能。
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
