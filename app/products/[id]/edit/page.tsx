import Image from "next/image";
import { notFound } from "next/navigation";
import { deleteProductImage, updateProduct } from "@/actions/catalog-actions";
import { ProductForm } from "@/components/catalog/product-form";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/db/prisma";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [product, brands, categories, subcategories, specTemplates, priceBands] = await Promise.all([
    prisma.product.findUnique({ where: { id }, include: { images: { orderBy: { sortOrder: "asc" } } } }),
    prisma.brand.findMany({ orderBy: [{ sortOrder: "asc" }, { name: "asc" }] }),
    prisma.category.findMany({ orderBy: [{ sortOrder: "asc" }, { name: "asc" }] }),
    prisma.subcategory.findMany({ orderBy: [{ sortOrder: "asc" }, { name: "asc" }] }),
    prisma.specTemplate.findMany({ orderBy: [{ sortOrder: "asc" }, { name: "asc" }] }),
    prisma.priceBand.findMany({ orderBy: [{ sortOrder: "asc" }, { name: "asc" }] }),
  ]);
  if (!product) notFound();
  return (
    <AppShell>
      <div className="space-y-6">
        <Card><CardHeader><CardTitle>編輯產品：{product.modelName}</CardTitle></CardHeader><CardContent><ProductForm action={updateProduct.bind(null, product.id)} options={{ brands, categories, subcategories, specTemplates, priceBands }} product={product} submitLabel="儲存產品" /></CardContent></Card>
        <Card><CardHeader><CardTitle>產品圖片</CardTitle></CardHeader><CardContent className="grid gap-4 md:grid-cols-4">{product.images.length === 0 ? <p className="text-sm text-muted-foreground">尚無圖片，請使用上方表單上傳。</p> : product.images.map((image) => <div key={image.id} className="space-y-2 rounded-lg border p-3"><Image src={image.url} alt={image.altText ?? product.modelName} width={320} height={180} className="h-32 w-full rounded object-cover" /><p className="text-xs text-muted-foreground">{image.imageType} · sort {image.sortOrder}</p><form action={deleteProductImage.bind(null, image.id)}><Button type="submit" size="sm" variant="destructive">刪除圖片</Button></form></div>)}</CardContent></Card>
      </div>
    </AppShell>
  );
}
