"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ChevronDown, ChevronUp, UserPlus } from "lucide-react";

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

export function CreateUserForm() {
  const router = useRouter();

  const [isOpen, setIsOpen] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("password123");
  const [department, setDepartment] = useState("");
  const [role, setRole] = useState<"applicant" | "approver" | "admin">(
    "applicant"
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleCreateUser() {
    if (!name.trim()) {
      alert("氏名を入力してください");
      return;
    }

    if (!email.trim()) {
      alert("メールアドレスを入力してください");
      return;
    }

    if (!password.trim()) {
      alert("パスワードを入力してください");
      return;
    }

    setIsSubmitting(true);

    const response = await fetch("/api/admin/users", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        email,
        password,
        department,
        role,
      }),
    });

    const result = await response.json();

    setIsSubmitting(false);

    if (!response.ok) {
      alert(`ユーザー作成に失敗しました: ${result.message}`);
      return;
    }

    alert("ユーザーを作成しました");

    setName("");
    setEmail("");
    setPassword("password123");
    setDepartment("");
    setRole("applicant");
    setIsOpen(false);

    router.refresh();
  }

  return (
    <div className="rounded-lg border bg-muted/20">
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className="flex w-full items-center justify-between gap-4 p-4 text-left"
      >
        <div>
          <div className="flex items-center gap-2 font-medium">
            <UserPlus className="size-4" />
            新規ユーザー作成フォーム
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            申請者・承認者・管理者アカウントを追加できます。
          </p>
        </div>

        {isOpen ? (
          <ChevronUp className="size-5 text-muted-foreground" />
        ) : (
          <ChevronDown className="size-5 text-muted-foreground" />
        )}
      </button>

      {isOpen && (
        <div className="grid gap-4 border-t p-4">
          <div className="grid gap-2">
            <Label htmlFor="create-name">氏名</Label>
            <Input
              id="create-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="例：山田 太郎"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="create-email">メールアドレス</Label>
            <Input
              id="create-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="example@example.com"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="create-password">初期パスワード</Label>
            <Input
              id="create-password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="create-department">所属部署</Label>
            <Input
              id="create-department"
              value={department}
              onChange={(event) => setDepartment(event.target.value)}
              placeholder="例：情報システム部"
            />
          </div>

          <div className="grid gap-2">
            <Label>権限</Label>
            <Select
              value={role}
              onValueChange={(value) =>
                setRole(value as "applicant" | "approver" | "admin")
              }
            >
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

          <div className="flex flex-wrap gap-2">
            <Button onClick={handleCreateUser} disabled={isSubmitting}>
              <UserPlus className="size-4" />
              {isSubmitting ? "作成中..." : "ユーザーを作成"}
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isSubmitting}
            >
              閉じる
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}