# Hono + Drizzle + Cloudflare D1 Todo API

HonoとDrizzleを使用して、Cloudflare D1上で動作するTodo APIを実装しました。

## 技術スタック

- [Hono](https://hono.dev/) - 高速なWebフレームワーク
- [Drizzle ORM](https://orm.drizzle.team/) - 型安全なORM
- [Cloudflare D1](https://developers.cloudflare.com/d1/) - SQLiteベースのデータベース
- [TypeScript](https://www.typescriptlang.org/) - 型安全なJavaScript

## 必要要件

- Node.js (v16以上)
- npm (v7以上)
- Cloudflareアカウント

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

3. Cloudflare D1データベースの作成
```bash
npx wrangler d1 create todo-db
```

4. マイグレーションの実行
```bash
npm run generate
npx wrangler d1 migrations apply todo-db
```

5. 開発サーバーの起動
```bash
npm run dev
```

6. デプロイ
```bash
npm run deploy
```

## APIの使用方法

### 1. 全てのTodoを取得
```bash
curl https://hono-drizzle-todo.abe00makoto.workers.dev/api/todos
```

### 2. 新しいTodoを作成
```bash
curl -X POST https://hono-drizzle-todo.abe00makoto.workers.dev/api/todos \
  -H "Content-Type: application/json" \
  -d '{"title": "新しいタスク"}'
```

### 3. Todoを更新
```bash
curl -X PUT https://hono-drizzle-todo.abe00makoto.workers.dev/api/todos/1 \
  -H "Content-Type: application/json" \
  -d '{"completed": true}'
```

### 4. Todoを削除
```bash
curl -X DELETE https://hono-drizzle-todo.abe00makoto.workers.dev/api/todos/1
```

## データベーススキーマ

```sql
CREATE TABLE todos (
  id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
  title TEXT NOT NULL,
  completed BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);
```

## プロジェクト構造

```
.
├── src/
│   ├── db/
│   │   └── schema.ts    # データベーススキーマ定義
│   │   └── index.ts     # アプリケーションのエントリーポイント
│   ├── routes/
│   │   └── todos.ts     # Todo関連のルートハンドラー
│   └── index.ts         # アプリケーションのエントリーポイント
├── drizzle/             # マイグレーションファイル
├── package.json         # プロジェクト設定
├── tsconfig.json        # TypeScript設定
└── wrangler.toml        # Cloudflare Workers設定
```

