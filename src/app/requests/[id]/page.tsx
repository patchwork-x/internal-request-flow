import Link from "next/link";
import type { ReactNode } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  MessageSquare,
} from "lucide-react";
import { RequestCommentForm } from "@/components/requests/RequestCommentForm";
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
import {
  getRequestTypeLabel,
  getStatusLabel,
  getStatusVariant,
} from "@/lib/constants/request";
import { createSupabaseServerClient } from "@/lib/supabase/server";

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

type ProfileRow = {
  id: string;
  name: string;
  department: string | null;
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

function formatDateTime(value: string) {
  return new Date(value).toLocaleString("ja-JP");
}

function formatDate(value: string) {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("ja-JP");
}

export default async function RequestDetailPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();

  const { data: request, error } = await supabase
    .from("requests")
    .select(
      "id, title, request_type, amount, reason, status, applicant_id, approver_id, due_date, created_at, updated_at"
    )
    .eq("id", id)
    .single<RequestRow>();

  if (error || !request) {
    return (
      <main className="min-h-screen px-6 py-8">
        <div className="mx-auto max-w-3xl">
          <Button asChild variant="ghost" className="mb-4">
            <Link href="/requests">
              <ArrowLeft className="size-4" />
              申請一覧へ戻る
            </Link>
          </Button>

          <Card className="rounded-lg border bg-white shadow-sm">
            <CardHeader>
              <CardTitle>申請が見つかりません</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                指定された申請データを取得できませんでした。
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    );
  }

  const profileIds = [request.applicant_id, request.approver_id].filter(
    Boolean
  ) as string[];

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, name, department")
    .in("id", profileIds);

  const applicant =
    (profiles as ProfileRow[] | null)?.find(
      (profile) => profile.id === request.applicant_id
    ) ?? null;

  const approver =
    (profiles as ProfileRow[] | null)?.find(
      (profile) => profile.id === request.approver_id
    ) ?? null;

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

  const commentRows = (comments ?? []) as CommentRow[];
  const logRows = (auditLogs ?? []) as AuditLogRow[];

  return (
    <main className="min-h-screen px-6 py-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <div>
          <Button asChild variant="ghost" className="mb-4">
            <Link href="/requests">
              <ArrowLeft className="size-4" />
              申請一覧へ戻る
            </Link>
          </Button>

          <section className="rounded-lg border bg-white p-6 shadow-sm">
            <div className="flex flex-col justify-between gap-6 md:flex-row md:items-start">
              <div>
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <Badge className="rounded-md" variant="secondary">
                    {request.id.slice(0, 8)}
                  </Badge>
                  <Badge
                    className="rounded-md"
                    variant={getStatusVariant(request.status)}
                  >
                    {getStatusLabel(request.status)}
                  </Badge>
                </div>

                <h1 className="text-2xl font-semibold tracking-tight">
                  {request.title}
                </h1>

                <p className="mt-3 max-w-3xl text-slate-600">
                  申請内容、承認状況、コメント、操作履歴を確認できます。
                </p>
              </div>

              <div className="rounded-lg border bg-white p-3 shadow-sm">
                <RequestStatusActions requestId={request.id} />
              </div>
            </div>
          </section>
        </div>

        <section className="grid gap-4 lg:grid-cols-[2fr_1fr]">
          <div className="flex flex-col gap-4">
            <Card className="rounded-lg border bg-white shadow-sm">
              <CardHeader className="border-b bg-muted/20">
                <CardTitle>申請内容</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 p-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <InfoItem
                    label="申請種別"
                    value={getRequestTypeLabel(request.request_type)}
                  />
                  <InfoItem
                    label="ステータス"
                    value={getStatusLabel(request.status)}
                  />
                  <InfoItem label="申請者" value={applicant?.name ?? "未設定"} />
                  <InfoItem
                    label="申請者部署"
                    value={applicant?.department ?? "未設定"}
                  />
                  <InfoItem label="承認者" value={approver?.name ?? "未設定"} />
                  <InfoItem
                    label="承認者部署"
                    value={approver?.department ?? "未設定"}
                  />
                  <InfoItem
                    label="金額"
                    value={
                      request.amount
                        ? `${request.amount.toLocaleString()}円`
                        : "-"
                    }
                  />
                  <InfoItem
                    label="希望期限"
                    value={formatDate(request.due_date)}
                  />
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
                  <p className="rounded-lg border bg-white p-4 text-sm leading-7">
                    {request.reason}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-lg border bg-white shadow-sm">
              <CardHeader className="border-b bg-muted/20">
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="size-5" />
                  コメント履歴
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 p-4">
                <div className="grid gap-3">
                  {commentRows.map((comment) => (
                    <div
                      key={comment.id}
                      className="rounded-lg border bg-white p-4"
                    >
                      <div className="mb-2 flex items-center justify-between gap-3">
                        <span className="font-medium">コメント</span>
                        <span className="text-xs text-muted-foreground">
                          {formatDateTime(comment.created_at)}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {comment.comment}
                      </p>
                    </div>
                  ))}

                  {commentRows.length === 0 && (
                    <div className="rounded-lg border bg-white p-4 text-sm text-muted-foreground">
                      コメントはまだありません。
                    </div>
                  )}
                </div>

                <RequestCommentForm requestId={request.id} />
              </CardContent>
            </Card>
          </div>

          <div className="flex flex-col gap-4">
            <Card className="rounded-lg border bg-white shadow-sm">
              <CardHeader className="border-b bg-muted/20">
                <CardTitle>承認フロー</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 p-4 text-sm">
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
                  title="対応完了"
                  description="承認、差戻し、却下のいずれかで完了"
                  active={request.status !== "submitted"}
                />
              </CardContent>
            </Card>

            <Card className="rounded-lg border bg-white shadow-sm">
              <CardHeader className="border-b bg-muted/20">
                <CardTitle>操作ログ</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="grid gap-3">
                  {logRows.map((log) => (
                    <div key={log.id} className="rounded-lg border bg-white p-3">
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

                  {logRows.length === 0 && (
                    <div className="rounded-lg border bg-white p-3 text-sm text-muted-foreground">
                      操作ログはまだありません。
                    </div>
                  )}
                </div>
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
    <div className="rounded-lg border bg-white p-4">
      <div className="text-xs font-medium text-muted-foreground">{label}</div>
      <div className="mt-2 font-semibold">{value}</div>
    </div>
  );
}

function FlowItem({
  icon,
  title,
  description,
  active = false,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  active?: boolean;
}) {
  return (
    <div className="flex gap-3">
      <div
        className={
          active
            ? "flex size-9 items-center justify-center rounded-md bg-primary text-primary-foreground shadow-sm"
            : "flex size-9 items-center justify-center rounded-md border bg-white text-muted-foreground"
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