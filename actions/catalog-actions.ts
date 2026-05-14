"use server";

import { ImageType, LifecycleStage, ProductStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createAuditLog } from "@/lib/audit/create-audit-log";
import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/permissions";
import { storageProvider } from "@/lib/storage";

const editorRoles = ["super_admin", "admin"] as const;

const optionalText = z.string().trim().optional().transform((value) => (value ? value : null));
const requiredKey = z.string().trim().min(1).max(80).regex(/^[a-z0-9_-]+$/, "請使用英文小寫、數字、底線或連字號");
const requiredText = z.string().trim().min(1).max(160);
const sortOrder = z.coerce.number().int().min(0).default(0);
const optionalDecimal = z.string().trim().optional().transform((value) => (value ? value : null));
const optionalDate = z.string().trim().optional().transform((value) => (value ? new Date(`${value}T00:00:00.000Z`) : null));

function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function parseEntity(formData: FormData) {
  return z.object({
    name: requiredKey,
    displayName: requiredText,
    description: optionalText,
    sortOrder,
  }).parse({
    name: getString(formData, "name"),
    displayName: getString(formData, "displayName"),
    description: getString(formData, "description"),
    sortOrder: getString(formData, "sortOrder") || "0",
  });
}

function nonEmptyFiles(formData: FormData) {
  return formData.getAll("images").filter((item): item is File => item instanceof File && item.size > 0);
}

async function assertSubcategoryBelongsToCategory(categoryId: string, subcategoryId: string | null) {
  if (!subcategoryId) return;
  const subcategory = await prisma.subcategory.findUnique({ where: { id: subcategoryId }, select: { categoryId: true } });
  if (!subcategory || subcategory.categoryId !== categoryId) {
    throw new Error("Subcategory 不屬於所選 Category");
  }
}

export async function createBrand(formData: FormData) {
  const user = await requireRole([...editorRoles]);
  const base = parseEntity(formData);
  const extra = z.object({
    tier: optionalText,
    positioningStatement: optionalText,
    coreValue: optionalText,
    productStrength: optionalText,
    productWeakness: optionalText,
    salesAngle: optionalText,
    marketingAngle: optionalText,
  }).parse(Object.fromEntries(["tier", "positioningStatement", "coreValue", "productStrength", "productWeakness", "salesAngle", "marketingAngle"].map((key) => [key, getString(formData, key)])));
  const brand = await prisma.brand.create({ data: { ...base, ...extra } });
  await createAuditLog({ userId: user.id, action: "create", entityType: "Brand", entityId: brand.id, newValue: brand });
  revalidatePath("/brands");
  redirect("/brands");
}

export async function updateBrand(id: string, formData: FormData) {
  const user = await requireRole([...editorRoles]);
  const oldValue = await prisma.brand.findUnique({ where: { id } });
  if (!oldValue) throw new Error("Brand 不存在");
  const base = parseEntity(formData);
  const extra = z.object({
    tier: optionalText,
    positioningStatement: optionalText,
    coreValue: optionalText,
    productStrength: optionalText,
    productWeakness: optionalText,
    salesAngle: optionalText,
    marketingAngle: optionalText,
  }).parse(Object.fromEntries(["tier", "positioningStatement", "coreValue", "productStrength", "productWeakness", "salesAngle", "marketingAngle"].map((key) => [key, getString(formData, key)])));
  const brand = await prisma.brand.update({ where: { id }, data: { ...base, ...extra } });
  await createAuditLog({ userId: user.id, action: "update", entityType: "Brand", entityId: id, oldValue, newValue: brand });
  revalidatePath("/brands");
}

export async function deleteBrand(id: string) {
  const user = await requireRole([...editorRoles]);
  const oldValue = await prisma.brand.findUnique({ where: { id } });
  if (!oldValue) throw new Error("Brand 不存在");
  await prisma.brand.delete({ where: { id } });
  await createAuditLog({ userId: user.id, action: "delete", entityType: "Brand", entityId: id, oldValue });
  revalidatePath("/brands");
}

