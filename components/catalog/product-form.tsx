import type { Brand, Category, PriceBand, Product, SpecTemplate, Subcategory } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, Select, Textarea } from "@/components/catalog/form-controls";

type ProductFormOptions = {
  brands: Brand[];
  categories: Category[];
  subcategories: Subcategory[];
  specTemplates: SpecTemplate[];
  priceBands: PriceBand[];
};

type ProductWithOptionals = Product & { images?: { id: string; url: string; altText: string | null; imageType: string; sortOrder: number }[] };

const statusOptions = ["draft", "active", "upcoming", "discontinued"];
const lifecycleOptions = ["new", "mature", "legacy", "discontinued"];

function dateValue(value?: Date | null) {
  return value ? value.toISOString().slice(0, 10) : "";
}

function decimalValue(value: unknown) {
  return value == null ? "" : String(value);
}

export function ProductForm({
  action,
  options,
  product,
  submitLabel,
}: {
  action: (formData: FormData) => Promise<void>;
  options: ProductFormOptions;
  product?: ProductWithOptionals;
  submitLabel: string;
}) {
  return (
    <form action={action} className="space-y-6" encType="multipart/form-data">
      <section className="grid gap-4 md:grid-cols-2">
        <Field label="Brand">
          <Select name="brandId" required defaultValue={product?.brandId ?? ""}>
            <option value="" disabled>選擇 Brand</option>
            {options.brands.map((brand) => <option key={brand.id} value={brand.id}>{brand.displayName} ({brand.name})</option>)}
          </Select>
        </Field>
        <Field label="Category">
          <Select name="categoryId" required defaultValue={product?.categoryId ?? ""}>
            <option value="" disabled>選擇 Category</option>
            {options.categories.map((category) => <option key={category.id} value={category.id}>{category.displayName} ({category.name})</option>)}
          </Select>
        </Field>
        <Field label="Subcategory">
          <Select name="subcategoryId" defaultValue={product?.subcategoryId ?? ""}>
            <option value="">不指定</option>
            {options.subcategories.map((subcategory) => <option key={subcategory.id} value={subcategory.id}>{subcategory.displayName} ({subcategory.name})</option>)}
          </Select>
        </Field>
        <Field label="Spec Template">
          <Select name="specTemplateId" defaultValue={product?.specTemplateId ?? ""}>
            <option value="">Phase 3 再設定</option>
            {options.specTemplates.map((template) => <option key={template.id} value={template.id}>{template.name}</option>)}
          </Select>
        </Field>
        <Field label="Price Band">
          <Select name="priceBandId" defaultValue={product?.priceBandId ?? ""}>
            <option value="">不指定</option>
            {options.priceBands.map((band) => <option key={band.id} value={band.id}>{band.name}</option>)}
          </Select>
        </Field>
        <Field label="Series Name"><Input name="seriesName" defaultValue={product?.seriesName ?? ""} /></Field>
        <Field label="Model Name"><Input name="modelName" required defaultValue={product?.modelName ?? ""} /></Field>
        <Field label="Model Code"><Input name="modelCode" defaultValue={product?.modelCode ?? ""} /></Field>
        <Field label="Slug"><Input name="slug" placeholder="留空自動產生" defaultValue={product?.slug ?? ""} /></Field>
        <Field label="Status">
          <Select name="status" required defaultValue={product?.status ?? "draft"}>{statusOptions.map((status) => <option key={status} value={status}>{status}</option>)}</Select>
        </Field>
        <Field label="Lifecycle">
          <Select name="lifecycleStage" required defaultValue={product?.lifecycleStage ?? "new"}>{lifecycleOptions.map((stage) => <option key={stage} value={stage}>{stage}</option>)}</Select>
        </Field>
        <Field label="Market"><Input name="market" required defaultValue={product?.market ?? "TW"} /></Field>
        <Field label="Currency"><Input name="currency" required defaultValue={product?.currency ?? "TWD"} /></Field>
        <Field label="MSRP"><Input name="msrp" type="number" step="0.01" defaultValue={decimalValue(product?.msrp)} /></Field>
        <Field label="Dealer Price"><Input name="dealerPrice" type="number" step="0.01" defaultValue={decimalValue(product?.dealerPrice)} /></Field>
        <Field label="Launch Date"><Input name="launchDate" type="date" defaultValue={dateValue(product?.launchDate)} /></Field>
        <Field label="Discontinued Date"><Input name="discontinuedDate" type="date" defaultValue={dateValue(product?.discontinuedDate)} /></Field>
        <Field label="Target Customer"><Input name="targetCustomer" defaultValue={product?.targetCustomer ?? ""} /></Field>
        <Field label="Positioning Tier"><Input name="positioningTier" defaultValue={product?.positioningTier ?? ""} /></Field>
        <Field label="Machine Function"><Input name="machineFunction" defaultValue={product?.machineFunction ?? ""} /></Field>
        <Field label="產品圖片" className="md:col-span-2"><Input name="images" type="file" accept="image/*" multiple /></Field>
        <Field label="Short Description" className="md:col-span-2"><Textarea name="shortDescription" defaultValue={product?.shortDescription ?? ""} /></Field>
        <Field label="Long Description" className="md:col-span-2"><Textarea name="longDescription" defaultValue={product?.longDescription ?? ""} /></Field>
        <Field label="Use Case" className="md:col-span-2"><Textarea name="useCase" defaultValue={product?.useCase ?? ""} /></Field>
        <Field label="Internal Note" className="md:col-span-2"><Textarea name="internalNote" defaultValue={product?.internalNote ?? ""} /></Field>
      </section>
      <div className="flex justify-end"><Button type="submit">{submitLabel}</Button></div>
    </form>
  );
}
