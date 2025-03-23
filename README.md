# Hono + Drizzle Todo API

HonoとDrizzle ORMを使用したTodo APIの実装例です。

## 必要要件

- Node.js (v16以上)
- npm (v7以上)

## セットアップ

1. リポジトリのクローン
```bash
git clone <repository-url>
cd <repository-name>
```

2. 依存パッケージのインストール
```bash
npm install
```

3. 環境構築
```bash
# TypeScriptの設定
npm init -y
npm install hono @hono/node-server drizzle-orm better-sqlite3
npm install -D typescript ts-node @types/better-sqlite3 drizzle-kit @types/node

# package.jsonにスクリプトを追加
{
  "scripts": {
    "dev": "ts-node src/index.ts",
    "build": "tsc",
    "generate": "drizzle-kit generate:sqlite",
    "start": "node dist/index.js"
  }
}
```

4. マイグレーションの実行
```bash
npm run generate
```

5. 開発サーバーの起動
```bash
npm run dev
```

## API エンドポイント

### GET /api/todos
全てのTodoを取得します。

```bash
curl http://localhost:3000/api/todos
```

### POST /api/todos
新しいTodoを作成します。

```bash
curl -X POST http://localhost:3000/api/todos \
  -H "Content-Type: application/json" \
  -d '{"title": "買い物をする"}'
```

### PUT /api/todos/:id
指定したIDのTodoを更新します。

```bash
curl -X PUT http://localhost:3000/api/todos/1 \
  -H "Content-Type: application/json" \
  -d '{"completed": true}'
```

### DELETE /api/todos/:id
指定したIDのTodoを削除します。

```bash
curl -X DELETE http://localhost:3000/api/todos/1
```

## プロジェクト構造 