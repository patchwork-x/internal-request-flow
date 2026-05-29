import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  MessageSquare,
} from "lucide-react";
import { RequestStatusActions } from "@/components/requests/RequestStatusActions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { RequestCommentForm } from "@/components/requests/RequestCommentForm";
import { supabase } from "@/lib/supabase/client";

type RequestRow = {
  id: string;
  title: string;
  request_type: string;
  amount: number | null;
  reason: string;
  status: string;
  applicant_id: string | null;
  approver_id: string | null;
  due_date: string;
  created_at: string;
  updated_at: string;
};

type AuditLogRow = {
  id: string;
  action: string;
  detail: string | null;
  created_at: string;
};

type CommentRow = {
  id: string;
  comment: string;
  created_at: string;
};

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

function getStatusLabel(status: string) {
  switch (status) {
    case "submitted":
      return "申請中";
    case "approved":
      return "承認済み";
    case "returned":
      return "差戻し";
    case "rejected":
      return "却下";
    case "canceled":
      return "取消";
    default:
      return status;
  }
}

function getRequestTypeLabel(type: string) {
  switch (type) {
    case "equipment":
      return "備品購入申請";
    case "saas_account":
      return "SaaSアカウント発行申請";
    case "permission":
      return "権限付与申請";
    case "pc_purchase":
      return "PC購入申請";
    case "expense":
      return "経費申請";
    default:
      return type;
  }
}

function getStatusVariant(
  status: string
): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "approved":
      return "default";
    case "returned":
      return "secondary";
    case "rejected":
      return "destructive";
    default:
      return "outline";
  }
}

function formatDateTime(value: string) {
  return new Date(value).toLocaleString("ja-JP");
}

