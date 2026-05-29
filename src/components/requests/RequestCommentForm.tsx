"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { MessageSquarePlus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/lib/supabase/client";

type RequestCommentFormProps = {
  requestId: string;
};

export function RequestCommentForm({ requestId }: RequestCommentFormProps) {
  const router = useRouter();
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit() {
    const trimmedComment = comment.trim();

    if (!trimmedComment) {
      alert("コメントを入力してください");
      return;
    }

    setIsSubmitting(true);

    const { error: commentError } = await supabase
      .from("request_comments")
      .insert({
        request_id: requestId,
        comment: trimmedComment,
      });

    if (commentError) {
      setIsSubmitting(false);
      console.error(commentError);
      alert(`コメントの保存に失敗しました: ${commentError.message}`);
      return;
    }

    const { error: logError } = await supabase.from("audit_logs").insert({
      request_id: requestId,
      action: "コメント追加",
      detail: "コメントを追加しました",
    });

    setIsSubmitting(false);

    if (logError) {
      console.error(logError);
      alert(
        `コメントは保存されましたが、操作ログの保存に失敗しました: ${logError.message}`
      );
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