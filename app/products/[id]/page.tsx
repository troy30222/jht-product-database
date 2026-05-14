import { notFound } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/db/prisma";

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await prisma.product.findUnique({
    where: { id },
    include: { brand: true, category: true, subcategory: true, specValues: { include: { specAttribute: true } }, marketingContent: true, salesContent: true },
  });
  if (!product) notFound();

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <div className="flex items-center gap-2"><h1 className="text-2xl font-bold">{product.modelName}</h1><Badge>{product.status}</Badge></div>
          <p className="text-muted-foreground">{product.brand.name} / {product.category.name}{product.subcategory ? ` / ${product.subcategory.name}` : ""}</p>
        </div>
        <Card>
          <CardHeader><CardTitle>基本資料</CardTitle></CardHeader>
          <CardContent className="grid gap-3 text-sm md:grid-cols-2">
            <p><strong>Model Code:</strong> {product.modelCode ?? "—"}</p>
            <p><strong>Market:</strong> {product.market}</p>
            <p><strong>MSRP:</strong> {product.msrp ? `${product.currency} ${product.msrp}` : "尚未填寫"}</p>
            <p><strong>Completeness:</strong> {product.completenessScore}%</p>
            <p className="md:col-span-2"><strong>Short Description:</strong> {product.shortDescription ?? "尚未填寫"}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>規格資料</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            {product.specValues.length === 0 ? "尚未填寫規格" : product.specValues.map((value) => (
              <div className="grid grid-cols-3 gap-4 border-b py-2" key={value.id}>
                <span className="font-medium">{value.specAttribute.name}</span>
                <span>{value.displayValue ?? "尚未填寫"}</span>
                <span className="text-muted-foreground">raw: {value.rawValue ?? "—"}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
