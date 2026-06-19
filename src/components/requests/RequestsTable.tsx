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
import {
  getRequestTypeLabel,
  getStatusLabel,
  getStatusVariant,
  requestTypeOptions,
  statusOptions,
} from "@/lib/constants/request";

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

function formatDate(value: string) {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("ja-JP");
}

function csvValue(value: string | number | null | undefined) {
  if (value === null || value === undefined) return "";

  const text = String(value);

  if (text.includes(",") || text.includes('"') || text.includes("\n")) {
    return `"${text.replaceAll('"', '""')}"`;
  }

  return text;
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
    formatDate(request.due_date),
  ]);

  const csv = [headers, ...rows]
    .map((row) => row.map(csvValue).join(","))
    .join("\n");

  const blob = new Blob(["\uFEFF" + csv], {
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
    const word = keyword.trim().toLowerCase();

    return requests.filter((request) => {
      const text = [
        request.title,
        request.reason,
        request.applicant?.name,
        request.applicant?.department,
        request.approver?.name,
        request.approver?.department,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesKeyword = word === "" || text.includes(word);
      const matchesStatus =
        statusFilter === "all" || request.status === statusFilter;
      const matchesType =
        typeFilter === "all" || request.request_type === typeFilter;

      return matchesKeyword && matchesStatus && matchesType;
    });
  }, [requests, keyword, statusFilter, typeFilter]);

  return (
    <Card className="overflow-hidden rounded-lg border bg-white shadow-sm">
      <CardHeader className="border-b bg-white">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <CardTitle className="text-xl">申請データ</CardTitle>
            <p className="mt-1 text-sm text-slate-600">
              条件で絞り込みながら、申請内容と対応状況を確認できます。
            </p>
          </div>

          <div className="rounded-md border bg-white px-4 py-2 text-sm text-muted-foreground shadow-sm">
            {filteredRequests.length}件 / 全{requests.length}件
          </div>
        </div>
      </CardHeader>

      <CardContent className="grid gap-4 p-4">
        <div className="grid gap-3 rounded-lg border bg-white p-4 lg:grid-cols-[1fr_220px_220px_auto]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              className="bg-white pl-9"
              placeholder="タイトル、理由、申請者で検索"
            />
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full bg-white">
              <SelectValue placeholder="ステータス" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">すべてのステータス</SelectItem>
              {statusOptions.map((status) => (
                <SelectItem key={status.value} value={status.value}>
                  {status.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-full bg-white">
              <SelectValue placeholder="申請種別" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">すべての申請種別</SelectItem>
              {requestTypeOptions.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
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
          <div className="overflow-hidden rounded-lg border bg-white">
            <table className="w-full min-w-[1200px] text-sm">
              <thead className="bg-muted/40">
                <tr>
                  <th className="px-4 py-2.5 text-left font-medium">ID</th>
                  <th className="px-4 py-2.5 text-left font-medium">
                    タイトル
                  </th>
                  <th className="px-4 py-2.5 text-left font-medium">種別</th>
                  <th className="px-4 py-2.5 text-left font-medium">
                    申請者
                  </th>
                  <th className="px-4 py-2.5 text-left font-medium">
                    申請者部署
                  </th>
                  <th className="px-4 py-2.5 text-left font-medium">
                    承認者
                  </th>
                  <th className="px-4 py-2.5 text-left font-medium">
                    承認者部署
                  </th>
                  <th className="px-4 py-2.5 text-right font-medium">金額</th>
                  <th className="px-4 py-2.5 text-left font-medium">
                    ステータス
                  </th>
                  <th className="px-4 py-2.5 text-left font-medium">申請日</th>
                  <th className="px-4 py-2.5 text-left font-medium">期限</th>
                  <th className="px-4 py-2.5 text-left font-medium">操作</th>
                </tr>
              </thead>

              <tbody>
                {filteredRequests.map((request) => (
                  <tr
                    key={request.id}
                    className="border-t transition-colors hover:bg-muted/20"
                  >
                    <td className="px-4 py-2.5">
                      <span className="rounded-md bg-muted px-2.5 py-1 font-mono text-xs">
                        {request.id.slice(0, 8)}
                      </span>
                    </td>
                    <td className="px-4 py-2.5">
                      <Link
                        href={`/requests/${request.id}`}
                        className="font-medium text-foreground hover:underline"
                      >
                        {request.title}
                      </Link>
                    </td>
                    <td className="px-4 py-2.5">
                      {getRequestTypeLabel(request.request_type)}
                    </td>
                    <td className="px-4 py-2.5">
                      {request.applicant?.name ?? "未設定"}
                    </td>
                    <td className="px-4 py-2.5">
                      {request.applicant?.department ?? "未設定"}
                    </td>
                    <td className="px-4 py-2.5">
                      {request.approver?.name ?? "未設定"}
                    </td>
                    <td className="px-4 py-2.5">
                      {request.approver?.department ?? "未設定"}
                    </td>
                    <td className="px-4 py-2.5 text-right tabular-nums">
                      {request.amount
                        ? `${request.amount.toLocaleString()}円`
                        : "-"}
                    </td>
                    <td className="px-4 py-2.5">
                      <Badge variant={getStatusVariant(request.status)}>
                        {getStatusLabel(request.status)}
                      </Badge>
                    </td>
                    <td className="px-4 py-2.5 text-muted-foreground">
                      {formatDate(request.created_at)}
                    </td>
                    <td className="px-4 py-2.5 text-muted-foreground">
                      {formatDate(request.due_date)}
                    </td>
                    <td className="px-4 py-2.5">
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
