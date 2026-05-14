import { redirect } from "next/navigation";
import { auth } from "@/auth";

export type AppRole = "super_admin" | "admin" | "manager" | "marketing" | "sales" | "viewer";
export type AppUser = { id: string; role: AppRole; email?: string | null; name?: string | null };

export async function requireAuth(): Promise<AppUser> {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  return {
    id: session.user.id,
    role: session.user.role as AppRole,
    email: session.user.email,
    name: session.user.name,
  };
}

export async function requireRole(roles: AppRole[]): Promise<AppUser> {
  const user = await requireAuth();
  if (!roles.includes(user.role)) {
    throw new Error("Permission denied");
  }
  return user;
}

const hasRole = (user: Pick<AppUser, "role">, roles: AppRole[]) => roles.includes(user.role);

export const canEditProduct = (user: Pick<AppUser, "role">) => hasRole(user, ["super_admin", "admin"]);
export const canDeleteProduct = (user: Pick<AppUser, "role">) => hasRole(user, ["super_admin", "admin"]);
export const canEditMarketing = (user: Pick<AppUser, "role">) => hasRole(user, ["super_admin", "admin", "marketing"]);
export const canEditSales = (user: Pick<AppUser, "role">) => hasRole(user, ["super_admin", "admin"]);
export const canImport = (user: Pick<AppUser, "role">) => hasRole(user, ["super_admin", "admin"]);
export const canExport = (user: Pick<AppUser, "role">) => hasRole(user, ["super_admin", "admin", "manager"]);
export const canManageUsers = (user: Pick<AppUser, "role">) => hasRole(user, ["super_admin"]);
