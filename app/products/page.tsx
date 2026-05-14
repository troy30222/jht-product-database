import Image from "next/image";
import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { prisma } from "@/lib/db/prisma";

type SearchParams = Promise<{ q?: string; brandId?: string; categoryId?: string; status?: string }>;

export default async function ProductsPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const where = {
    ...(params.q ? { OR: [{ modelName: { contains: params.q } }, { modelCode: { contains: params.q } }, { slug: { contains: params.q } }] } : {}),
    ...(params.brandId ? { brandId: params.brandId } : {}),
    ...(params.categoryId ? { categoryId: params.categoryId } : {}),
    ...(params.status ? { status: params.status as "draft" | "active" | "upcoming" | "discontinued" } : {}),
  };
  const [products, brands, categories] = await Promise.all([
    prisma.product.findMany({ where, include: { brand: true, category: true, subcategory: true, images: { where: { imageType: "cover" }, take: 1 } }, orderBy: { updatedAt: "desc" }, take: 100 }),
    prisma.brand.findMany({ orderBy: [{ sortOrder: "asc" }, { name: "asc" }] }),
    prisma.category.findMany({ orderBy: [{ sortOrder: "asc" }, { name: "asc" }] }),
  ]);

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div><h1 className="text-2xl font-bold">Products</h1><p className="text-muted-foreground">產品列表：支援搜尋、篩選、詳細、編輯與圖片狀態。</p></div>
          <Button asChild><Link href="/products/new">新增產品</Link></Button>
        </div>
        <Card><CardHeader><CardTitle>篩選</CardTitle></CardHeader><CardContent><form className="grid gap-3 md:grid-cols-5"><Input name="q" placeholder="搜尋 model / code / slug" defaultValue={params.q ?? ""} /><select className="rounded-md border px-3 text-sm" name="brandId" defaultValue={params.brandId ?? ""}><option value="">全部 Brand</option>{brands.map((brand) => <option key={brand.id} value={brand.id}>{brand.displayName}</option>)}</select><select className="rounded-md border px-3 text-sm" name="categoryId" defaultValue={params.categoryId ?? ""}><option value="">全部 Category</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.displayName}</option>)}</select><select className="rounded-md border px-3 text-sm" name="status" defaultValue={params.status ?? ""}><option value="">全部狀態</option>{["draft", "active", "upcoming", "discontinued"].map((status) => <option key={status} value={status}>{status}</option>)}</select><Button type="submit">套用</Button></form></CardContent></Card>
        {products.length === 0 ? (
          <EmptyState title="尚無產品資料" description="請先執行 npm run db:seed，或由 Admin 新增第一筆產品。" />
        ) : (
          <Card>
            <CardHeader><CardTitle>產品清單</CardTitle></CardHeader>
            <CardContent className="overflow-x-auto">
              <table className="w-full min-w-[1040px] text-sm">
                <thead className="text-left text-muted-foreground"><tr className="border-b"><th className="py-3">Image</th><th>Brand</th><th>Model</th><th>Code</th><th>Category</th><th>MSRP</th><th>Market</th><th>Status</th><th>完整度</th><th>操作</th></tr></thead>
                <tbody>{products.map((product) => <tr className="border-b last:border-0" key={product.id}><td className="py-3">{product.images[0] ? <Image src={product.images[0].url} alt={product.images[0].altText ?? product.modelName} width={96} height={72} className="h-12 w-16 rounded object-cover" /> : <span className="text-muted-foreground">無圖</span>}</td><td className="font-medium">{product.brand.displayName}</td><td><Link className="text-blue-700 hover:underline" href={`/products/${product.id}`}>{product.modelName}</Link></td><td>{product.modelCode ?? "—"}</td><td>{product.category.displayName}{product.subcategory ? ` / ${product.subcategory.displayName}` : ""}</td><td>{product.msrp ? `${product.currency} ${product.msrp}` : "尚未填寫"}</td><td>{product.market}</td><td><Badge>{product.status}</Badge></td><td>{product.completenessScore}%</td><td><Button asChild size="sm" variant="outline"><Link href={`/products/${product.id}/edit`}>編輯</Link></Button></td></tr>)}</tbody>
              </table>
            </CardContent>
          </Card>
        )}
      </div>
    </AppShell>
  );
}
