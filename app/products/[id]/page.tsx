import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { deleteProduct } from "@/actions/catalog-actions";
import { AppShell } from "@/components/layout/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/db/prisma";

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await prisma.product.findUnique({
    where: { id },
    include: { brand: true, category: true, subcategory: true, images: { orderBy: { sortOrder: "asc" } }, specValues: { include: { specAttribute: true } }, marketingContent: true, salesContent: true },
  });
  if (!product) notFound();

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2"><h1 className="text-2xl font-bold">{product.modelName}</h1><Badge>{product.status}</Badge></div>
            <p className="text-muted-foreground">{product.brand.displayName} / {product.category.displayName}{product.subcategory ? ` / ${product.subcategory.displayName}` : ""}</p>
          </div>
          <div className="flex gap-2"><Button asChild variant="outline"><Link href={`/products/${product.id}/edit`}>編輯</Link></Button><form action={deleteProduct.bind(null, product.id)}><Button type="submit" variant="destructive">刪除</Button></form></div>
        </div>
        {product.images.length > 0 && <Card><CardHeader><CardTitle>圖片</CardTitle></CardHeader><CardContent className="grid gap-4 md:grid-cols-4">{product.images.map((image) => <div className="space-y-2" key={image.id}><Image src={image.url} alt={image.altText ?? product.modelName} width={320} height={220} className="h-40 w-full rounded-lg object-cover" /><p className="text-xs text-muted-foreground">{image.imageType}</p></div>)}</CardContent></Card>}
        <Card>
          <CardHeader><CardTitle>基本資料</CardTitle></CardHeader>
          <CardContent className="grid gap-3 text-sm md:grid-cols-2">
            <p><strong>Model Code:</strong> {product.modelCode ?? "—"}</p><p><strong>Slug:</strong> {product.slug}</p><p><strong>Series:</strong> {product.seriesName ?? "—"}</p><p><strong>Market:</strong> {product.market}</p><p><strong>MSRP:</strong> {product.msrp ? `${product.currency} ${product.msrp}` : "尚未填寫"}</p><p><strong>Dealer Price:</strong> {product.dealerPrice ? `${product.currency} ${product.dealerPrice}` : "尚未填寫"}</p><p><strong>Lifecycle:</strong> {product.lifecycleStage}</p><p><strong>Completeness:</strong> {product.completenessScore}%</p><p><strong>Target Customer:</strong> {product.targetCustomer ?? "—"}</p><p><strong>Machine Function:</strong> {product.machineFunction ?? "—"}</p><p className="md:col-span-2"><strong>Short Description:</strong> {product.shortDescription ?? "尚未填寫"}</p><p className="md:col-span-2"><strong>Use Case:</strong> {product.useCase ?? "尚未填寫"}</p>
          </CardContent>
        </Card>
        <Card><CardHeader><CardTitle>規格資料</CardTitle></CardHeader><CardContent className="space-y-2 text-sm">{product.specValues.length === 0 ? "尚未填寫規格" : product.specValues.map((value) => <div className="grid grid-cols-3 gap-4 border-b py-2" key={value.id}><span className="font-medium">{value.specAttribute.name}</span><span>{value.displayValue ?? "尚未填寫"}</span><span className="text-muted-foreground">raw: {value.rawValue ?? "—"}</span></div>)}</CardContent></Card>
      </div>
    </AppShell>
  );
}
