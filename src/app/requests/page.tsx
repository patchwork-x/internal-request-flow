import Link from "next/link";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  RequestsTable,
  type RequestRow,
} from "@/components/requests/RequestsTable";
import { supabase } from "@/lib/supabase/client";

export default async function RequestsPage() {
  const { data: requests, error } = await supabase
    .from("requests")
    .select(
      "id, title, request_type, amount, reason, status, due_date, created_at, applicant_id, approver_id"
    )
    .order("created_at", { ascending: false });

  const { data: profiles, error: profilesError } = await supabase
    .from("profiles")
    .select("id, name, department");

  if (error) {
    console.error(error);
  }

  if (profilesError) {
    console.error(profilesError);
  }

  const requestRows = (requests ?? []).map((request) => {
    const applicant = (profiles ?? []).find(
      (profile) => profile.id === request.applicant_id
    );

    const approver = (profiles ?? []).find(
      (profile) => profile.id === request.approver_id
    );

    return {
      ...request,
      applicant: applicant ?? null,
      approver: approver ?? null,
    };
  });

  return (
    <main className="min-h-screen bg-muted/30 p-6">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <section className="flex flex-col gap-4 rounded-lg bg-background p-6 shadow-sm">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">申請一覧</h1>
              <p className="mt-2 text-muted-foreground">
                Supabaseに保存された社内申請データを一覧で確認できます。
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

        {error && (
          <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
            データの取得に失敗しました: {error.message}
          </div>
        )}

        {profilesError && (
          <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
            承認者情報の取得に失敗しました: {profilesError.message}
          </div>
        )}

        <RequestsTable requests={requestRows as RequestRow[]} />
      </div>
    </main>
  );
}