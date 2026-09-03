## 目的

Honoを使って、PostgreSQLと接続したREST APIを実装する。

Hono固有の書き方だけを覚えるのではなく、HTTPリクエストを受け取り、データベースを操作し、HTTPレスポンスを返すまでの流れを実装を通して理解する。

学習はできるだけHono・Drizzleの公式ドキュメントや公式Exampleをベースに進める。公式に決まった構成がない部分については、このプロジェクトで採用するルールを明示する。

## 到達目標

Phase 3の完了時には、次のことができる状態を目指す。

- HonoでREST APIを実装できる
- Drizzleを使ってPostgreSQLを操作できる
- TODO / TagのCRUDをAPIとして実装できる
- ValidationとError Handlingの役割を理解して実装できる
- APIの基本的な自動テストを書ける
- Query Parameterを使った絞り込み・並び替えを実装できる
- Honoの推奨に沿ってRouteを整理できる
- RequestからDBアクセス、Responseまでの流れを説明できる

---

## 1. HTTPの概要を確認する

Honoを始める前に、Web APIで扱うHTTPの基本だけを短く確認する。

### 確認すること

- Request / Response
- GET / POST / PATCH / DELETE
- URL / Path
- Header
- Request Body
- Status Code

---

## 2. Honoの基本を学ぶ

Hono公式ドキュメントを見ながらNode.js環境を作成し、まずHonoを動かす。

### 見るもの

Hono公式ドキュメントの次の項目を中心に進める。

- Getting Started / Node.js
- Getting Started / Basic
- Routing
- Context
- HonoRequest
- Web Standards

### やること

公式のNode.js Getting Startedに従ってプロジェクトを作成し、Hello Worldを起動する。

その後、ドキュメントに掲載されているGET / POST、Path Parameter、Query Parameter、JSON Responseなどの基本的な例を自分の環境でも動かす。

---

## 3. DrizzleでPostgreSQLへ接続する

Phase 2で作成したローカルPostgreSQLへ、Drizzleから接続する。

### 見るもの

- Drizzle公式ドキュメント
  - PostgreSQLのセットアップ
  - Schema定義
  - Select / Insert / Update / Delete
  - Migration

### やること

まずDrizzleからPostgreSQLへ接続し、Phase 2で作成したテーブルからデータを1件または一覧で取得できることを確認する。

その後、Phase 2で作成したER図・テーブル設計と対応するDrizzleのSchemaを用意する。

---

## 4. 公式CRUD Exampleを参考にTODO / Tag CRUDを実装する

Hono公式ExamplesにあるCRUD APIを参考に、TODOアプリのAPIを実装する。

公式の `blog` Exampleでは、GET / POST / PUT / DELETEを使った基本的なCRUD APIを見ることができる。

### やること

TODOアプリの要件をもとに、必要なエンドポイントを決めながら実装する。

例えばTODOでは次のようなAPIを作る。

```
GET    /todos
GET    /todos/:id
POST   /todos
PATCH  /todos/:id
DELETE /todos/:id
```

Tagについても同様にCRUDを実装する。

TODOとTagの関連については、中間テーブル自体をCRUD APIとして公開するのではなく、

- TODOにTagを付ける
- TODOからTagを外す

というアプリ上必要な操作として実装する。

各エンドポイントはDrizzleを通してPostgreSQLを操作する。

---

### 4.2 実装 動作テスト

4で実装したAPIを叩いてTODOやタグを作成、編集、削除をしてみる

---

## 5. @hono/zod-openapi導入

Request / Response Schemaと型を定義

### 5.1 Error Handlingを追加する

エラー時のResponseも扱う。

### 見るもの

Hono公式ドキュメントの次の項目を確認する。

- HTTPException
- Error Handling / `app.onError()`

### やること

CRUDで実際に発生するケースを扱う。

```
存在しないTODOを取得する
→ 404 Not Found

存在しないTODOを更新・削除する
→ 404 Not Found

予期しないエラーが発生する
→ 500 Internal Server
```

といったResponseを実装する。

どの種類のエラーにどのResponseを返しているのかを理解する

## 6. Validationを追加する

CRUDでは正しい入力だけでなく、不正なRequestも受け取る可能性がある。

Hono公式Validation Guideを使ってValidationの仕組みを学び、TODO / Tag APIへ適用する。

### 見るもの

- Hono公式 Validation Guide
- Hono Validator
- Zod Validator

### 進め方

まずHono標準のValidatorがどのようにRequestを検証するか確認する。

その後、Zodを使ったSchema Validationへ進む。

例えばTODO作成では、

- `title`が存在する
- `title`が文字列である
- `dueDate`が指定された場合に正しい形式である

といった条件を定義する。

Validationを追加したら、

