import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  RequestsTable,
  type RequestRow,
} from "@/components/requests/RequestsTable";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function RequestsPage() {
  const supabase = await createSupabaseServerClient();

  const { data: requests, error: requestError } = await supabase
    .from("requests")
    .select(
      "id, title, request_type, amount, reason, status, due_date, created_at, applicant_id, approver_id"
    )
    .order("created_at", { ascending: false });

  const { data: profiles, error: profileError } = await supabase
    .from("profiles")
    .select("id, name, department");

  if (requestError) {
    console.error(requestError);
  }

  if (profileError) {
    console.error(profileError);
  }

  const requestRows = (requests ?? []).map((request) => {
    const applicant =
      profiles?.find((profile) => profile.id === request.applicant_id) ?? null;

    const approver =
      profiles?.find((profile) => profile.id === request.approver_id) ?? null;

    return {
      ...request,
      applicant,
      approver,
    };
  }) as RequestRow[];

  return (
    <main className="min-h-screen p-6">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <section className="rounded-lg border bg-white p-6 shadow-sm">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">
                申請一覧
              </h1>
              <p className="mt-2 text-slate-600">
                申請状況、承認者、期限、対応履歴を確認できます。
              </p>
            </div>

            <Button asChild>
              <Link href="/requests/new">
                <Plus className="size-4" />
                新規申請
              </Link>
            </Button>
          </div>
        </section>

        {requestError && (
          <div className="rounded-lg border border-destructive/30 bg-white p-4 text-sm text-destructive shadow-sm">
            申請データを取得できませんでした。
          </div>
        )}

        {profileError && (
          <div className="rounded-lg border border-destructive/30 bg-white p-4 text-sm text-destructive shadow-sm">
            ユーザー情報を取得できませんでした。
          </div>
        )}

        <RequestsTable requests={requestRows} />
      </div>
    </main>
  );
}