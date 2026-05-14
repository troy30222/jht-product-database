import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { prisma } from "@/lib/db/prisma";

export default async function ProductsPage() {
  const products = await prisma.product.findMany({
    include: { brand: true, category: true, subcategory: true, images: { where: { imageType: "cover" }, take: 1 } },
    orderBy: { updatedAt: "desc" },
    take: 25,
  });

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Products</h1>
            <p className="text-muted-foreground">產品列表 MVP：品牌、品類、價格、狀態與完整度。</p>
          </div>
          <Button asChild><Link href="/products/new">新增產品</Link></Button>
        </div>
        {products.length === 0 ? (
          <EmptyState title="尚無產品資料" description="請先執行 npm run db:seed，或由 Admin 新增第一筆產品。" />
        ) : (
          <Card>
            <CardHeader><CardTitle>最近更新產品</CardTitle></CardHeader>
            <CardContent className="overflow-x-auto">
              <table className="w-full min-w-[960px] text-sm">
                <thead className="text-left text-muted-foreground">
                  <tr className="border-b">
                    <th className="py-3">Brand</th><th>Model</th><th>Code</th><th>Category</th><th>MSRP</th><th>Market</th><th>Status</th><th>完整度</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr className="border-b last:border-0" key={product.id}>
                      <td className="py-3 font-medium">{product.brand.name}</td>
                      <td><Link className="text-blue-700 hover:underline" href={`/products/${product.id}`}>{product.modelName}</Link></td>
                      <td>{product.modelCode ?? "—"}</td>
                      <td>{product.category.name}{product.subcategory ? ` / ${product.subcategory.name}` : ""}</td>
                      <td>{product.msrp ? `${product.currency} ${product.msrp}` : "尚未填寫"}</td>
                      <td>{product.market}</td>
                      <td><Badge>{product.status}</Badge></td>
                      <td>{product.completenessScore}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        )}
      </div>
    </AppShell>
  );
}