export default async function RequestDetailPage({ params }: PageProps) {
  const { id } = await params;

  const { data: request, error } = await supabase
    .from("requests")
    .select(
      "id, title, request_type, amount, reason, status, applicant_id, approver_id, due_date, created_at, updated_at"
    )
    .eq("id", id)
    .single<RequestRow>();

  if (error || !request) {
    return (
      <main className="min-h-screen bg-muted/30 p-6">
        <div className="mx-auto max-w-3xl">
          <Button asChild variant="ghost" className="mb-4">
            <Link href="/requests">
              <ArrowLeft className="size-4" />
              申請一覧へ戻る
            </Link>
          </Button>

          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle>申請が見つかりません</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                指定された申請データを取得できませんでした。
              </p>
              {error && (
                <p className="mt-3 text-sm text-destructive">
                  {error.message}
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    );
  }

  const { data: comments } = await supabase
    .from("request_comments")
    .select("id, comment, created_at")
    .eq("request_id", request.id)
    .order("created_at", { ascending: true });

  const { data: auditLogs } = await supabase
    .from("audit_logs")
    .select("id, action, detail, created_at")
    .eq("request_id", request.id)
    .order("created_at", { ascending: false });

  return (
    <main className="min-h-screen bg-muted/30 p-6">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <div>
          <Button asChild variant="ghost" className="mb-4">
            <Link href="/requests">
              <ArrowLeft className="size-4" />
              申請一覧へ戻る
            </Link>
          </Button>

          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
            <div>
              <div className="mb-2 flex items-center gap-2">
                <Badge variant="secondary">{request.id.slice(0, 8)}</Badge>
                <Badge variant={getStatusVariant(request.status)}>
                  {getStatusLabel(request.status)}
                </Badge>
              </div>
              <h1 className="text-3xl font-bold tracking-tight">
                {request.title}
              </h1>
              <p className="mt-2 text-muted-foreground">
                Supabaseから取得した申請内容、承認状況、コメント履歴、操作ログを確認できます。
              </p>
            </div>
            <RequestStatusActions requestId={request.id} />
          </div>
        </div>

        <section className="grid gap-4 lg:grid-cols-[2fr_1fr]">
          <div className="flex flex-col gap-4">
            <Card className="rounded-2xl">
              <CardHeader>
                <CardTitle>申請内容</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <InfoItem
                    label="申請種別"
                    value={getRequestTypeLabel(request.request_type)}
                  />
                  <InfoItem
                    label="ステータス"
                    value={getStatusLabel(request.status)}
                  />
                  <InfoItem label="申請者" value="未設定" />
                  <InfoItem label="所属部署" value="未設定" />
                  <InfoItem label="承認者" value="未設定" />
                  <InfoItem
                    label="金額"
                    value={
                      request.amount
                        ? `${request.amount.toLocaleString()}円`
                        : "-"
                    }
                  />
                  <InfoItem label="希望期限" value={request.due_date} />
                  <InfoItem
                    label="申請日時"
                    value={formatDateTime(request.created_at)}
                  />
                </div>

                <Separator />

                <div>
                  <h2 className="mb-2 text-sm font-medium text-muted-foreground">
                    申請理由
                  </h2>
                  <p className="rounded-xl bg-muted/50 p-4 text-sm leading-7">
                    {request.reason}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="size-5" />
                  コメント履歴
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="grid gap-3">
                  {(comments as CommentRow[] | null)?.map((comment) => (
                      <div
                        key={comment.id}
                        className="rounded-xl border bg-background p-4"
                      >
                        <div className="mb-2 flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">システムユーザー</span>
                            <Badge variant="outline">コメント</Badge>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {formatDateTime(comment.created_at)}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {comment.comment}
                        </p>
                      </div>
                    ))}

                    {(!comments || comments.length === 0) && (
                      <div className="rounded-xl border bg-background p-4 text-sm text-muted-foreground">
                        コメントはまだありません。
                      </div>
                    )}
                </div>

                <RequestCommentForm requestId={request.id} />
              </CardContent>
            </Card>
          </div>

          <div className="flex flex-col gap-4">
            <Card className="rounded-2xl">
              <CardHeader>
                <CardTitle>承認フロー</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 text-sm">
                <FlowItem
                  icon={<CheckCircle2 className="size-4" />}
                  title="申請作成"
                  description="申請者が申請内容を登録"
                  active
                />
                <FlowItem
                  icon={<Clock3 className="size-4" />}
                  title="承認待ち"
                  description="承認者が内容を確認中"
                  active={request.status === "submitted"}
                />
                <FlowItem
                  icon={<CheckCircle2 className="size-4" />}
                  title="承認完了"
                  description="承認または差戻しで完了"
                  active={request.status !== "submitted"}
                />
              </CardContent>
            </Card>

            <Card className="rounded-2xl">
              <CardHeader>
                <CardTitle>操作ログ</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3">
                    {(auditLogs as AuditLogRow[] | null)?.map((log) => (
                      <div key={log.id} className="rounded-xl border p-3">
                        <div className="font-medium">{log.action}</div>
                        {log.detail && (
                          <div className="mt-1 text-sm text-muted-foreground">
                            {log.detail}
                          </div>
                        )}
                        <div className="mt-1 text-xs text-muted-foreground">
                          {formatDateTime(log.created_at)}
                        </div>
                      </div>
                    ))}

                    {(!auditLogs || auditLogs.length === 0) && (
                      <div className="rounded-xl border p-3 text-sm text-muted-foreground">
                        操作ログはまだありません。
                      </div>
                    )}
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl">
              <CardHeader>
                <CardTitle>この画面で見せるスキル</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>・URLパラメータに応じた1件取得</li>
                  <li>・Supabaseのselect / eq / singleによる取得</li>
                  <li>・申請詳細の情報設計</li>
                  <li>・承認、差戻し、却下の業務フロー設計</li>
                  <li>・次ステップでステータス更新処理を実装予定</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </main>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border bg-background p-4">
      <div className="text-sm text-muted-foreground">{label}</div>
      <div className="mt-1 font-medium">{value}</div>
    </div>
  );
}

function FlowItem({
  icon,
  title,
  description,
  active = false,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  active?: boolean;
}) {
  return (
    <div className="flex gap-3">
      <div
        className={
          active
            ? "flex size-8 items-center justify-center rounded-full bg-primary text-primary-foreground"
            : "flex size-8 items-center justify-center rounded-full bg-muted text-muted-foreground"
        }
      >
        {icon}
      </div>
      <div>
        <div className="font-medium">{title}</div>
        <div className="text-muted-foreground">{description}</div>
      </div>
    </div>
  );
}