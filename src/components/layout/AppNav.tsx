import Link from "next/link";
import {
  ClipboardList,
  FilePlus2,
  Gauge,
  History,
  LogIn,
  Sparkles,
  UserPlus,
  Users,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
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
  {
    href: "/signup",
    label: "アカウント作成",
    icon: UserPlus,
  },
];

export function AppNav() {
  return (
    <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-6 py-4 lg:flex-row lg:items-center lg:justify-between">
        <Link href="/" className="group flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm transition group-hover:scale-105">
            <Sparkles className="size-5" />
          </div>

          <div className="leading-tight">
            <div className="font-bold tracking-tight">
              Internal Request Flow
            </div>
            <div className="text-xs text-muted-foreground">
              Approval workflow dashboard
            </div>
          </div>
        </Link>

        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className="hidden rounded-full px-3 py-1 lg:inline-flex">
            Portfolio App
          </Badge>

          {navItems.map((item) => {
            const Icon = item.icon;

            return (
              <Button
                key={item.href}
                asChild
                variant="ghost"
                size="sm"
                className="rounded-full text-muted-foreground hover:text-foreground"
              >
                <Link href={item.href}>
                  <Icon className="size-4" />
                  {item.label}
                </Link>
              </Button>
            );
          })}
        </div>
      </div>
    </header>
  );
}