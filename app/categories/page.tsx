import { createCategory, deleteCategory, updateCategory } from "@/actions/catalog-actions";
import { Field, Textarea } from "@/components/catalog/form-controls";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { prisma } from "@/lib/db/prisma";

export default async function CategoriesPage() {
  const categories = await prisma.category.findMany({ include: { _count: { select: { products: true, subcategories: true } } }, orderBy: [{ sortOrder: "asc" }, { name: "asc" }] });
  return (
    <AppShell>
      <div className="space-y-6">
        <div><h1 className="text-2xl font-bold">Categories</h1><p className="text-muted-foreground">管理產品大類與排序。</p></div>
        <Card><CardHeader><CardTitle>新增 Category</CardTitle></CardHeader><CardContent><CategoryForm action={createCategory} submitLabel="新增 Category" /></CardContent></Card>
        <Card>
          <CardHeader><CardTitle>Category 清單</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {categories.map((category) => <div key={category.id} className="rounded-lg border p-4"><p className="mb-3 font-semibold">{category.displayName} <span className="text-sm font-normal text-muted-foreground">{category.name} · {category._count.subcategories} subcategories · {category._count.products} products</span></p><CategoryForm action={updateCategory.bind(null, category.id)} category={category} submitLabel="儲存" /><form action={deleteCategory.bind(null, category.id)} className="mt-3"><Button type="submit" variant="destructive" size="sm">刪除 Category</Button></form></div>)}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}

function CategoryForm({ action, category, submitLabel }: { action: (formData: FormData) => Promise<void>; category?: { name: string; displayName: string; description: string | null; sortOrder: number }; submitLabel: string }) {
  return <form action={action} className="grid gap-4 md:grid-cols-2"><Field label="Name key"><Input name="name" required defaultValue={category?.name ?? ""} /></Field><Field label="Display Name"><Input name="displayName" required defaultValue={category?.displayName ?? ""} /></Field><Field label="Sort Order"><Input name="sortOrder" type="number" min="0" defaultValue={category?.sortOrder ?? 0} /></Field><Field label="Description" className="md:col-span-2"><Textarea name="description" defaultValue={category?.description ?? ""} /></Field><div className="md:col-span-2"><Button type="submit" size="sm">{submitLabel}</Button></div></form>;
}
