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
    <main className="min-h-[calc(100vh-73px)] bg-background px-6 py-8">
      <div className="mx-auto grid min-h-[calc(100vh-137px)] max-w-6xl overflow-hidden rounded-3xl border bg-background shadow-sm lg:grid-cols-[0.9fr_1.1fr]">
        <section className="flex items-center justify-center px-6 py-12">
          <Card className="w-full max-w-lg rounded-3xl border bg-background/90 shadow-sm">
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
                  placeholder="yourname@example.com"
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

              <Button onClick={handleSignup} disabled={isSubmitting} className="h-11">
                {isSubmitting ? "作成中..." : "アカウント作成"}
              </Button>

              <Button asChild variant="outline" className="h-11">
                <Link href="/login">ログイン画面へ</Link>
              </Button>
            </CardContent>
          </Card>
        </section>

        <section className="hidden border-l bg-muted/20 p-10 lg:flex lg:flex-col lg:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
              <UserPlus className="size-5" />
            </div>
            <div>
              <div className="font-bold tracking-tight">Account Setup</div>
              <div className="text-sm text-muted-foreground">
                Role-based workflow app
              </div>
            </div>
          </div>

          <div className="max-w-xl">
            <p className="text-sm font-medium text-primary">Auth Ready</p>
            <h1 className="mt-4 text-4xl font-bold tracking-tight">
              申請者・承認者・管理者を分けて管理。
            </h1>
            <p className="mt-4 text-muted-foreground">
              Supabase Authとprofilesテーブルを組み合わせ、今後のロール制御やRLS対応に拡張できる構成です。
            </p>
          </div>

          <div className="grid gap-3 text-sm text-muted-foreground">
            <div className="rounded-2xl border bg-background/80 p-4 shadow-sm">
              新規登録時にprofilesへユーザー情報を作成
            </div>
            <div className="rounded-2xl border bg-background/80 p-4 shadow-sm">
              applicant / approver / admin のロール設計
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}