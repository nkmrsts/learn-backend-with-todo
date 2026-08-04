# 学習ロードマップ

## 目的
バックエンド領域で必要となる基礎知識を、実際に手を動かしながら体系的に学ぶことを目的とする。

SQL、DB設計、Docker、API実装、認証、デプロイまでを一連の流れとして経験することで、Webアプリケーションがどのように構成され、どの技術がどの役割を持っているのかを理解する。

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
| **エンティティ** | **項目** |
| --- | --- |
| TODO | タイトル、完了／未完了、期日（任意）、作成日時 |
| タグ | 名前 |
| TODO↔タグ | 多対多 |
| ユーザー | Supabase Authが管理（自前のusersテーブルは不要） |


## 学習フェーズ
### 1. DB設計

**目標：** ER図が書けて、正規化の判断ができる
**教材**
- 『達人に学ぶDB設計 徹底指南書』

**やること**
1. 本を一通り読む（正規化・外部キー・多対多の章は特に丁寧に）
2. TODOアプリ要件をもとにtodos / tags / todo_tagsのER図をdraw.ioなどで書く
   - [ER diagram](https://github.com/nkmrsts/learn-backend-with-todo/blob/main/docs/todo-er-diagram.drawio.svg)
3. 設計したER図をもとにPostgreSQLでテーブルを作る

### 2. SQL / PostgreSQL

**目標：** クエリが書けて、なぜそう書くか説明できる

**教材**
- SQLBolt
- PostgreSQL Tutorial

**やること**
1. SQLBoltを最初から最後まで一通りやる
2. ローカルにPostgreSQLをインストールして起動確認する
3. todos / tags / todo_tagsのテーブルを自分で作成する
4. INSERT / SELECT / JOIN / DELETEを実際に書いてCRUDを一通り体験する
5. N+1問題を意図的に再現し、EXPLAINコマンドで確認してJOINで解決する

### 3. NestJS

**目標：** PostgreSQLと繋がったREST APIを1本作れる
**Git管理：** この単元でtodo-app/リポジトリを作成し、backend/を追加する
**選定理由：** モジュール・DI・Decoratorといった構造が明示的で、バックエンドの設計パターンを学ぶのに適している

**教材**
- NestJS公式ドキュメント → First Stepsから順に読む
- Udemy『NestJS: The Complete Developer’s Guide』← 体系的に学びたい場合

**やること**
1. 公式のFirst Stepsを写経してHello Worldを動かす
2. TypeORM + ローカルPostgreSQLを接続してDBからデータが取れることを確認する
3. TODOアプリ要件をもとにtodos / tagsのCRUD APIをController / Service / Repositoryの構造で実装する
4. 絞り込み・並び替えのクエリパラメータに対応したエンドポイントを実装する
5. PostmanかcurlでエンドポイントをたたいてCRUDと絞り込み・並び替えが動くことを確認する

### 4. Docker

**目標：** NestJSアプリをDockerコンテナで動かせる
**Git管理：** backend/にDockerfileとdocker-compose.ymlを追加する

**教材**
- Docker公式 Get Started → イメージ・コンテナ・Volume・Networkの4概念をここで理解する
- Zennで「docker-compose 入門」で検索、記事1〜2本読む

**やること**
1. Docker公式ドキュメントでイメージ・コンテナ・Volume・Networkの概念を整理する
2. NestJSのDockerfileをゼロから書いてローカルでビルド・起動できることを確認する
3. docker-compose.ymlを書き、NestJSコンテナがローカルのPostgreSQLに接続できることを確認する

### 5. フロント実装（Vite + React）

**目標：** NestJS APIと繋がった画面が動く
**Git管理：** todo-app/にfrontend/を追加する
**位置づけ：** バックエンドの動作確認が主目的。フロントの作り込みよりAPIとの疎通確認を優先する

**やること**
1. TODOアプリ要件をもとにワイヤーフレームを作成する（Figmaまたは紙）
2. npm create vite@latestでReact + TypeScriptのプロジェクトを作成する
3. TanStack Queryを導入してNestJSのAPI（todos一覧取得）をfetchする
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
1. SupabaseプロジェクトをつくりDBをローカルからSupabaseに移行する（接続文字列・TypeORM設定・環境変数の切り替えを含む）
2. Supabase AuthでGitHubかGoogleのOAuthを設定する
3. フロントにsupabase-jsを導入してログイン・ログアウトを実装する
4. NestJS側でSupabaseが発行するJWTを検証するミドルウェアを追加する
5. 未ログイン状態でAPIを叩くと401が返ることを確認する
6. ログイン済みユーザーが自分のTODOのみ操作できることを確認する

### 7. デプロイ

**目標：** URLを叩けば誰でも使える状態にする
**Git管理：** デプロイ設定ファイル（fly.toml等）を追加する

| **役割** | **サービス** |
| --- | --- |
| フロント | Cloudflare Pages |
| バックエンド | Fly.io |
| DB / 認証 | Supabase |

**やること**
1. 環境変数を.envで管理し本番・開発で切り替えられるようにする
2. NestJSのDockerイメージをFly.ioにデプロイしてAPIが外から叩けることを確認する
3. ViteプロジェクトをビルドしてCloudflare Pagesにデプロイする
4. フロントからバックのAPIが本番環境で通信できることをブラウザで確認する
5. 全CRUDと認証が本番で動くことを確認して完了

# **全体の流れ**

1. DB設計
2. SQL / PostgreSQL
3. NestJS API ← todo-app/ リポジトリ作成
4. Docker（Dockerfile・docker-compose.yml追加）
5. Vite + React フロント（frontend/ 追加）
   - ワイヤーフレーム作成 → 実装
7. 認証（Supabase Auth）
   - DBをローカル→Supabaseに移行
8. デプロイ
   - Cloudflare Pages（フロント）
   - Fly.io（NestJS）
   - Supabase（DB + 認証）
