import { createProduct } from "@/actions/catalog-actions";
import { ProductForm } from "@/components/catalog/product-form";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/db/prisma";

export default async function NewProductPage() {
  const [brands, categories, subcategories, specTemplates, priceBands] = await Promise.all([
    prisma.brand.findMany({ orderBy: [{ sortOrder: "asc" }, { name: "asc" }] }),
    prisma.category.findMany({ orderBy: [{ sortOrder: "asc" }, { name: "asc" }] }),
    prisma.subcategory.findMany({ orderBy: [{ sortOrder: "asc" }, { name: "asc" }] }),
    prisma.specTemplate.findMany({ orderBy: [{ sortOrder: "asc" }, { name: "asc" }] }),
    prisma.priceBand.findMany({ orderBy: [{ sortOrder: "asc" }, { name: "asc" }] }),
  ]);
  return <AppShell><Card><CardHeader><CardTitle>新增產品</CardTitle></CardHeader><CardContent><ProductForm action={createProduct} options={{ brands, categories, subcategories, specTemplates, priceBands }} submitLabel="建立產品" /></CardContent></Card></AppShell>;
}
