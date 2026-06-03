import Link from "next/link";
import { ArrowLeft, ShieldCheck, UserRound } from "lucide-react";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

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

function formatDate(value: string | null | undefined) {
  if (!value) return "-";
  return new Date(value).toLocaleString("ja-JP");
}

export default async function AccountPage() {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <main className="min-h-screen px-6 py-8">
        <div className="mx-auto max-w-3xl">
          <Card className="rounded-xl border bg-background/80 shadow-sm">
            <CardHeader>
              <CardTitle>ログインが必要です</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <p className="text-muted-foreground">
                アカウント情報を確認するにはログインしてください。
              </p>
              <Button asChild className="w-fit">
                <Link href="/login">ログイン画面へ</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    );
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("name, role, department, created_at, updated_at")
    .eq("id", user.id)
    .single();

  return (
    <main className="min-h-screen px-6 py-8">
      <div className="mx-auto flex max-w-5xl flex-col gap-6">
        <div>
          <Button asChild variant="ghost" className="mb-4">
            <Link href="/">
              <ArrowLeft className="size-4" />
              ダッシュボードへ戻る
            </Link>
          </Button>

          <section className="relative overflow-hidden rounded-xl border bg-background/80 p-8 shadow-sm">
            

            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <Badge variant="secondary" className="rounded-md">
                  Account
                </Badge>
                <h1 className="mt-3 text-2xl font-semibold tracking-tight">
                  マイページ
                </h1>
                <p className="mt-2 text-muted-foreground">
                  ログイン中ユーザーのプロフィール、権限、所属部署を確認できます。
                </p>
              </div>

              <div className="flex size-16 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
                <UserRound className="size-8" />
              </div>
            </div>
          </section>
        </div>

        <section className="grid gap-4 md:grid-cols-2">
          <Card className="rounded-xl border bg-background/80 shadow-sm">
            <CardHeader className="border-b bg-muted/20">
              <CardTitle className="flex items-center gap-2">
                <UserRound className="size-5" />
                アカウント情報
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 p-6">
              <InfoItem label="氏名" value={profile?.name ?? "未設定"} />
              <InfoItem label="メールアドレス" value={user.email ?? "-"} />
              <InfoItem
                label="所属部署"
                value={profile?.department ?? "未設定"}
              />
              <InfoItem
                label="登録日時"
                value={formatDate(profile?.created_at)}
              />
            </CardContent>
          </Card>

          <Card className="rounded-xl border bg-background/80 shadow-sm">
            <CardHeader className="border-b bg-muted/20">
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="size-5" />
                権限情報
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 p-6">
              <div className="rounded-lg border bg-muted/20 p-4">
                <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Role
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <Badge className="rounded-md">
                    {getRoleLabel(profile?.role)}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {profile?.role ?? "unknown"}
                  </span>
                </div>
              </div>

              <div className="rounded-lg border bg-muted/20 p-4 text-sm text-muted-foreground">
                現時点ではロール表示まで実装しています。今後、申請者・承認者・管理者ごとの画面表示や操作制御に拡張できます。
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border bg-muted/20 p-4">
      <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </div>
      <div className="mt-2 font-semibold">{value}</div>
    </div>
  );
}