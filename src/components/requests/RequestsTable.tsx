"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Download, Filter, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type RequestRow = {
  id: string;
  title: string;
  request_type: string;
  amount: number | null;
  reason: string;
  status: string;
  due_date: string;
  created_at: string;
  applicant_id: string | null;
  approver_id: string | null;
  applicant: {
    id: string;
    name: string;
    department: string | null;
  } | null;
  approver: {
    id: string;
    name: string;
    department: string | null;
  } | null;
};

type RequestsTableProps = {
  requests: RequestRow[];
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

function escapeCsvValue(value: string | number | null) {
  if (value === null) return "";

  const stringValue = String(value);

  if (
    stringValue.includes(",") ||
    stringValue.includes('"') ||
    stringValue.includes("\n")
  ) {
    return `"${stringValue.replaceAll('"', '""')}"`;
  }

  return stringValue;
}

function downloadCsv(requests: RequestRow[]) {
  const headers = [
    "ID",
    "タイトル",
    "申請種別",
    "申請者",
    "申請者部署",
    "承認者",
    "承認者部署",
    "金額",
    "ステータス",
    "申請日",
    "期限",
  ];

  const rows = requests.map((request) => [
    request.id,
    request.title,
    getRequestTypeLabel(request.request_type),
    request.applicant?.name ?? "未設定",
    request.applicant?.department ?? "未設定",
    request.approver?.name ?? "未設定",
    request.approver?.department ?? "未設定",
    request.amount,
    getStatusLabel(request.status),
    formatDate(request.created_at),
    request.due_date,
  ]);

  const csvContent = [headers, ...rows]
    .map((row) => row.map(escapeCsvValue).join(","))
    .join("\n");

  const bom = "\uFEFF";
  const blob = new Blob([bom + csvContent], {
    type: "text/csv;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = `requests-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();

  URL.revokeObjectURL(url);
}

export function RequestsTable({ requests }: RequestsTableProps) {
  const [keyword, setKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  const filteredRequests = useMemo(() => {
    return requests.filter((request) => {
      const matchesKeyword =
        request.title.toLowerCase().includes(keyword.toLowerCase()) ||
        request.reason.toLowerCase().includes(keyword.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || request.status === statusFilter;

      const matchesType =
        typeFilter === "all" || request.request_type === typeFilter;

      return matchesKeyword && matchesStatus && matchesType;
    });
  }, [requests, keyword, statusFilter, typeFilter]);

  return (
    <Card className="overflow-hidden rounded-3xl border bg-background/80 shadow-sm">
      <CardHeader className="border-b bg-muted/20">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <CardTitle className="text-xl">申請データ</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              社内申請のステータス、承認者、期限を一覧で確認できます。
            </p>
          </div>
        
          <div className="rounded-full bg-background px-4 py-2 text-sm text-muted-foreground shadow-sm">
            {filteredRequests.length}件 / 全{requests.length}件
          </div>
        </div>
      </CardHeader>

      <CardContent className="grid gap-4">
        <div className="grid gap-3 rounded-2xl border bg-muted/20 p-4 lg:grid-cols-[1fr_220px_220px_auto]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              className="pl-9"
              placeholder="タイトル・理由で検索"
            />
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="ステータス" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">すべてのステータス</SelectItem>
              <SelectItem value="submitted">申請中</SelectItem>
              <SelectItem value="approved">承認済み</SelectItem>
              <SelectItem value="returned">差戻し</SelectItem>
              <SelectItem value="rejected">却下</SelectItem>
              <SelectItem value="canceled">取消</SelectItem>
            </SelectContent>
          </Select>

          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="申請種別" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">すべての申請種別</SelectItem>
              <SelectItem value="equipment">備品購入申請</SelectItem>
              <SelectItem value="saas_account">
                SaaSアカウント発行申請
              </SelectItem>
              <SelectItem value="permission">権限付与申請</SelectItem>
              <SelectItem value="pc_purchase">PC購入申請</SelectItem>
              <SelectItem value="expense">経費申請</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setKeyword("");
                  setStatusFilter("all");
                  setTypeFilter("all");
                }}
              >
                <Filter className="size-4" />
                条件クリア
              </Button>
            
              <Button
                type="button"
                variant="outline"
                onClick={() => downloadCsv(filteredRequests)}
                disabled={filteredRequests.length === 0}
              >
                <Download className="size-4" />
                CSV出力
              </Button>
            </div>
        </div>

        <div className="overflow-x-auto">
          <div className="overflow-hidden rounded-2xl border bg-background">
            <table className="w-full min-w-[1200px] text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">ID</th>
                  <th className="px-4 py-3 text-left font-medium">タイトル</th>
                  <th className="px-4 py-3 text-left font-medium">種別</th>
                  <th className="px-4 py-3 text-left font-medium">申請者</th>
                  <th className="px-4 py-3 text-left font-medium">申請者部署</th>
                  <th className="px-4 py-3 text-left font-medium">承認者</th>
                  <th className="px-4 py-3 text-left font-medium">承認者部署</th>
                  <th className="px-4 py-3 text-right font-medium">金額</th>
                  <th className="px-4 py-3 text-left font-medium">
                    ステータス
                  </th>
                  <th className="px-4 py-3 text-left font-medium">申請日</th>
                  <th className="px-4 py-3 text-left font-medium">期限</th>
                  <th className="px-4 py-3 text-left font-medium">操作</th>
                </tr>
              </thead>
              <tbody>
                {filteredRequests.map((request) => (
                  <tr key={request.id} className="border-t transition-colors hover:bg-muted/30">
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-muted px-2.5 py-1 font-mono text-xs">
                        {request.id.slice(0, 8)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/requests/${request.id}`}
                        className="font-medium text-foreground hover:underline"
                      >
                        {request.title}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      {getRequestTypeLabel(request.request_type)}
                    </td>
                    <td className="px-4 py-3">
                      {request.applicant?.name ?? "未設定"}
                    </td>
                    <td className="px-4 py-3">
                      {request.applicant?.department ?? "未設定"}
                    </td>
                    <td className="px-4 py-3">
                      {request.approver?.name ?? "未設定"}
                    </td>
                    <td className="px-4 py-3">
                      {request.approver?.department ?? "未設定"}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums">
                      {request.amount
                        ? `${request.amount.toLocaleString()}円`
                        : "-"}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={getStatusVariant(request.status)}>
                        {getStatusLabel(request.status)}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {formatDate(request.created_at)}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {request.due_date}
                    </td>
                    <td className="px-4 py-3">
                      <Button asChild size="sm" variant="outline">
                        <Link href={`/requests/${request.id}`}>詳細</Link>
                      </Button>
                    </td>
                  </tr>
                ))}

                {filteredRequests.length === 0 && (
                  <tr>
                    <td
                      colSpan={12}
                      className="px-4 py-10 text-center text-muted-foreground"
                    >
                      条件に一致する申請データがありません。
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}