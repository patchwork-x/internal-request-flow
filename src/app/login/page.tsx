"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { LockKeyhole, LogIn, UserRound } from "lucide-react";
import { useState } from "react";

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

export default function LoginPage() {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleLogin() {
    if (!email || !password) {
      alert("メールアドレスとパスワードを入力してください");
      return;
    }

    setIsSubmitting(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setIsSubmitting(false);

    if (error) {
      console.error(error);
      alert(`ログインに失敗しました: ${error.message}`);
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <main className="min-h-[calc(100vh-73px)] bg-background px-6 py-8">
      <div className="mx-auto grid min-h-[calc(100vh-137px)] max-w-6xl overflow-hidden rounded-3xl border bg-background shadow-sm lg:grid-cols-[1.1fr_0.9fr]">
        <section className="hidden bg-muted/20 p-10 lg:flex lg:flex-col lg:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
              <LogIn className="size-5" />
            </div>
            <div>
              <div className="font-bold tracking-tight">Internal Request Flow</div>
              <div className="text-sm text-muted-foreground">
                Approval workflow dashboard
              </div>
            </div>
          </div>

          <div className="max-w-xl">
            <p className="text-sm font-medium text-primary">Portfolio App</p>
            <h1 className="mt-4 text-4xl font-bold tracking-tight">
              社内申請・承認フローを、ひとつの管理画面で。
            </h1>
            <p className="mt-4 text-muted-foreground">
              申請作成、承認、差戻し、コメント履歴、操作ログを一元管理する業務アプリです。
            </p>
          </div>

          <div className="grid gap-3 text-sm text-muted-foreground">
            <div className="rounded-2xl border bg-background/80 p-4 shadow-sm">
              申請・承認・操作ログをSupabaseで管理
            </div>
            <div className="rounded-2xl border bg-background/80 p-4 shadow-sm">
              React Hook Form + Zod による入力バリデーション
            </div>
          </div>
        </section>

        <section className="flex items-center justify-center px-6 py-12">
          <Card className="w-full max-w-md rounded-3xl border bg-background/90 shadow-sm">
            <CardHeader className="space-y-3">
              <div>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <LogIn className="size-6" />
                  ログイン
                </CardTitle>
                <CardDescription className="mt-2">
                  登録済みアカウントでログインしてください。
                </CardDescription>
              </div>
            </CardHeader>

            <CardContent>
              <div className="grid gap-5">
                <div className="grid gap-2">
                  <Label htmlFor="email">メールアドレス</Label>
                  <div className="relative">
                    <UserRound className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      className="pl-9"
                      placeholder="yourname@example.com"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="password">パスワード</Label>
                  <div className="relative">
                    <LockKeyhole className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      className="pl-9"
                      placeholder="password"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                    />
                  </div>
                </div>

                <Button onClick={handleLogin} disabled={isSubmitting} className="h-11">
                  {isSubmitting ? "ログイン中..." : "ログイン"}
                </Button>

                <Button asChild variant="outline" className="h-11">
                  <Link href="/signup">アカウントを作成する</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  );
}