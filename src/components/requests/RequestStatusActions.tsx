"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { CheckCircle2, RotateCcw, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

type RequestStatusActionsProps = {
  requestId: string;
};

type NextStatus = "approved" | "returned" | "rejected";

const statusText: Record<NextStatus, string> = {
  approved: "承認",
  returned: "差戻し",
  rejected: "却下",
};

export function RequestStatusActions({ requestId }: RequestStatusActionsProps) {
  const router = useRouter();
  const [loadingStatus, setLoadingStatus] = useState<NextStatus | null>(null);

  async function updateStatus(nextStatus: NextStatus) {
    const supabase = createSupabaseBrowserClient();

    setLoadingStatus(nextStatus);

    const { error: updateError } = await supabase
      .from("requests")
      .update({
        status: nextStatus,
        updated_at: new Date().toISOString(),
      })
      .eq("id", requestId);

    if (updateError) {
      console.error(updateError);
      alert("ステータスを更新できませんでした。");
      setLoadingStatus(null);
      return;
    }

    const label = statusText[nextStatus];

    const { error: logError } = await supabase.from("audit_logs").insert({
      request_id: requestId,
      action: label,
      detail: `申請を${label}しました`,
    });

    setLoadingStatus(null);
    router.refresh();

    if (logError) {
      console.error(logError);
      alert("ステータスは更新されましたが、操作ログを保存できませんでした。");
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        type="button"
        onClick={() => updateStatus("approved")}
        disabled={loadingStatus !== null}
      >
        <CheckCircle2 className="size-4" />
        {loadingStatus === "approved" ? "更新中..." : "承認"}
      </Button>

      <Button
        type="button"
        variant="secondary"
        onClick={() => updateStatus("returned")}
        disabled={loadingStatus !== null}
      >
        <RotateCcw className="size-4" />
        {loadingStatus === "returned" ? "更新中..." : "差戻し"}
      </Button>

      <Button
        type="button"
        variant="destructive"
        onClick={() => updateStatus("rejected")}
        disabled={loadingStatus !== null}
      >
        <XCircle className="size-4" />
        {loadingStatus === "rejected" ? "更新中..." : "却下"}
      </Button>
    </div>
  );
}
