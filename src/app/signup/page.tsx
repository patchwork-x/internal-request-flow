"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { UserPlus } from "lucide-react";

import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
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

export default function SignupPage() {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();

  const [name, setName] = useState("");
  const [department, setDepartment] = useState("");
  const [role, setRole] = useState("applicant");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSignup() {
    if (!name || !email || !password) {
      alert("氏名、メールアドレス、パスワードを入力してください");
      return;
    }

    setIsSubmitting(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          department,
          role,
        },
      },
    });

    setIsSubmitting(false);

    if (error) {
      console.error(error);
      alert(`アカウント作成に失敗しました: ${error.message}`);
      return;
    }

    alert("アカウントを作成しました。ログインしてください。");
    router.push("/login");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/30 p-6">
      <Card className="w-full max-w-md rounded-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <UserPlus className="size-6" />
            アカウント作成
          </CardTitle>
          <CardDescription>
            申請者・承認者・管理者のアカウントを作成できます。
          </CardDescription>
        </CardHeader>

        <CardContent className="grid gap-5">
          <div className="grid gap-2">
            <Label htmlFor="name">氏名</Label>
            <Input
              id="name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="例：山田 太郎"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="department">所属部署</Label>
            <Input
              id="department"
              value={department}
              onChange={(event) => setDepartment(event.target.value)}
              placeholder="例：情報システム部"
            />
          </div>

          <div className="grid gap-2">
            <Label>権限</Label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger>
                <SelectValue placeholder="権限を選択" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="applicant">申請者</SelectItem>
                <SelectItem value="approver">承認者</SelectItem>
                <SelectItem value="admin">管理者</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="email">メールアドレス</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="example@example.com"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="password">パスワード</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="8文字以上推奨"
            />
          </div>

          <Button onClick={handleSignup} disabled={isSubmitting}>
            {isSubmitting ? "作成中..." : "アカウント作成"}
          </Button>

          <Button asChild variant="outline">
            <Link href="/login">ログイン画面へ</Link>
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}