# Internal Request Flow

社内申請・承認ワークフロー管理アプリです。

備品購入、SaaSアカウント発行、権限付与、PC購入、経費申請などの社内申請を一元管理し、申請状況・承認履歴・コメント履歴・操作ログを可視化することを目的としています。

## 作成背景

社内SE的な業務や社内IT対応では、備品購入、アカウント発行、権限付与、経費申請などの依頼がメールやチャットに分散しやすく、以下のような課題が発生しやすいと考えました。

* 申請状況が一覧で確認できない
* 承認済み・差戻し・却下などのステータスが追いづらい
* コメントや確認内容がチャット上に分散する
* 誰がいつ操作したのか履歴が残りにくい
* 月次確認や集計のためにデータを再利用しづらい

本アプリでは、申請作成、一覧表示、詳細確認、承認・差戻し・却下、コメント追加、操作ログ保存、CSV出力を実装し、社内申請業務を管理画面上で一元管理できる構成を目指しています。

## 想定ユーザー

* 申請者：備品購入、アカウント発行、権限付与、経費申請などを行う社員
* 承認者：申請内容を確認し、承認・差戻し・却下を行う担当者
* 管理者：申請状況、操作履歴、コメント履歴を確認する管理部門・情報システム部門

## 主な機能

### ダッシュボード

* 申請中・承認済み・差戻し・却下の件数表示
* Supabaseに保存された申請データの集計
* 最新申請の一覧表示
* 申請詳細ページへのリンク
* 申請種別ごとの件数をグラフ表示

### 申請一覧

* Supabaseの `requests` テーブルから申請データを取得
* 申請タイトル、申請種別、金額、ステータス、申請日、期限を一覧表示
* キーワード検索
* ステータス絞り込み
* 申請種別絞り込み
* 条件クリア
* CSV出力

### 新規申請作成

* React Hook Formによるフォーム状態管理
* Zodによる入力値バリデーション
* 申請タイトル、申請種別、金額、希望期限、承認者、申請理由の入力
* Supabaseの `requests` テーブルへの保存
* 申請作成時に `audit_logs` テーブルへ操作ログを保存

### 申請詳細

* URLパラメータに応じてSupabaseから申請データを1件取得
* 申請内容、ステータス、金額、期限、申請理由を表示
* 承認・差戻し・却下によるステータス更新
* ステータス変更時に操作ログを保存
* コメント履歴の表示
* コメント追加
* コメント追加時に操作ログを保存

### 操作ログ

* 申請作成
* 承認
* 差戻し
* 却下
* コメント追加

上記の操作を `audit_logs` テーブルに保存し、詳細画面で表示します。

### 管理者向け操作ログ一覧

* `/admin/audit-logs` で全操作ログを一覧表示
* 申請作成、承認、差戻し、却下、コメント追加などの履歴を確認
* 対象申請への詳細リンクを表示
* 管理者が全体の申請操作履歴を確認できる画面を想定

### CSV出力

申請一覧画面で、現在表示されている申請データをCSVとして出力できます。

検索・絞り込み後にCSV出力した場合は、絞り込み後のデータのみを出力します。

## 使用技術

| 分類 | 技術 |
|---|---|
| フレームワーク | Next.js |
| 言語 | TypeScript |
| UI | React |
| スタイリング | Tailwind CSS |
| UIコンポーネント | shadcn/ui |
| アイコン | Lucide React |
| フォーム管理 | React Hook Form |
| バリデーション | Zod |
| グラフ | Recharts |
| データベース | Supabase / PostgreSQL |
| BaaS | Supabase |
| デプロイ予定 | Vercel |

## 画面一覧

| URL              | 内容      |
| ---------------- | ------- |
| `/`              | ダッシュボード |
| `/requests`      | 申請一覧    |
| `/requests/new`  | 新規申請作成  |
| `/requests/[id]` | 申請詳細    |
| `/admin/audit-logs` | 管理者向け操作ログ一覧 |

## DB設計

### requests

申請データを管理するテーブルです。

| カラム          | 内容     |
| ------------ | ------ |
| id           | 申請ID   |
| title        | 申請タイトル |
| request_type | 申請種別   |
| amount       | 金額     |
| reason       | 申請理由   |
| status       | ステータス  |
| applicant_id | 申請者ID  |
| approver_id  | 承認者ID  |
| due_date     | 希望期限   |
| created_at   | 作成日時   |
| updated_at   | 更新日時   |

### request_comments

申請に対するコメントを管理するテーブルです。

| カラム        | 内容        |
| ---------- | --------- |
| id         | コメントID    |
| request_id | 対象申請ID    |
| user_id    | コメント投稿者ID |
| comment    | コメント内容    |
| created_at | 作成日時      |

### audit_logs

操作ログを管理するテーブルです。

| カラム        | 内容       |
| ---------- | -------- |
| id         | ログID     |
| user_id    | 操作ユーザーID |
| request_id | 対象申請ID   |
| action     | 操作内容     |
| detail     | 操作詳細     |
| created_at | 作成日時     |

### profiles

ユーザープロフィールを管理するテーブルです。

