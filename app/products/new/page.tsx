import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function NewProductPage() {
  return (
    <AppShell>
      <Card>
        <CardHeader><CardTitle>新增產品</CardTitle></CardHeader>
        <CardContent className="text-sm text-muted-foreground">多步驟產品表單將於 Phase 2 / Phase 3 實作。</CardContent>
      </Card>
    </AppShell>
  );
}
