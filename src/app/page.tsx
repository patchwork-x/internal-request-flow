import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  FileText,
  RotateCcw,
  XCircle,
} from "lucide-react";
import { RequestTypeChart } from "@/components/dashboard/RequestTypeChart";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { supabase } from "@/lib/supabase/client";

type RequestRow = {
  id: string;
  title: string;
  request_type: string;
  amount: number | null;
  reason: string;
  status: string;
  due_date: string;
  created_at: string;
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

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("ja-JP");
}

export default async function Home() {
  const { data: requests, error } = await supabase
    .from("requests")
    .select("id, title, request_type, amount, reason, status, due_date, created_at")
    .order("created_at", { ascending: false });

  const requestRows = (requests ?? []) as RequestRow[];

  const submittedCount = requestRows.filter(
    (request) => request.status === "submitted"
  ).length;

  const approvedCount = requestRows.filter(
    (request) => request.status === "approved"
  ).length;

  const returnedCount = requestRows.filter(
    (request) => request.status === "returned"
  ).length;

  const rejectedCount = requestRows.filter(
    (request) => request.status === "rejected"
  ).length;

  const latestRequests = requestRows.slice(0, 5);

  const requestTypeChartData = [
    {
      name: "備品購入",
      count: requestRows.filter(
        (request) => request.request_type === "equipment"
      ).length,
    },
    {
      name: "SaaS",
      count: requestRows.filter(
        (request) => request.request_type === "saas_account"
      ).length,
    },
    {
      name: "権限付与",
      count: requestRows.filter(
        (request) => request.request_type === "permission"
      ).length,
    },
    {
      name: "PC購入",
      count: requestRows.filter(
        (request) => request.request_type === "pc_purchase"
      ).length,
    },
    {
      name: "経費",
      count: requestRows.filter(
        (request) => request.request_type === "expense"
      ).length,
    },
  ];

  const statusCards = [
    {
      label: "申請中",
      value: submittedCount,
      icon: Clock3,
    },
    {
      label: "承認済み",
      value: approvedCount,
      icon: CheckCircle2,
    },
    {
      label: "差戻し",
      value: returnedCount,
      icon: RotateCcw,
    },
    {
      label: "却下",
      value: rejectedCount,
      icon: XCircle,
    },
  ];

  return (
    <main className="min-h-screen px-6 py-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <section className="relative overflow-hidden rounded-xl border bg-background/80 p-8 shadow-sm">
        
          <Badge className="w-fit" variant="secondary">
            申請管理
          </Badge>

          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">
              申請管理ダッシュボード
            </h1>
            <p className="max-w-3xl text-muted-foreground">
              備品購入、SaaSアカウント発行、権限付与、経費申請などの社内申請を一元管理する業務アプリです。
              申請状況、承認履歴、コメント履歴、操作ログを可視化し、社内業務の属人化を防ぐことを目的としています。
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button asChild>
              <Link href="/requests/new">
                申請を作成
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/requests">申請一覧を見る</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/admin/audit-logs">操作ログを見る</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/admin/users">ユーザー管理</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/login">ログイン画面</Link>
            </Button>
          </div>
        </section>

        {error && (
          <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
            データの取得に失敗しました: {error.message}
          </div>
        )}

        <section className="grid gap-4 md:grid-cols-4">
          {statusCards.map((item) => {
            const Icon = item.icon;

            return (
              <Card key={item.label} className="rounded-lg">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {item.label}
                  </CardTitle>
                  <Icon className="size-5 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{item.value}</div>
                </CardContent>
              </Card>
            );
          })}
        </section>

        <section className="grid gap-4 lg:grid-cols-[2fr_1fr]">
          <Card className="rounded-xl border bg-background/80 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="size-5" />
                最新の申請
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-hidden rounded-xl border">
                <table className="w-full text-sm">
                  <thead className="bg-muted">
                    <tr>
                      <th className="px-4 py-3 text-left font-medium">ID</th>
                      <th className="px-4 py-3 text-left font-medium">
                        タイトル
                      </th>
                      <th className="px-4 py-3 text-left font-medium">種別</th>
                      <th className="px-4 py-3 text-left font-medium">
                        ステータス
                      </th>
                      <th className="px-4 py-3 text-left font-medium">
                        申請日
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {latestRequests.map((request) => (
                      <tr key={request.id} className="border-t">
                        <td className="px-4 py-3 font-medium">
                          {request.id.slice(0, 8)}
                        </td>
                        <td className="px-4 py-3">
                          <Link
                            href={`/requests/${request.id}`}
                            className="font-medium hover:underline"
                          >
                            {request.title}
                          </Link>
                        </td>
                        <td className="px-4 py-3">
                          {getRequestTypeLabel(request.request_type)}
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant={getStatusVariant(request.status)}>
                            {getStatusLabel(request.status)}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {formatDate(request.created_at)}
                        </td>
                      </tr>
                    ))}

                    {latestRequests.length === 0 && (
                      <tr>
                        <td
                          colSpan={5}
                          className="px-4 py-10 text-center text-muted-foreground"
                        >
                          申請データがありません。
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-xl border bg-background/80 shadow-sm">
            <CardHeader>
              <CardTitle>運用メモ</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li>・申請状況の一覧表示</li>
                <li>・申請データの保存・参照</li>
                <li>・承認状況の確認</li>
                <li>・コメント履歴・操作ログの確認</li>
                <li>・検索・絞り込み条件の管理</li>
              </ul>
            </CardContent>
          </Card>
        </section>
        <section className="grid gap-4">
          <Card className="rounded-xl border bg-background/80 shadow-sm">
            <CardHeader>
              <CardTitle>申請種別ごとの件数</CardTitle>
            </CardHeader>
            <CardContent>
              <RequestTypeChart data={requestTypeChartData} />
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  );
}