- 正しいRequestが成功する
- 不正なRequestが400系のResponseになる

ことをテストにも追加する。

ValidationとError Handlingは混同せず、

```
Validation
→ Requestの入力値を検証する

Error Handling
→ 処理中に発生したエラーを適切なResponseにする
```

という違いを意識する。

---

## 7. APIの自動テストを作る

CRUDと基本的なError Handlingが実装できた時点で、APIのテストを導入する。

テストを最後の確認作業にせず、以降のValidationや絞り込み・並び替えを追加するときにも使う。

### 見るもの

- Hono公式 Testing Guide
- 使用するテストランナーの基本的な使い方

### やること

Honoの `app.request()` を使ってRequestを送り、Responseを検証する。

まずは主要なCRUDについて、

- Status Code
- Response Body

が期待どおりになっていることを確認する。

Error Handlingについても、存在しないIDを指定した場合に404になることなどをテストする。

DBを含むテスト環境の高度な設計やMockについては、この段階では必要以上に広げない。まずローカル環境でAPIの振る舞いを自動確認できる状態を作る。

以降、新しい機能を追加したら対応するテストも追加する。

---

---

## 8. Hono Best Practicesに沿ってRouteを整理する

TODO / Tag CRUD、Error Handling、Validationまで実装した段階で、Hono公式Best Practicesを読む。

### 見るもの

- Hono公式 Best Practices

特に、大きくなったRouteを別ファイルへ分割して `app.route()` でまとめる方法を確認する。

### このプロジェクトで採用する構成

RouteをTODOとTag単位に分ける。

```
src/
├── index.ts
├── routes/
│   ├── todos.ts
│   └── tags.ts
└── db/
    ├── index.ts
    └── schema.ts
```

`app.route()` を使って、それぞれのRouteをメインのHonoアプリへ登録する。

```
index.ts
   ├── /todos → routes/todos.ts
   └── /tags  → routes/tags.ts
```

Hono公式が推奨しているのはRouteを分割して `app.route()` でまとめる考え方であり、`routes/` や `db/` というディレクトリ名まで公式で決められているわけではない。

このプロジェクトでは、

- HTTPのRoute → `routes/`
- Drizzleの接続・Schema → `db/`

というルールで整理する。

Controller / Service / Repositoryなどのレイヤーは、この規模では最初から追加しない。

---

## 9. 絞り込み・並び替えを実装する

TODO一覧APIへ、アプリ要件に必要なQuery Parameterを追加する。

例えば、

```
GET /todos?completed=false
GET /todos?tag_id=3
GET /todos?sort=due_date
```

などを扱う。

### 実装するもの

- 未完了のみ表示
- Tagによる絞り込み
- 期日順
- 作成日時順

HonoでQuery Parameterを取得し、ValidationしたうえでDrizzleのQueryへ反映する。

ここではPhase 2で学んだ、

- `WHERE`
- `JOIN`
- `ORDER BY`

が実際のAPI要件にどう対応するかを意識する。

実装後、それぞれの条件について自動テストも追加する。

---

## 10. API全体の動作を確認する

最後にcurlまたはPostmanを使い、実際のHTTPリクエストとしてAPI全体を確認する。

### 確認するもの

- TODO CRUD
- Tag CRUD
- TODOへのTag付与・解除
- Validation Error
- Not FoundなどのError Response
- Tagによる絞り込み
- 未完了フィルター
- 期日順／作成日時順の並び替え

自動テストが通ることに加えて、実際にHTTPクライアントからAPIを利用して期待どおりに動作することを確認する。

---

## Phase 3 完了条件

以下を満たしたらPhase 3を完了とする。

- Hono + Node.jsでAPIを起動できる
- DrizzleからローカルPostgreSQLへ接続できる
- TODO / TagのCRUDが動く
- TODOへのTagの付与・解除ができる
- Validationと基本的なError Handlingが実装されている
- APIの自動テストが通る
- 未完了・Tagによる絞り込みができる
- 期日順／作成日時順で並び替えられる
- HonoのBest Practicesに沿ってRouteが整理されている
- curlまたはPostmanからAPI全体の動作を確認できる
- RequestからPostgreSQL、PostgreSQLからResponseまでの処理の流れを説明できる

## 主な教材

### HTTP

- MDN Web Docs
  - Overview of HTTP
  - HTTP Request Methods
  - HTTP Response Status Codes

### Hono公式

- Getting Started / Node.js
- Getting Started / Basic
- Routing
- Context
- HonoRequest
- Web Standards
- CRUD Example
- HTTPException / Error Handling
- Testing
- Validation
- Best Practices

### Drizzle公式

- PostgreSQL
- Schema
- Select / Insert / Update / Delete
- Joins
- Migrations
