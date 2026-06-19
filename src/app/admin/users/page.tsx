import Link from "next/link";
import { ArrowLeft, Users } from "lucide-react";
import { isCurrentUserAdmin } from "@/lib/auth/admin";
import { CreateUserForm } from "@/components/admin/CreateUserForm";
import { UserActions } from "@/components/admin/UserActions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

type ProfileRow = {
  id: string;
  name: string;
  role: string;
  department: string | null;
  created_at: string;
};

type UserRow = ProfileRow & {
  email: string | null;
  last_sign_in_at: string | null;
  email_confirmed_at: string | null;
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
    default:
      return "outline";
  }
}

function formatDate(value: string | null) {
  if (!value) return "-";
  return new Date(value).toLocaleString("ja-JP");
}

async function getUsers(): Promise<UserRow[]> {
  const supabaseAdmin = createSupabaseAdminClient();

  const { data: profiles, error: profilesError } = await supabaseAdmin
    .from("profiles")
    .select("id, name, role, department, created_at")
    .order("created_at", { ascending: false });

  if (profilesError) {
    console.error(profilesError);
    return [];
  }

  const { data: authUsers, error: usersError } =
    await supabaseAdmin.auth.admin.listUsers();

  if (usersError) {
    console.error(usersError);
    return [];
  }

  return ((profiles ?? []) as ProfileRow[]).map((profile) => {
    const authUser = authUsers.users.find((user) => user.id === profile.id);

    return {
      ...profile,
      email: authUser?.email ?? null,
      last_sign_in_at: authUser?.last_sign_in_at ?? null,
      email_confirmed_at: authUser?.email_confirmed_at ?? null,
    };
  });
}

export default async function AdminUsersPage() {
  const isAdmin = await isCurrentUserAdmin();

  if (!isAdmin) {
    return (
      <main className="min-h-screen px-6 py-8">
        <div className="mx-auto max-w-3xl">
          <Card className="rounded-lg border bg-white shadow-sm">
            <CardHeader>
              <CardTitle>管理者権限が必要です</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <p className="text-muted-foreground">
                ユーザー管理を見るには、管理者権限でログインしてください。
              </p>
              <Button asChild className="w-fit">
                <Link href="/">ダッシュボードへ戻る</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    );
  }

  const users = await getUsers();

  return (
    <main className="min-h-screen px-6 py-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <div>
          <Button asChild variant="ghost" className="mb-4">
            <Link href="/">
              <ArrowLeft className="size-4" />
              ダッシュボードへ戻る
            </Link>
          </Button>

          <section className="rounded-lg border bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-2">
              <Badge className="w-fit rounded-md" variant="secondary">
                Admin
              </Badge>
              <h1 className="text-2xl font-semibold tracking-tight">
                ユーザー管理
              </h1>
              <p className="text-muted-foreground">
                ユーザーの権限、部署、ログイン状況を確認できます。
              </p>
            </div>
          </section>
        </div>

        <Card className="overflow-hidden rounded-lg border bg-white shadow-sm">
          <CardHeader className="border-b bg-white">
            <CardTitle className="flex items-center gap-2 text-xl">
              <Users className="size-5" />
              新規ユーザー作成
            </CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              必要に応じて、申請者・承認者・管理者のアカウントを追加します。
            </p>
          </CardHeader>
          <CardContent className="p-6">
            <CreateUserForm />
          </CardContent>
        </Card>

        <Card className="overflow-hidden rounded-lg border bg-white shadow-sm">
          <CardHeader className="border-b bg-white">
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
              <div>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Users className="size-5" />
                  ユーザー一覧
                </CardTitle>
                <p className="mt-1 text-sm text-muted-foreground">
                  メールアドレス、権限、部署、最終ログイン日時を確認できます。
                </p>
              </div>

              <div className="rounded-md border bg-white px-4 py-2 text-sm text-muted-foreground shadow-sm">
                {users.length}件
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-6">
            <div className="overflow-x-auto">
              <div className="overflow-hidden rounded-lg border bg-white">
                <table className="w-full min-w-[1200px] text-sm">
                  <thead className="bg-muted/40">
                    <tr>
                      <th className="px-4 py-3 text-left font-medium">ID</th>
                      <th className="px-4 py-3 text-left font-medium">氏名</th>
                      <th className="px-4 py-3 text-left font-medium">
                        メール
                      </th>
                      <th className="px-4 py-3 text-left font-medium">権限</th>
                      <th className="px-4 py-3 text-left font-medium">部署</th>
                      <th className="px-4 py-3 text-left font-medium">
                        メール確認
                      </th>
                      <th className="px-4 py-3 text-left font-medium">
                        最終ログイン
                      </th>
                      <th className="px-4 py-3 text-left font-medium">操作</th>
                    </tr>
                  </thead>

                  <tbody>
                    {users.map((user) => (
                      <tr
                        key={user.id}
                        className="border-t transition-colors hover:bg-muted/20"
                      >
                        <td className="px-4 py-3">
                          <span className="rounded-md bg-muted px-2.5 py-1 font-mono text-xs">
                            {user.id.slice(0, 8)}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-medium">{user.name}</td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {user.email ?? "-"}
                        </td>
                        <td className="px-4 py-3">
                          <Badge
                            variant={getRoleVariant(user.role)}
                            className="rounded-md"
                          >
                            {getRoleLabel(user.role)}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          {user.department ?? "-"}
                        </td>
                        <td className="px-4 py-3">
                          {user.email_confirmed_at ? (
                            <Badge variant="secondary" className="rounded-md">
                              確認済み
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="rounded-md">
                              未確認
                            </Badge>
                          )}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {formatDate(user.last_sign_in_at)}
                        </td>
                        <td className="px-4 py-3">
                          <UserActions user={user} />
                        </td>
                      </tr>
                    ))}

                    {users.length === 0 && (
                      <tr>
                        <td
                          colSpan={8}
                          className="px-4 py-10 text-center text-muted-foreground"
                        >
                          ユーザーがまだ登録されていません。
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}