| カラム        | 内容     |
| ---------- | ------ |
| id         | ユーザーID |
| name       | 氏名     |
| role       | 権限     |
| department | 部署     |
| created_at | 作成日時   |

## ステータス設計

| ステータス     | 表示名  | 内容              |
| --------- | ---- | --------------- |
| submitted | 申請中  | 申請が作成され、承認待ちの状態 |
| approved  | 承認済み | 承認者が申請を承認した状態   |
| returned  | 差戻し  | 追加確認や修正が必要な状態   |
| rejected  | 却下   | 申請が却下された状態      |
| canceled  | 取消   | 申請者が取り消した状態     |

## 申請種別

| 値            | 表示名           |
| ------------ | ------------- |
| equipment    | 備品購入申請        |
| saas_account | SaaSアカウント発行申請 |
| permission   | 権限付与申請        |
| pc_purchase  | PC購入申請        |
| expense      | 経費申請          |

## 工夫した点

### 業務アプリらしい情報設計

単純なTodoアプリではなく、社内申請業務を想定し、申請種別、承認ステータス、期限、コメント履歴、操作ログを持つ構成にしました。

### React Hook Form + Zod によるフォーム設計

申請作成フォームでは、React Hook Formで入力状態を管理し、Zodで必須入力や文字数のバリデーションを行っています。

### Supabase連携

申請データ、コメント、操作ログをSupabaseに保存し、一覧・詳細・ダッシュボードに反映しています。

### 操作ログによる監査性

承認、差戻し、却下、コメント追加、申請作成などの操作を `audit_logs` に保存し、業務システムとしての監査性を意識しました。

### 検索・絞り込み・CSV出力

申請件数が増えた場合でも必要な申請を探せるよう、検索・ステータス絞り込み・申請種別絞り込みを実装しました。

また、管理部門での月次確認や集計を想定し、表示中の申請データをCSV出力できるようにしています。

### ダッシュボードの実データ集計

Supabaseに保存された申請データをもとに、申請中・承認済み・差戻し・却下の件数を集計しています。

また、申請種別ごとの件数をRechartsでグラフ表示し、管理画面として申請傾向を把握しやすい構成にしています。

### 管理者向け操作ログ一覧

申請詳細画面だけでなく、管理者向けに全操作ログを確認できる `/admin/audit-logs` を作成しました。

申請作成、承認、差戻し、却下、コメント追加などの履歴を一覧化し、対象申請の詳細ページへ遷移できるようにしています。

## セットアップ

### 1. リポジトリをクローン

```bash
git clone <repository-url>
cd internal-request-flow
```

### 2. 依存関係をインストール

```bash
npm install
```

### 3. 環境変数を設定

プロジェクト直下に `.env.local` を作成し、SupabaseのURLとPublishable keyを設定します。

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-publishable-key
```

### 4. 開発サーバーを起動

```bash
npm run dev
```

ブラウザで以下を開きます。

```txt
http://localhost:3000
```

## Supabase SQL

開発時は以下のSQLでテーブルを作成しています。

```sql
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  role text not null check (role in ('applicant', 'approver', 'admin')),
  department text,
  created_at timestamp with time zone default now()
);

create table requests (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  request_type text not null check (
    request_type in (
      'equipment',
      'saas_account',
      'permission',
      'pc_purchase',
      'expense'
    )
  ),
  amount integer,
  reason text not null,
  status text not null default 'submitted' check (
    status in ('submitted', 'approved', 'rejected', 'returned', 'canceled')
  ),
  applicant_id uuid references profiles(id),
  approver_id uuid references profiles(id),
  due_date date not null,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create table request_comments (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references requests(id) on delete cascade,
  user_id uuid references profiles(id),
  comment text not null,
  created_at timestamp with time zone default now()
);

create table audit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id),
  request_id uuid references requests(id),
  action text not null,
  detail text,
  created_at timestamp with time zone default now()
);
```

開発初期段階ではログイン機能を未実装のため、RLSを一時的に無効化しています。

```sql
alter table profiles disable row level security;
alter table requests disable row level security;
alter table request_comments disable row level security;
alter table audit_logs disable row level security;
```

本番運用を想定する場合は、Supabase AuthとRLSポリシーを設定する必要があります。

## 今後の改善予定

* Supabase Authによるログイン機能
* 申請者・承認者・管理者の権限管理
* RLSポリシーの設定
* ユーザー管理画面
* 承認者選択のDB連携
* コメント投稿者のユーザー紐付け
* 操作ログのユーザー紐付け
* 添付ファイル機能
* 通知機能
* ダッシュボードへのグラフ追加
* テスト追加
* Vercelへのデプロイ

## アピールポイント

このポートフォリオでは、単なる画面制作ではなく、社内申請業務を想定した業務アプリケーションとして、以下を実装しています。

* 業務フローを意識した申請・承認設計
* Supabaseを使ったDB保存・取得・更新
* React Hook Form + Zodによるフォーム設計
* 操作ログによる監査性の表現
* コメント履歴による対応経緯の可視化
* 検索・絞り込み・CSV出力を備えた管理画面UI

「社内業務の課題を理解し、Next.js / TypeScriptで実用的な管理画面・申請フローを実装できるWebアプリケーションエンジニア」として見せることを目的としています。
