"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { CheckCircle2, RotateCcw, XCircle } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { Button } from "@/components/ui/button";

type RequestStatusActionsProps = {
  requestId: string;
};


const actionLabels = {
  approved: "承認",
  returned: "差戻し",
  rejected: "却下",
} as const;

export function RequestStatusActions({ requestId }: RequestStatusActionsProps) {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();
  const [loadingStatus, setLoadingStatus] = useState<string | null>(null);

  async function updateStatus(status: "approved" | "returned" | "rejected") {
    setLoadingStatus(status);

    const { error: updateError } = await supabase
      .from("requests")
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", requestId);

    if (updateError) {
      setLoadingStatus(null);
      console.error(updateError);
      alert(`ステータス更新に失敗しました: ${updateError.message}`);
      return;
    }

    const { error: logError } = await supabase.from("audit_logs").insert({
      request_id: requestId,
      action: actionLabels[status],
      detail: `ステータスを「${actionLabels[status]}」に変更しました`,
    });

    setLoadingStatus(null);

    if (logError) {
      console.error(logError);
      alert(
        `ステータスは更新されましたが、操作ログの保存に失敗しました: ${logError.message}`
      );
      router.refresh();
      return;
    }

    router.refresh();
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