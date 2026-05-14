import { Boxes, ImageOff, Tags, TrendingUp } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/db/prisma";

export default async function DashboardPage() {
  const [totalProducts, activeProducts, missingImages, avgCompleteness] = await Promise.all([
    prisma.product.count(),
    prisma.product.count({ where: { status: "active" } }),
    prisma.product.count({ where: { images: { none: {} } } }),
    prisma.product.aggregate({ _avg: { completenessScore: true } }),
  ]);

  const kpis = [
    { label: "產品總數", value: totalProducts, icon: Boxes },
    { label: "Active 產品", value: activeProducts, icon: TrendingUp },
    { label: "缺少圖片", value: missingImages, icon: ImageOff },
    { label: "平均完整度", value: `${Math.round(avgCompleteness._avg.completenessScore ?? 0)}%`, icon: Tags },
  ];

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">產品資料品質、品牌分布與缺口提醒總覽。</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {kpis.map((item) => {
            const Icon = item.icon;
            return (
              <Card key={item.label}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">{item.label}</CardTitle>
                  <Icon className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent><div className="text-3xl font-bold">{item.value}</div></CardContent>
              </Card>
            );
          })}
        </div>
        <Card>
          <CardHeader><CardTitle>Phase 1 已建立的基礎能力</CardTitle></CardHeader>
          <CardContent className="grid gap-3 text-sm text-muted-foreground md:grid-cols-2">
            <p>• Next.js App Router + Server Components 架構。</p>
            <p>• Prisma datasource 使用 MySQL，前端不直接連線。</p>
            <p>• Auth.js Credentials Provider + bcrypt hash 密碼。</p>
            <p>• 角色權限 helper 與 AuditLog 基礎服務。</p>
            <p>• 左側 Sidebar / Header / shadcn-style UI 基礎元件。</p>
            <p>• Seed data：品牌、品類、規格模板、demo users/products。</p>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
