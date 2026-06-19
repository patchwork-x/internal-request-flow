import Link from "next/link";
import { ArrowLeft, ClipboardList } from "lucide-react";
import { isCurrentUserAdmin } from "@/lib/auth/admin";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type AuditLogRow = {
  id: string;
  request_id: string | null;
  action: string;
  detail: string | null;
  created_at: string;
  requests: {
    title: string;
    status: string;
  } | null;
};

function formatDateTime(value: string) {
  return new Date(value).toLocaleString("ja-JP");
}

function getActionVariant(
  action: string
): "default" | "secondary" | "destructive" | "outline" {
  switch (action) {
    case "承認":
      return "default";
    case "差戻し":
      return "secondary";
    case "却下":
      return "destructive";
    default:
      return "outline";
  }
}

export default async function AuditLogsPage() {
  const isAdmin = await isCurrentUserAdmin();

  if (!isAdmin) {
    return (
      <main className="min-h-screen px-6 py-8">
        <div className="mx-auto max-w-3xl">
          <Card className="rounded-lg border bg-background shadow-sm">
            <CardHeader>
              <CardTitle>管理者権限が必要です</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <p className="text-muted-foreground">
                操作ログを見るには、管理者権限でログインしてください。
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

  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("audit_logs")
    .select(
      `
      id,
      request_id,
      action,
      detail,
      created_at,
      requests (
        title,
        status
      )
    `
    )
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
  }

const auditLogs = (data ?? []) as unknown as AuditLogRow[];

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
            <h1 className="text-2xl font-semibold tracking-tight">
              操作ログ一覧
            </h1>
            <p className="text-muted-foreground">
              申請作成、承認、差戻し、却下、コメント追加などの履歴を確認できます。
            </p>
          </div>
        </div>

        {error && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
            操作ログを取得できませんでした。
          </div>
        )}

        <Card className="rounded-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardList className="size-5" />
              操作ログ
            </CardTitle>
          </CardHeader>

          <CardContent>
            <div className="overflow-hidden rounded-lg border">
              <table className="w-full text-sm">
                <thead className="bg-muted">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium">日時</th>
                    <th className="px-4 py-3 text-left font-medium">操作</th>
                    <th className="px-4 py-3 text-left font-medium">詳細</th>
                    <th className="px-4 py-3 text-left font-medium">
                      対象申請
                    </th>
                    <th className="px-4 py-3 text-left font-medium">確認</th>
                  </tr>
                </thead>
                <tbody>
                  {auditLogs.map((log) => (
                    <tr key={log.id} className="border-t">
                      <td className="px-4 py-3 text-muted-foreground">
                        {formatDateTime(log.created_at)}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={getActionVariant(log.action)}>
                          {log.action}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">{log.detail ?? "-"}</td>
                      <td className="px-4 py-3">
                        {log.requests?.title ?? "対象申請なし"}
                      </td>
                      <td className="px-4 py-3">
                        {log.request_id ? (
                          <Button asChild size="sm" variant="outline">
                            <Link href={`/requests/${log.request_id}`}>
                              詳細
                            </Link>
                          </Button>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </td>
                    </tr>
                  ))}

                  {auditLogs.length === 0 && (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-4 py-10 text-center text-muted-foreground"
                      >
                        操作ログはまだありません。
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}