import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function EditProductPage() {
  return (
    <AppShell>
      <Card>
        <CardHeader><CardTitle>編輯產品</CardTitle></CardHeader>
        <CardContent className="text-sm text-muted-foreground">產品編輯、多步驟表單、權限檢查與 AuditLog 將於 Phase 2 / Phase 3 完整實作。</CardContent>
      </Card>
    </AppShell>
  );
}
