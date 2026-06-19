# internal-request-flow

社内申請・承認フローを想定したポートフォリオアプリです。

備品購入、SaaSアカウント発行、権限付与、PC購入、経費申請などを対象に、申請作成、承認・差戻し・却下、コメント、操作ログ、ユーザー管理を実装しています。

## 使用技術

・Next.js
・TypeScript
・React
・Tailwind CSS
・shadcn/ui
・Supabase
・PostgreSQL
・Supabase Auth
・Vercel

## 主な機能

・ログイン
・申請作成
・申請一覧
・申請詳細
・承認・差戻し・却下
・コメント追加
・操作ログ
・CSV出力
・管理者によるユーザー管理

## 補足

小規模な社内業務アプリを想定しているため、service / repository のような層は増やしすぎず、画面ごとの処理が追いやすい構成にしています。

管理者によるユーザー作成・編集・削除は、Supabase の service role key をブラウザに出さないため、Next.js の API Route 経由で実行しています。