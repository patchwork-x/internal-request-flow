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
import {
  getRequestTypeLabel,
  getStatusLabel,
} from "@/lib/constants/request";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type RequestRow = {
  id: string;
  title: string;
  request_type: string;
  status: string;
  created_at: string;
};

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
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("requests")
    .select("id, title, request_type, status, created_at")
    .order("created_at", { ascending: false });

  const requests = (data ?? []) as RequestRow[];

  const submittedCount = requests.filter(
    (request) => request.status === "submitted"
  ).length;

  const approvedCount = requests.filter(
    (request) => request.status === "approved"
  ).length;

  const returnedCount = requests.filter(
    (request) => request.status === "returned"
  ).length;

  const rejectedCount = requests.filter(
    (request) => request.status === "rejected"
  ).length;

  const latestRequests = requests.slice(0, 5);

  const requestTypeChartData = [
    {
      name: "備品購入",
      count: requests.filter(
        (request) => request.request_type === "equipment"
      ).length,
    },
    {
      name: "SaaS",
      count: requests.filter(
        (request) => request.request_type === "saas_account"
      ).length,
    },
    {
      name: "権限付与",
      count: requests.filter(
        (request) => request.request_type === "permission"
      ).length,
    },
    {
      name: "PC購入",
      count: requests.filter(
        (request) => request.request_type === "pc_purchase"
      ).length,
    },
    {
      name: "経費",
      count: requests.filter(
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
        <section className="rounded-xl border bg-background/80 p-8 shadow-sm">
          <Badge className="w-fit" variant="secondary">
            申請管理
          </Badge>

          <div className="mt-4 flex flex-col gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">
              申請管理ダッシュボード
            </h1>
            <p className="mt-3 max-w-3xl text-slate-600">
              社内で発生する申請をまとめて管理し、承認状況や対応履歴を確認できる画面です。
              申請作成、承認・差戻し、コメント、操作ログを通じて、対応状況を追えるようにしています。
            </p>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
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
            申請データを取得できませんでした。
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
              <CardTitle className="text-lg">管理対象</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="grid gap-3 text-sm text-slate-600">
                <li>・申請状況、期限、承認者の確認</li>
                <li>・申請内容、理由、金額の管理</li>
                <li>・承認、差戻し、却下の対応履歴</li>
                <li>・コメント履歴、操作ログの確認</li>
                <li>・条件検索、ステータス別の絞り込み</li>
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