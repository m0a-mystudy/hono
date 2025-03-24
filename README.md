# Hono + React + D1 Todo App

HonoとDrizzleを使用して、Cloudflare D1上で動作するTodoアプリケーションを実装しました。
REST APIとHono RPCの2つの実装を含み、それぞれの特徴を比較できます。

以下から遊べます。(ユーザの概念なし)

https://hono-drizzle-todo.abe00makoto.workers.dev/

## 機能

- TODOの追加、完了/未完了の切り替え、削除
- REST APIとHono RPCの2つの実装方式
- タブによる実装方式の切り替え
- リアルタイムなデータ更新（React Query）

## 技術スタック

### フロントエンド
- [React](https://react.dev/) - UIライブラリ
- [Vite](https://vitejs.dev/) - ビルドツール
- [TanStack Query](https://tanstack.com/query/latest) - データフェッチング
- [TypeScript](https://www.typescriptlang.org/) - 型安全なJavaScript

### バックエンド
- [Hono](https://hono.dev/) - 高速なWebフレームワーク
- [Drizzle ORM](https://orm.drizzle.team/) - 型安全なORM
- [Cloudflare D1](https://developers.cloudflare.com/d1/) - SQLiteベースのデータベース
- [Cloudflare Workers](https://workers.cloudflare.com/) - エッジコンピューティングプラットフォーム

## 必要要件

- Node.js (v18以上推奨)
- npm (v7以上)
- Cloudflareアカウント

## プロジェクト構造

```
src/
├── client/           # フロントエンドのソースコード
│   ├── rest/         # REST API実装
│   ├── rpc/          # Hono RPC実装
│   ├── App.tsx       # メインアプリケーション（タブ切り替え）
│   └── main.tsx      # エントリーポイント
├── db/               # データベース関連
│   └── schema.ts     # Drizzle スキーマ定義
└── routes/           # バックエンドルート
    ├── api.ts        # REST APIエンドポイント
    └── rpc.ts        # RPCエンドポイント
```

## セットアップ

1. リポジトリのクローン
```bash
git clone https://github.com/m0a-mystudy/hono.git
cd hono
```

2. 依存パッケージのインストール
```bash
npm install
```

3. Cloudflare D1データベースの作成
```bash
npx wrangler d1 create todo-db
```

4. `wrangler.toml`の更新
作成したデータベースのIDを`wrangler.toml`の`database_id`フィールドに設定します。

5. マイグレーションの実行
```bash
npm run generate
npm run migration-remote
```

6. フロントエンドのビルド
```bash
npm run build:client
```

7. デプロイ
```bash
npm run deploy
```

## 開発

### フロントエンド開発
- `npm run dev:client` - フロントエンド開発サーバーの起動
- `npm run build:client` - フロントエンドのビルド

### バックエンド開発
- `npm run dev` - Honoサーバーの起動
- `npm run build` - プロジェクトのビルド

### データベース
- `npm run generate` - マイグレーションファイルの生成
- `npm run migrate` - マイグレーションの実行

## データベーススキーマ

```sql
CREATE TABLE todos (
  id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
  title TEXT NOT NULL,
  completed BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);
```

## APIエンドポイント

### REST API
- `GET /api/todos` - TODOリストの取得
- `POST /api/todos` - 新しいTODOの作成
- `PUT /api/todos/:id` - TODOの更新
- `DELETE /api/todos/:id` - TODOの削除

#### curlコマンド例（REST API）

```bash
# TODOリストの取得
curl http://localhost:8787/api/todos

# 新しいTODOの作成
curl -X POST http://localhost:8787/api/todos \
  -H "Content-Type: application/json" \
  -d '{"title": "新しいタスク"}'

# TODOの更新（完了状態の切り替え）
curl -X PUT http://localhost:8787/api/todos/1 \
  -H "Content-Type: application/json" \
  -d '{"completed": true}'

# TODOの削除
curl -X DELETE http://localhost:8787/api/todos/1
```

### Hono RPC
HonoのRPC機能を使用した型安全なAPI通信を実装しています。

#### エンドポイント
- `GET /rpc/todo/getAll` - TODOリストの取得
- `POST /rpc/todo/create` - 新しいTODOの作成
- `POST /rpc/todo/update` - TODOの更新
- `POST /rpc/todo/delete` - TODOの削除

#### curlコマンド例（Hono RPC）

```bash
# TODOリストの取得
curl http://localhost:8787/rpc/todo/getAll

# 新しいTODOの作成
curl -X POST http://localhost:8787/rpc/todo/create \
  -H "Content-Type: application/json" \
  -d '{"title": "新しいタスク"}'

# TODOの更新（完了状態の切り替え）
curl -X POST http://localhost:8787/rpc/todo/update \
  -H "Content-Type: application/json" \
  -d '{"id": 1, "completed": true}'

# TODOの削除
curl -X POST http://localhost:8787/rpc/todo/delete \
  -H "Content-Type: application/json" \
  -d '{"id": 1}'
```

#### 特徴
- エンドツーエンドの型安全性
- 自動補完サポート
- クライアント側での型推論
- 軽量なRPCクライアント

