import Link from "next/link";
import {
  ClipboardList,
  FilePlus2,
  Gauge,
  History,
  LogIn,
  Users,
} from "lucide-react";

import { Button } from "@/components/ui/button";

const navItems = [
  {
    href: "/",
    label: "ダッシュボード",
    icon: Gauge,
  },
  {
    href: "/requests",
    label: "申請一覧",
    icon: ClipboardList,
  },
  {
    href: "/requests/new",
    label: "新規申請",
    icon: FilePlus2,
  },
  {
    href: "/admin/users",
    label: "ユーザー管理",
    icon: Users,
  },
  {
    href: "/admin/audit-logs",
    label: "操作ログ",
    icon: History,
  },
  {
    href: "/login",
    label: "ログイン",
    icon: LogIn,
  },
];

export function AppNav() {
  return (
    <nav className="border-b bg-background">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-6 py-4 md:flex-row md:items-center md:justify-between">
        <Link href="/" className="font-bold tracking-tight">
          Internal Request Flow
        </Link>

        <div className="flex flex-wrap gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;

            return (
              <Button key={item.href} asChild variant="ghost" size="sm">
                <Link href={item.href}>
                  <Icon className="size-4" />
                  {item.label}
                </Link>
              </Button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}