export async function createCategory(formData: FormData) {
  const user = await requireRole([...editorRoles]);
  const data = parseEntity(formData);
  const category = await prisma.category.create({ data });
  await createAuditLog({ userId: user.id, action: "create", entityType: "Category", entityId: category.id, newValue: category });
  revalidatePath("/categories");
  redirect("/categories");
}

export async function updateCategory(id: string, formData: FormData) {
  const user = await requireRole([...editorRoles]);
  const oldValue = await prisma.category.findUnique({ where: { id } });
  if (!oldValue) throw new Error("Category 不存在");
  const category = await prisma.category.update({ where: { id }, data: parseEntity(formData) });
  await createAuditLog({ userId: user.id, action: "update", entityType: "Category", entityId: id, oldValue, newValue: category });
  revalidatePath("/categories");
}

export async function deleteCategory(id: string) {
  const user = await requireRole([...editorRoles]);
  const oldValue = await prisma.category.findUnique({ where: { id } });
  if (!oldValue) throw new Error("Category 不存在");
  await prisma.category.delete({ where: { id } });
  await createAuditLog({ userId: user.id, action: "delete", entityType: "Category", entityId: id, oldValue });
  revalidatePath("/categories");
}

export async function createSubcategory(formData: FormData) {
  const user = await requireRole([...editorRoles]);
  const base = parseEntity(formData);
  const { categoryId } = z.object({ categoryId: z.string().min(1) }).parse({ categoryId: getString(formData, "categoryId") });
  const subcategory = await prisma.subcategory.create({ data: { ...base, categoryId } });
  await createAuditLog({ userId: user.id, action: "create", entityType: "Subcategory", entityId: subcategory.id, newValue: subcategory });
  revalidatePath("/subcategories");
  redirect("/subcategories");
}

export async function updateSubcategory(id: string, formData: FormData) {
  const user = await requireRole([...editorRoles]);
  const oldValue = await prisma.subcategory.findUnique({ where: { id } });
  if (!oldValue) throw new Error("Subcategory 不存在");
  const base = parseEntity(formData);
  const data = z.object({ categoryId: z.string().min(1) }).parse({ categoryId: getString(formData, "categoryId") });
  const subcategory = await prisma.subcategory.update({ where: { id }, data: { ...base, categoryId: data.categoryId } });
  await createAuditLog({ userId: user.id, action: "update", entityType: "Subcategory", entityId: id, oldValue, newValue: subcategory });
  revalidatePath("/subcategories");
}

export async function deleteSubcategory(id: string) {
  const user = await requireRole([...editorRoles]);
  const oldValue = await prisma.subcategory.findUnique({ where: { id } });
  if (!oldValue) throw new Error("Subcategory 不存在");
  await prisma.subcategory.delete({ where: { id } });
  await createAuditLog({ userId: user.id, action: "delete", entityType: "Subcategory", entityId: id, oldValue });
  revalidatePath("/subcategories");
}

function parseProduct(formData: FormData) {
  return z.object({
    brandId: z.string().min(1),
    categoryId: z.string().min(1),
    subcategoryId: optionalText,
    specTemplateId: optionalText,
    priceBandId: optionalText,
    seriesName: optionalText,
    modelName: requiredText,
    modelCode: optionalText,
    slug: z.string().trim().optional(),
    shortDescription: optionalText,
    longDescription: optionalText,
    status: z.nativeEnum(ProductStatus),
    lifecycleStage: z.nativeEnum(LifecycleStage),
    market: z.string().trim().min(1).max(16),
    currency: z.string().trim().min(1).max(8),
    msrp: optionalDecimal,
    dealerPrice: optionalDecimal,
    launchDate: optionalDate,
    discontinuedDate: optionalDate,
    targetCustomer: optionalText,
    useCase: optionalText,
    positioningTier: optionalText,
    machineFunction: optionalText,
    internalNote: optionalText,
  }).parse(Object.fromEntries(["brandId", "categoryId", "subcategoryId", "specTemplateId", "priceBandId", "seriesName", "modelName", "modelCode", "slug", "shortDescription", "longDescription", "status", "lifecycleStage", "market", "currency", "msrp", "dealerPrice", "launchDate", "discontinuedDate", "targetCustomer", "useCase", "positioningTier", "machineFunction", "internalNote"].map((key) => [key, getString(formData, key)])));
}

