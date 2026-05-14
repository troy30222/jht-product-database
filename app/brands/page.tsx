import { createBrand, deleteBrand, updateBrand } from "@/actions/catalog-actions";
import { Field, Textarea } from "@/components/catalog/form-controls";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { prisma } from "@/lib/db/prisma";

export default async function BrandsPage() {
  const brands = await prisma.brand.findMany({ include: { _count: { select: { products: true } } }, orderBy: [{ sortOrder: "asc" }, { name: "asc" }] });
  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Brands</h1>
          <p className="text-muted-foreground">管理品牌主檔、定位敘述與銷售/行銷角度。</p>
        </div>
        <Card>
          <CardHeader><CardTitle>新增 Brand</CardTitle></CardHeader>
          <CardContent><BrandForm action={createBrand} submitLabel="新增 Brand" /></CardContent>
        </Card>
        <div className="grid gap-4">
          {brands.map((brand) => (
            <Card key={brand.id}>
              <CardHeader><CardTitle>{brand.displayName} <span className="text-sm font-normal text-muted-foreground">{brand.name} · {brand._count.products} products</span></CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <BrandForm action={updateBrand.bind(null, brand.id)} brand={brand} submitLabel="儲存" />
                <form action={deleteBrand.bind(null, brand.id)}><Button type="submit" variant="destructive" size="sm">刪除 Brand</Button></form>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AppShell>
  );
}

function BrandForm({ action, brand, submitLabel }: { action: (formData: FormData) => Promise<void>; brand?: { name: string; displayName: string; description: string | null; tier: string | null; positioningStatement: string | null; coreValue: string | null; productStrength: string | null; productWeakness: string | null; salesAngle: string | null; marketingAngle: string | null; sortOrder: number }; submitLabel: string }) {
  return (
    <form action={action} className="grid gap-4 md:grid-cols-2">
      <Field label="Name key"><Input name="name" required defaultValue={brand?.name ?? ""} placeholder="matrix" /></Field>
      <Field label="Display Name"><Input name="displayName" required defaultValue={brand?.displayName ?? ""} /></Field>
      <Field label="Tier"><Input name="tier" defaultValue={brand?.tier ?? ""} /></Field>
      <Field label="Sort Order"><Input name="sortOrder" type="number" min="0" defaultValue={brand?.sortOrder ?? 0} /></Field>
      <Field label="Description" className="md:col-span-2"><Textarea name="description" defaultValue={brand?.description ?? ""} /></Field>
      <Field label="Positioning Statement" className="md:col-span-2"><Textarea name="positioningStatement" defaultValue={brand?.positioningStatement ?? ""} /></Field>
      <Field label="Core Value"><Textarea name="coreValue" defaultValue={brand?.coreValue ?? ""} /></Field>
      <Field label="Product Strength"><Textarea name="productStrength" defaultValue={brand?.productStrength ?? ""} /></Field>
      <Field label="Product Weakness"><Textarea name="productWeakness" defaultValue={brand?.productWeakness ?? ""} /></Field>
      <Field label="Sales Angle"><Textarea name="salesAngle" defaultValue={brand?.salesAngle ?? ""} /></Field>
      <Field label="Marketing Angle" className="md:col-span-2"><Textarea name="marketingAngle" defaultValue={brand?.marketingAngle ?? ""} /></Field>
      <div className="md:col-span-2"><Button type="submit" size="sm">{submitLabel}</Button></div>
    </form>
  );
}
