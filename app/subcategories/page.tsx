import { createSubcategory, deleteSubcategory, updateSubcategory } from "@/actions/catalog-actions";
import { Field, Select, Textarea } from "@/components/catalog/form-controls";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { prisma } from "@/lib/db/prisma";

export default async function SubcategoriesPage() {
  const [categories, subcategories] = await Promise.all([
    prisma.category.findMany({ orderBy: [{ sortOrder: "asc" }, { name: "asc" }] }),
    prisma.subcategory.findMany({ include: { category: true, _count: { select: { products: true } } }, orderBy: [{ category: { sortOrder: "asc" } }, { sortOrder: "asc" }, { name: "asc" }] }),
  ]);
  return (
    <AppShell>
      <div className="space-y-6">
        <div><h1 className="text-2xl font-bold">Subcategories</h1><p className="text-muted-foreground">管理大類下的子類別。</p></div>
        <Card><CardHeader><CardTitle>新增 Subcategory</CardTitle></CardHeader><CardContent><SubcategoryForm action={createSubcategory} categories={categories} submitLabel="新增 Subcategory" /></CardContent></Card>
        <Card><CardHeader><CardTitle>Subcategory 清單</CardTitle></CardHeader><CardContent className="space-y-4">{subcategories.map((subcategory) => <div key={subcategory.id} className="rounded-lg border p-4"><p className="mb-3 font-semibold">{subcategory.displayName} <span className="text-sm font-normal text-muted-foreground">{subcategory.category.name} / {subcategory.name} · {subcategory._count.products} products</span></p><SubcategoryForm action={updateSubcategory.bind(null, subcategory.id)} categories={categories} subcategory={subcategory} submitLabel="儲存" /><form action={deleteSubcategory.bind(null, subcategory.id)} className="mt-3"><Button type="submit" variant="destructive" size="sm">刪除 Subcategory</Button></form></div>)}</CardContent></Card>
      </div>
    </AppShell>
  );
}

function SubcategoryForm({ action, categories, subcategory, submitLabel }: { action: (formData: FormData) => Promise<void>; categories: { id: string; name: string; displayName: string }[]; subcategory?: { categoryId: string; name: string; displayName: string; description: string | null; sortOrder: number }; submitLabel: string }) {
  return <form action={action} className="grid gap-4 md:grid-cols-2"><Field label="Category"><Select name="categoryId" required defaultValue={subcategory?.categoryId ?? ""}><option value="" disabled>選擇 Category</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.displayName} ({category.name})</option>)}</Select></Field><Field label="Name key"><Input name="name" required defaultValue={subcategory?.name ?? ""} /></Field><Field label="Display Name"><Input name="displayName" required defaultValue={subcategory?.displayName ?? ""} /></Field><Field label="Sort Order"><Input name="sortOrder" type="number" min="0" defaultValue={subcategory?.sortOrder ?? 0} /></Field><Field label="Description" className="md:col-span-2"><Textarea name="description" defaultValue={subcategory?.description ?? ""} /></Field><div className="md:col-span-2"><Button type="submit" size="sm">{submitLabel}</Button></div></form>;
}
