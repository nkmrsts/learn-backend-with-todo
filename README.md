# 学習ロードマップ

## 目的

バックエンド領域で必要となる基礎知識を、実際に手を動かしながら体系的に学ぶことを目的とする。

SQL、DB設計、API実装、認証、デプロイまでを一連の流れとして経験することで、Webアプリケーションがどのように構成され、どの技術がどの役割を持っているのかを理解する。

## ゴール

各単元で学習・実装した内容を段階的に組み合わせ、最終的にシンプルなTODOアプリを完成させる。

バックエンドを中心としたWebアプリケーション開発の一連の流れを、自分で説明・実装できる状態を目指す。

完成の基準は「デプロイ済みのURLで、ログイン・TODO作成・タグ絞り込み・削除がすべて動くこと」とする。

### **アプリ要件**

#### 機能：

- TODOのCRUD
- タグのCRUD
- タグによる絞り込み
- 並び替え（期日順／作成日時順）
- 表示フィルター(例: 未完了のみを絞り込める)
- 自分のTODOのみ操作可能

#### テーブル設計

| **エンティティ** | **項目**                                         |
| ---------------- | ------------------------------------------------ |
| TODO             | タイトル、完了／未完了、期日（任意）、作成日時   |
| タグ             | 名前                                             |
| TODO↔タグ        | 多対多                                           |
| ユーザー         | Supabase Authが管理（自前のusersテーブルは不要） |

## 学習フェーズ

### 1. DB設計 ☑

**目標：** ER図が書けて、正規化の判断ができる

**教材**

- 『達人に学ぶDB設計 徹底指南書』

**やること**

1. 本を一通り読む（正規化・外部キー・多対多の章は特に丁寧に）
2. TODOアプリ要件をもとにtodos / tags / todo_tagsのER図をdraw.ioなどで書く
   - [ER diagram](https://github.com/nkmrsts/learn-backend-with-todo/blob/main/docs/todo-er-diagram.drawio.svg)
3. 設計したER図をもとにPostgreSQLでテーブルを作る

### 2. SQL / PostgreSQL ☑

**目標：** クエリが書けて、なぜそう書くか理解できる

**教材**

- SQLBolt
- PostgreSQL Tutorial

**やること**

1. SQLBoltを最初から最後まで一通りやる
2. ローカルにPostgreSQLをインストールして起動確認する
3. todos / tags / todo_tagsのテーブルを自分で作成する
4. INSERT / SELECT / JOIN / DELETEを実際に書いてCRUDを一通り体験する
5. N+1問題を意図的に再現し、EXPLAINコマンドで確認してJOINで解決する

### 3. Hono + Drizzle

**目標：** HonoからPostgreSQLへ接続し、REST APIを実装する

**Git管理：** この単元で、backend/を追加する

**構成**

```text
Hono
  ↓
Drizzle ORM
  ↓
node-postgres
  ↓
PostgreSQL
```

**やること**

1. Hono公式Getting Started / Routing / Context / HonoRequest / Web Standards
2. Drizzle ORM + node-postgres (`pg`)を導入し、PostgreSQLに接続
3. todos / tags / todo_tagsのschemaを定義、Drizzle Kitでmigrationを作成・適用する
4. Hono公式CRUD Exampleを参考にTODO / Tag CRUD実装
5. Error Handling
6. Hono公式Validation Guide → Validation実装
7. 公式Testing Guideを参照 → Test作成
8. Hono Best Practices → `app.route()`でtodos / tagsを分割
9. 絞り込み・並び替え
10. curl / Postmanで全体確認

詳細なメモは/docs/phase3.mdに記載

### 4. Cloudflare Workers

**目標：** HonoアプリをCloudflare Workersで動かせる

**やること**

1. Cloudflare Workersの基本を確認する

- Cloudflare公式 Learning Paths「Workers concepts」

2. Wranglerを導入する
3. HonoアプリをWorkers環境でローカル実行する
4. 環境変数・Secretsの扱いを確認する
5. Cloudflare Workersへデプロイして外部からAPIを叩けることを確認する

### 5. フロント実装（Vite + React）

**目標：** Hono APIと繋がった画面が動く

**Git管理：** todo-app/にfrontend/を追加する

**位置づけ：** バックエンドの動作確認が主目的。フロントの作り込みよりAPIとの疎通確認を優先する

**やること**

1. TODOアプリ要件をもとにワイヤーフレームを作成する（Figmaまたは紙）
2. npm create vite@latestでReact + TypeScriptのプロジェクトを作成する
3. TanStack Queryを導入してHonoのAPI（todos一覧取得）をfetchする
4. ワイヤーフレームをもとにTODO一覧・作成・完了切り替え・削除を実装する
5. タグの追加・削除・絞り込みを実装する
6. 期日順／作成日時順の並び替えと未完了のみ表示フィルターを実装する

### 6. 認証

**目標：** ログイン済みユーザーのみ操作できる

**Git管理：** backend/とfrontend/両方に変更が入る。DBの接続先もこの単元でSupabaseに切り替える

**選定：Supabase Auth**

理由：

- SPA構成（Vite + React）との相性が良い
- DBもSupabaseに移行するタイミングと合わせることで管理が一元化できる

**やること**

1. SupabaseプロジェクトをつくりDBをローカルからSupabaseに移行する
2. Supabase AuthでGitHubかGoogleのOAuthを設定する
3. フロントにsupabase-jsを導入してログイン・ログアウトを実装する
4. Hono側でSupabaseが発行するJWTを検証するミドルウェアを追加する
5. 未ログイン状態でAPIを叩くと401が返ることを確認する
6. ログイン済みユーザーが自分のTODOのみ操作できることを確認する

### 7. デプロイ

**目標：** URLを叩けば誰でも使える状態にする

| 役割         | サービス                         |
| ------------ | -------------------------------- |
| フロント     | Cloudflare Workers Static Assets |
| バックエンド | Cloudflare Workers               |
| DB / 認証    | Supabase                         |

**やること**

1. 環境変数を本番・開発で切り替えられるようにする
2. Hono APIをCloudflare Workersにデプロイする
3. フロントをCloudflareにデプロイする
4. フロントからバックのAPIが本番環境で通信できることをブラウザで確認する
5. 全CRUDと認証が本番で動くことを確認して完了

# **全体の流れ**

1. DB設計
2. SQL / PostgreSQL
3. Hono API ← todo-app/ リポジトリ作成
4. Cloudflare Workers
5. Vite + React フロント（frontend/ 追加）
   - ワイヤーフレーム作成 → 実装
6. 認証（Supabase Auth）
   - DBをローカル→Supabaseに移行
7. デプロイ
   - Cloudflare Workers Static Assets（React）
   - Cloudflare Workers（Hono）
   - Supabase（DB + 認証）
