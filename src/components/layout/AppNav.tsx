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
  UserRound,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { LogoutButton } from "@/components/layout/LogoutButton";

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
    href: "/account",
    label: "マイページ",
    icon: UserRound,
  },
];

const adminNavItems = [
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
];

function getRoleLabel(role: string | null | undefined) {
  switch (role) {
    case "applicant":
      return "申請者";
    case "approver":
      return "承認者";
    case "admin":
      return "管理者";
    default:
      return "未設定";
  }
}

export async function AppNav() {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let profile:
    | {
        name: string;
        role: string;
        department: string | null;
      }
    | null = null;

  if (user) {
    const { data } = await supabase
      .from("profiles")
      .select("name, role, department")
      .eq("id", user.id)
      .single();

    profile = data;
  }

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
          <Badge
            variant="secondary"
            className="hidden rounded-full px-3 py-1 lg:inline-flex"
          >
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

          {profile?.role === "admin" &&
            adminNavItems.map((item) => {
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

          {user ? (
            <div className="flex flex-wrap items-center gap-2 rounded-full border bg-background px-3 py-1.5 shadow-sm">
              <div className="text-sm">
                <span className="font-medium">
                  {profile?.name ?? user.email}
                </span>
                <span className="ml-2 text-muted-foreground">
                  {getRoleLabel(profile?.role)}
                </span>
              </div>
              <LogoutButton />
            </div>
          ) : (
            <>
              <Button
                asChild
                variant="ghost"
                size="sm"
                className="rounded-full text-muted-foreground hover:text-foreground"
              >
                <Link href="/login">
                  <LogIn className="size-4" />
                  ログイン
                </Link>
              </Button>

              <Button
                asChild
                variant="ghost"
                size="sm"
                className="rounded-full text-muted-foreground hover:text-foreground"
              >
                <Link href="/signup">
                  <UserPlus className="size-4" />
                  アカウント作成
                </Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}