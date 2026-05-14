import Link from "next/link";
import {
  BarChart3,
  Boxes,
  Building2,
  ClipboardList,
  FileDown,
  FileSpreadsheet,
  Gauge,
  GitCompare,
  Layers3,
  LineChart,
  Megaphone,
  ScrollText,
  Settings,
  ShieldCheck,
  Tags,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";

const menu = [
  { href: "/dashboard", label: "Dashboard", icon: Gauge },
  { href: "/products", label: "Products", icon: Boxes },
  { href: "/compare", label: "Compare", icon: GitCompare },
  { href: "/brands", label: "Brands", icon: Building2 },
  { href: "/brand-positioning", label: "Brand Positioning", icon: LineChart },
  { href: "/categories", label: "Categories", icon: Layers3 },
  { href: "/spec-dictionary", label: "Spec Dictionary", icon: ClipboardList },
  { href: "/spec-templates", label: "Spec Templates", icon: Tags },
  { href: "/price-bands", label: "Price Bands", icon: BarChart3 },
  { href: "/gap-analysis", label: "Gap Analysis", icon: ShieldCheck },
  { href: "/import", label: "Import", icon: FileSpreadsheet },
  { href: "/export", label: "Export", icon: FileDown },
  { href: "/marketing", label: "Marketing", icon: Megaphone },
  { href: "/sales", label: "Sales", icon: ScrollText },
  { href: "/users", label: "Users", icon: Users },
  { href: "/audit-logs", label: "Audit Logs", icon: ClipboardList },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  return (
    <aside className="hidden w-72 shrink-0 border-r bg-white lg:block">
      <div className="border-b px-6 py-5">
        <p className="text-xs font-semibold uppercase tracking-widest text-blue-600">JHT Internal</p>
        <h1 className="mt-1 text-xl font-bold">Product Database</h1>
      </div>
      <nav className="space-y-1 p-3">
        {menu.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              className={cn("flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-950")}
              href={item.href}
              key={item.href}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
