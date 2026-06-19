"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type UserActionsProps = {
  user: {
    id: string;
    email: string | null;
    name: string;
    role: string;
    department: string | null;
  };
};

export function UserActions({ user }: UserActionsProps) {
  const router = useRouter();

  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [name, setName] = useState(user.name);
  const [department, setDepartment] = useState(user.department ?? "");
  const [role, setRole] = useState(user.role);
  const [email, setEmail] = useState(user.email ?? "");
  const [password, setPassword] = useState("");

  function resetForm() {
    setName(user.name);
    setDepartment(user.department ?? "");
    setRole(user.role);
    setEmail(user.email ?? "");
    setPassword("");
  }

  async function handleUpdate() {
    if (!name.trim()) {
      alert("氏名を入力してください。");
      return;
    }

    if (!email.trim()) {
      alert("メールアドレスを入力してください。");
      return;
    }

    setIsSubmitting(true);

    const response = await fetch(`/api/admin/users/${user.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        department,
        role,
        email,
        password: password || undefined,
      }),
    });

    const body = await response.json();

    setIsSubmitting(false);

    if (!response.ok) {
      alert(body.message ?? "更新できませんでした。");
      return;
    }

    alert("ユーザー情報を更新しました。");
    setIsEditing(false);
    setPassword("");
    router.refresh();
  }

  async function handleDelete() {
    const confirmed = confirm(`${user.name} を削除しますか？`);

    if (!confirmed) return;

    setIsSubmitting(true);

    const response = await fetch(`/api/admin/users/${user.id}`, {
      method: "DELETE",
    });

    const body = await response.json();

    setIsSubmitting(false);

    if (!response.ok) {
      alert(body.message ?? "削除できませんでした。");
      return;
    }

    alert("ユーザーを削除しました。");
    router.refresh();
  }

  if (!isEditing) {
    return (
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => setIsEditing(true)}
        >
          <Pencil className="size-4" />
          編集
        </Button>

        <Button
          type="button"
          size="sm"
          variant="destructive"
          onClick={handleDelete}
          disabled={isSubmitting}
        >
          <Trash2 className="size-4" />
          削除
        </Button>
      </div>
    );
  }

  return (
    <div className="grid gap-3 rounded-lg border bg-muted/20 p-4">
      <div className="grid gap-2">
        <Label>氏名</Label>
        <Input value={name} onChange={(event) => setName(event.target.value)} />
      </div>

      <div className="grid gap-2">
        <Label>部署</Label>
        <Input
          value={department}
          onChange={(event) => setDepartment(event.target.value)}
        />
      </div>

      <div className="grid gap-2">
        <Label>権限</Label>
        <Select value={role} onValueChange={setRole}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="applicant">申請者</SelectItem>
            <SelectItem value="approver">承認者</SelectItem>
            <SelectItem value="admin">管理者</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-2">
        <Label>メールアドレス</Label>
        <Input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
      </div>

      <div className="grid gap-2">
        <Label>新しいパスワード</Label>
        <Input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="変更しない場合は空欄"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <Button type="button" onClick={handleUpdate} disabled={isSubmitting}>
          {isSubmitting ? "更新中..." : "保存"}
        </Button>

        <Button
          type="button"
          variant="outline"
          onClick={() => {
            resetForm();
            setIsEditing(false);
          }}
          disabled={isSubmitting}
        >
          キャンセル
        </Button>
      </div>
    </div>
  );
}
