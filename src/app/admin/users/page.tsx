import Link from "next/link";
import { ArrowLeft, Users } from "lucide-react";
import { UserActions } from "@/components/admin/UserActions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { supabase } from "@/lib/supabase/client";

type ProfileRow = {
  id: string;
  name: string;
  role: string;
  department: string | null;
  created_at: string;
  email?: string | null;
};

function getRoleLabel(role: string) {
  switch (role) {
    case "applicant":
      return "申請者";
    case "approver":
      return "承認者";
    case "admin":
      return "管理者";
    default:
      return role;
  }
}

function getRoleVariant(
  role: string
): "default" | "secondary" | "destructive" | "outline" {
  switch (role) {
    case "admin":
      return "default";
    case "approver":
      return "secondary";
    case "applicant":
      return "outline";
    default:
      return "outline";
  }
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("ja-JP");
}

export default async function AdminUsersPage() {
  const { data: profiles, error } = await supabase
    .from("profiles")
    .select("id, name, role, department, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
  }

  return (
    <main className="min-h-screen bg-muted/30 p-6">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <div>
          <Button asChild variant="ghost" className="mb-4">
            <Link href="/">
              <ArrowLeft className="size-4" />
              ダッシュボードへ戻る
            </Link>
          </Button>

          <div className="flex flex-col gap-2">
            <Badge className="w-fit" variant="secondary">
              Admin
            </Badge>
            <h1 className="text-3xl font-bold tracking-tight">ユーザー管理</h1>
            <p className="text-muted-foreground">
              申請者・承認者・管理者の権限と所属部署を一覧で確認できます。
            </p>
          </div>
        </div>

        {error && (
          <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
            ユーザー情報の取得に失敗しました: {error.message}
          </div>
        )}

        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="size-5" />
              ユーザー一覧
            </CardTitle>
          </CardHeader>

          <CardContent>
            <div className="overflow-hidden rounded-xl border">
              <table className="w-full text-sm">
                <thead className="bg-muted">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium">ID</th>
                    <th className="px-4 py-3 text-left font-medium">氏名</th>
                    <th className="px-4 py-3 text-left font-medium">権限</th>
                    <th className="px-4 py-3 text-left font-medium">部署</th>
                    <th className="px-4 py-3 text-left font-medium">登録日</th>
                    <th className="px-4 py-3 text-left font-medium">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {(profiles as ProfileRow[] | null)?.map((profile) => (
                    <tr key={profile.id} className="border-t">
                      <td className="px-4 py-3 font-medium">
                        {profile.id.slice(0, 8)}
                      </td>
                      <td className="px-4 py-3">{profile.name}</td>
                      <td className="px-4 py-3">
                        <Badge variant={getRoleVariant(profile.role)}>
                          {getRoleLabel(profile.role)}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        {profile.department ?? "-"}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {formatDate(profile.created_at)}
                      </td>
                      <td className="px-4 py-3">
                        <UserActions
                          user={{
                            id: profile.id,
                            email: profile.email ?? "",
                            name: profile.name,
                            role: profile.role,
                            department: profile.department,
                          }}
                        />
                      </td>
                    </tr>
                  ))}

                  {(!profiles || profiles.length === 0) && (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-4 py-10 text-center text-muted-foreground"
                      >
                        ユーザー情報がありません。
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle>この画面で見せるスキル</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>・ユーザー権限を想定した管理画面設計</li>
              <li>・申請者・承認者・管理者のロール設計</li>
              <li>・Supabaseのprofilesテーブル取得</li>
              <li>・今後のログイン機能・RLS対応への拡張性</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}