export async function createProduct(formData: FormData) {
  const user = await requireRole([...editorRoles]);
  const parsed = parseProduct(formData);
  await assertSubcategoryBelongsToCategory(parsed.categoryId, parsed.subcategoryId);
  const slug = parsed.slug?.trim() ? slugify(parsed.slug) : slugify(`${parsed.modelName}-${parsed.modelCode ?? ""}`);
  const product = await prisma.product.create({ data: { ...parsed, slug } });
  for (const [index, file] of nonEmptyFiles(formData).entries()) {
    const stored = await storageProvider.save(file, `products/${product.id}`);
    await prisma.productImage.create({ data: { productId: product.id, url: stored.url, altText: product.modelName, imageType: index === 0 ? ImageType.cover : ImageType.gallery, sortOrder: index } });
  }
  await createAuditLog({ userId: user.id, action: "create", entityType: "Product", entityId: product.id, newValue: product });
  revalidatePath("/products");
  redirect(`/products/${product.id}`);
}

export async function updateProduct(id: string, formData: FormData) {
  const user = await requireRole([...editorRoles]);
  const oldValue = await prisma.product.findUnique({ where: { id }, include: { images: true } });
  if (!oldValue) throw new Error("Product 不存在");
  const parsed = parseProduct(formData);
  await assertSubcategoryBelongsToCategory(parsed.categoryId, parsed.subcategoryId);
  const slug = parsed.slug?.trim() ? slugify(parsed.slug) : slugify(`${parsed.modelName}-${parsed.modelCode ?? ""}`);
  const product = await prisma.product.update({ where: { id }, data: { ...parsed, slug } });
  const existingCount = await prisma.productImage.count({ where: { productId: id } });
  for (const [index, file] of nonEmptyFiles(formData).entries()) {
    const stored = await storageProvider.save(file, `products/${id}`);
    await prisma.productImage.create({ data: { productId: id, url: stored.url, altText: product.modelName, imageType: existingCount + index === 0 ? ImageType.cover : ImageType.gallery, sortOrder: existingCount + index } });
  }
  await createAuditLog({ userId: user.id, action: "update", entityType: "Product", entityId: id, oldValue, newValue: product });
  revalidatePath("/products");
  revalidatePath(`/products/${id}`);
  redirect(`/products/${id}`);
}

export async function deleteProduct(id: string) {
  const user = await requireRole([...editorRoles]);
  const oldValue = await prisma.product.findUnique({ where: { id }, include: { images: true } });
  if (!oldValue) throw new Error("Product 不存在");
  for (const image of oldValue.images) {
    await storageProvider.delete(image.url.replace(/^\/uploads\//, ""));
  }
  await prisma.product.delete({ where: { id } });
  await createAuditLog({ userId: user.id, action: "delete", entityType: "Product", entityId: id, oldValue });
  revalidatePath("/products");
  redirect("/products");
}

export async function deleteProductImage(id: string) {
  const user = await requireRole([...editorRoles]);
  const image = await prisma.productImage.findUnique({ where: { id } });
  if (!image) throw new Error("圖片不存在");
  await storageProvider.delete(image.url.replace(/^\/uploads\//, ""));
  await prisma.productImage.delete({ where: { id } });
  await createAuditLog({ userId: user.id, action: "delete", entityType: "ProductImage", entityId: id, oldValue: image });
  revalidatePath(`/products/${image.productId}`);
  revalidatePath(`/products/${image.productId}/edit`);
}
