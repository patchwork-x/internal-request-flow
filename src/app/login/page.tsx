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
    <main className="flex min-h-screen items-center justify-center bg-muted/30 p-6">
      <Card className="w-full max-w-md rounded-2xl">
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
                  placeholder="admin@example.com"
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

            <Button onClick={handleLogin} disabled={isSubmitting}>
              {isSubmitting ? "ログイン中..." : "ログイン"}
            </Button>

            <Button asChild variant="outline">
              <Link href="/signup">アカウントを作成する</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}