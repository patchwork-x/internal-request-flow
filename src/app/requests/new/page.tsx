"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, CheckCircle2, Send } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  requestFormSchema,
  type RequestFormValues,
} from "@/lib/validations/request";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
type ApproverOption = {
  id: string;
  name: string;
  role: string;
  department: string | null;
};

const requestTypeOptions = [
  { value: "equipment", label: "備品購入申請" },
  { value: "saas_account", label: "SaaSアカウント発行申請" },
  { value: "permission", label: "権限付与申請" },
  { value: "pc_purchase", label: "PC購入申請" },
  { value: "expense", label: "経費申請" },
];

export default function NewRequestPage() {
  const supabase = createSupabaseBrowserClient();
  
  const [submittedData, setSubmittedData] =
    useState<RequestFormValues | null>(null);

  const [approverOptions, setApproverOptions] = useState<ApproverOption[]>([]);

  const {
    control,
    handleSubmit,
    register,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<RequestFormValues>({
    resolver: zodResolver(requestFormSchema),
    defaultValues: {
      title: "",
      requestType: "",
      amount: "",
      dueDate: "",
      approver: "",
      reason: "",
    },
  });

    async function onSubmit(values: RequestFormValues) {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        alert("ログイン情報を取得できませんでした。再ログインしてください。");
        return;
      }

      const amount =
        values.amount && values.amount.trim() !== ""
          ? Number(values.amount)
          : null;

      const { data: createdRequest, error: requestError } = await supabase
        .from("requests")
        .insert({
          title: values.title,
          request_type: values.requestType,
          amount,
          reason: values.reason,
          status: "submitted",
          due_date: values.dueDate,
          applicant_id: user.id,
          approver_id: values.approver,
        })
        .select("id")
        .single();

      if (requestError) {
        console.error(requestError);
        alert(`保存に失敗しました: ${requestError.message}`);
        return;
      }

      const { error: logError } = await supabase.from("audit_logs").insert({
        request_id: createdRequest.id,
        user_id: user.id,
        action: "申請作成",
        detail: "新規申請を作成しました",
      });

      if (logError) {
        console.error(logError);
        alert(
          `申請は保存されましたが、操作ログの保存に失敗しました: ${logError.message}`
        );
      }

      setSubmittedData(values);
      reset();
    }

    useEffect(() => {
  async function fetchApprovers() {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, name, role, department")
      .in("role", ["approver", "admin"])
      .order("created_at", { ascending: true });

    if (error) {
      console.error(error);
      alert(`承認者一覧の取得に失敗しました: ${error.message}`);
      return;
    }

    setApproverOptions((data ?? []) as ApproverOption[]);
  }

  fetchApprovers();
}, []);

  return (
    <main className="min-h-screen bg-muted/30 p-6">
      <div className="mx-auto flex max-w-4xl flex-col gap-6">
        <div>
          <Button asChild variant="ghost" className="mb-4">
            <Link href="/requests">
              <ArrowLeft className="size-4" />
              申請一覧へ戻る
            </Link>
          </Button>

          <h1 className="text-2xl font-semibold tracking-tight">新規申請</h1>
          <p className="mt-2 text-muted-foreground">
            備品購入、SaaSアカウント発行、権限付与、PC購入、経費申請などを登録できます。
          </p>
        </div>

        {submittedData && (
          <Card className="rounded-lg border-green-200 bg-green-50">
            <CardContent className="flex items-start gap-3 p-4">
              <CheckCircle2 className="mt-0.5 size-5 text-green-700" />
              <div>
                <p className="font-medium text-green-900">
                申請を保存しました
              </p>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="rounded-lg">
          <CardHeader>
            <CardTitle>申請内容</CardTitle>
            <CardDescription>
              申請内容を入力してください。必須項目が未入力の場合はエラーを表示します。
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="grid gap-6">
              <div className="grid gap-2">
                <Label htmlFor="title">申請タイトル</Label>
                <Input
                  id="title"
                  placeholder="例：SaaSアカウント発行申請"
                  {...register("title")}
                />
                {errors.title && (
                  <p className="text-sm text-destructive">
                    {errors.title.message}
                  </p>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="requestType">申請種別</Label>
                <Controller
                  name="requestType"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger id="requestType" className="w-full">
                        <SelectValue placeholder="申請種別を選択" />
                      </SelectTrigger>
                      <SelectContent>
                        {requestTypeOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.requestType && (
                  <p className="text-sm text-destructive">
                    {errors.requestType.message}
                  </p>
                )}
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="amount">金額</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="例：120000"
                    {...register("amount")}
                  />
                  <p className="text-xs text-muted-foreground">
                    金額が不要な申請の場合は空欄で問題ありません。
                  </p>
                  {errors.amount && (
                    <p className="text-sm text-destructive">
                      {errors.amount.message}
                    </p>
                  )}
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="dueDate">希望期限</Label>
                  <Input id="dueDate" type="date" {...register("dueDate")} />
                  {errors.dueDate && (
                    <p className="text-sm text-destructive">
                      {errors.dueDate.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="approver">承認者</Label>
                <Controller
                  name="approver"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger id="approver" className="w-full">
                        <SelectValue placeholder="承認者を選択" />
                      </SelectTrigger>
                      <SelectContent>
                        {approverOptions.map((approver) => (
                          <SelectItem key={approver.id} value={approver.id}>
                            {approver.name}
                            {approver.department ? `（${approver.department}）` : ""}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.approver && (
                  <p className="text-sm text-destructive">
                    {errors.approver.message}
                  </p>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="reason">申請理由</Label>
                <Textarea
                  id="reason"
                  placeholder="申請背景・必要性・業務上の理由を入力してください。"
                  className="min-h-32"
                  {...register("reason")}
                />
                {errors.reason && (
                  <p className="text-sm text-destructive">
                    {errors.reason.message}
                  </p>
                )}
              </div>

              <div className="rounded-xl border bg-muted/40 p-4">
                <h2 className="font-medium">この画面で見せる実装意図</h2>
                <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                  <li>・React Hook Form によるフォーム状態管理</li>
                  <li>・Zod による入力値バリデーション</li>
                  <li>・shadcn/ui の Select と Controller の連携</li>
                  <li>・業務申請に必要な入力項目の設計</li>
                  <li>・次ステップで Supabase へのDB保存を実装予定</li>
                </ul>
              </div>

              <div className="flex justify-end gap-3">
                <Button asChild variant="outline">
                  <Link href="/requests">キャンセル</Link>
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  <Send className="size-4" />
                  申請を送信
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
