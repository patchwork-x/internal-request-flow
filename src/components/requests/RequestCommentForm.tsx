"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { MessageSquarePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

type RequestCommentFormProps = {
  requestId: string;
};

export function RequestCommentForm({ requestId }: RequestCommentFormProps) {
  const router = useRouter();
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit() {
    const text = comment.trim();

    if (!text) {
      alert("コメントを入力してください。");
      return;
    }

    const supabase = createSupabaseBrowserClient();

    setIsSubmitting(true);

    const { error: commentError } = await supabase
      .from("request_comments")
      .insert({
        request_id: requestId,
        comment: text,
      });

    if (commentError) {
      console.error(commentError);
      alert("コメントを保存できませんでした。");
      setIsSubmitting(false);
      return;
    }

    const { error: logError } = await supabase.from("audit_logs").insert({
      request_id: requestId,
      action: "コメント追加",
      detail: "申請にコメントを追加しました",
    });

    setIsSubmitting(false);

    if (logError) {
      console.error(logError);
      alert("コメントは保存されましたが、操作ログを保存できませんでした。");
      router.refresh();
      return;
    }

    setComment("");
    router.refresh();
  }

  return (
    <div className="grid gap-2">
      <Textarea
        value={comment}
        onChange={(event) => setComment(event.target.value)}
        placeholder="コメントを入力してください"
        className="min-h-28"
      />

      <div className="flex justify-end">
        <Button type="button" onClick={handleSubmit} disabled={isSubmitting}>
          <MessageSquarePlus className="size-4" />
          {isSubmitting ? "追加中..." : "コメントを追加"}
        </Button>
      </div>
    </div>
  );
}
