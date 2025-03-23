# Hono + Drizzle + Cloudflare D1 Todo App

HonoとDrizzleを使用して、Cloudflare D1上で動作するTodoアプリケーションを実装しました。

## 技術スタック

### バックエンド
- [Hono](https://hono.dev/) - 高速なWebフレームワーク
- [Drizzle ORM](https://orm.drizzle.team/) - 型安全なORM
- [Cloudflare D1](https://developers.cloudflare.com/d1/) - SQLiteベースのデータベース
- [Cloudflare Workers](https://workers.cloudflare.com/) - エッジコンピューティングプラットフォーム

### フロントエンド
- [React](https://react.dev/) - UIライブラリ
- [Vite](https://vitejs.dev/) - ビルドツール
- [TanStack Query](https://tanstack.com/query/latest) - データフェッチング
- [TypeScript](https://www.typescriptlang.org/) - 型安全なJavaScript

## 必要要件

- Node.js (v18以上推奨)
- npm (v7以上)
- Cloudflareアカウント

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

### バックエンド開発
```bash
npm run dev
```

### フロントエンド開発
```bash
npm run dev:client
```

## プロジェクト構造

```
.
├── src/
│   ├── client/         # フロントエンドのソースコード
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   ├── db/
│   │   └── schema.ts   # データベーススキーマ定義
│   ├── routes/
│   │   └── todos.ts    # Todo関連のルートハンドラー
│   └── index.ts        # バックエンドのエントリーポイント
├── drizzle/            # マイグレーションファイル
├── package.json        # プロジェクト設定
├── tsconfig.json       # TypeScript設定
├── vite.config.ts      # Vite設定
└── wrangler.toml       # Cloudflare Workers設定
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

## API仕様

### 1. 全てのTodoを取得
```bash
GET /api/todos
```

### 2. 新しいTodoを作成
```bash
POST /api/todos
Content-Type: application/json

{
  "title": "新しいタスク"
}
```

### 3. Todoを更新
```bash
PUT /api/todos/:id
Content-Type: application/json

{
  "completed": true
}
```

### 4. Todoを削除
```bash
DELETE /api/todos/:id
```

