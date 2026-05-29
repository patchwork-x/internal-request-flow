import Link from "next/link";
import { LockKeyhole, UserRound } from "lucide-react";

import { Badge } from "@/components/ui/badge";
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
  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/30 p-6">
      <Card className="w-full max-w-md rounded-2xl">
        <CardHeader className="space-y-3">
          <Badge className="w-fit" variant="secondary">
            Demo Login
          </Badge>
          <div>
            <CardTitle className="text-2xl">
              Internal Request Flow
            </CardTitle>
            <CardDescription className="mt-2">
              社内申請・承認ワークフロー管理アプリのデモログイン画面です。
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent>
          <form className="grid gap-5">
            <div className="grid gap-2">
              <Label htmlFor="email">メールアドレス</Label>
              <div className="relative">
                <UserRound className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  className="pl-9"
                  placeholder="admin@example.com"
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
                />
              </div>
            </div>

            <div className="rounded-xl border bg-muted/40 p-4 text-sm text-muted-foreground">
              <p className="font-medium text-foreground">デモ用アカウント想定</p>
              <ul className="mt-2 space-y-1">
                <li>・申請者：applicant@example.com</li>
                <li>・承認者：approver@example.com</li>
                <li>・管理者：admin@example.com</li>
              </ul>
            </div>

            <Button asChild className="w-full">
              <Link href="/">ログインしてダッシュボードへ</Link>
            </Button>

            <Button asChild variant="outline" className="w-full">
              <Link href="/requests">申請一覧を確認する</Link>
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}