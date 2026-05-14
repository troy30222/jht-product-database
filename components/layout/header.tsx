import { signOut } from "@/auth";
import { Button } from "@/components/ui/button";
import type { AppUser } from "@/lib/permissions";

export function Header({ user }: { user: AppUser }) {
  return (
    <header className="flex h-16 items-center justify-between border-b bg-white px-6">
      <div>
        <p className="text-sm text-muted-foreground">健身器材產品資料後台</p>
        <h2 className="font-semibold">歡迎，{user.name ?? user.email}</h2>
      </div>
      <div className="flex items-center gap-3">
        <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">{user.role}</span>
        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/login" });
          }}
        >
          <Button size="sm" variant="outline">登出</Button>
        </form>
      </div>
    </header>
  );
}
