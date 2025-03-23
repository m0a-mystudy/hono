# Hono + TypeScript + SQLiteによるWebAPI実装ガイド

## 目次
1. [プロジェクト概要](#1-プロジェクト概要)
2. [SQLiteライブラリの比較](#2-sqliteライブラリの比較)
3. [実装パターン](#3-実装パターン)
4. [推奨構成](#4-推奨構成)
5. [サンプル実装](#5-サンプル実装)

## 1. プロジェクト概要

### 使用技術
- Hono: 軽量なWebフレームワーク
- TypeScript: 型安全な開発環境
- SQLite: 組み込みデータベース

### 基本構成 

```
src/
├── index.ts # メインアプリケーション
├── db/
│ └── db.ts # データベース接続とスキーマ定義
├── models/
│ └── todo.ts # モデルの型定義
└── routes/
└── todos.ts # ルーティング
```



## 2. SQLiteライブラリの比較

### 主要なライブラリ比較表

| ライブラリ | 型安全性 | 学習コスト | パフォーマンス | 機能の豊富さ | ファイルサイズ |
|------------|----------|------------|----------------|--------------|----------------|
| better-sqlite3 | 中 | 低 | 高 | 低 | 小 |
| Prisma | 高 | 中 | 中 | 高 | 大 |
| Drizzle | 高 | 低 | 高 | 中 | 小 |
| Kysely | 高 | 中 | 高 | 中 | 小 |
| TypeORM | 中 | 高 | 中 | 高 | 中 |

### ライブラリ詳細

#### better-sqlite3
- 同期的なAPI
- 高速なパフォーマンス
- シンプルなAPI設計
- C++ネイティブバインディング

```typescript
import Database from 'better-sqlite3';
const db = new Database('database.db');

const insert = db.prepare('INSERT INTO users (name) VALUES (?)');
const result = insert.run('田中');
```

#### Prisma
- スキーマファースト開発
- 強力な型生成
- マイグレーション管理機能

```typescript
// schema.prisma
model Todo {
  id        Int      @id @default(autoincrement())
  title     String
  completed Boolean  @default(false)
}

// 使用例
const todo = await prisma.todo.create({
  data: {
    title: '買い物',
    completed: false,
  },
})
```

#### Drizzle
- TypeScriptファースト
- 軽量設計
- SQLライクな構文

```typescript
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const todos = sqliteTable('todos', {
  id: integer('id').primaryKey(),
  title: text('title').notNull(),
  completed: integer('completed').notNull().default(false),
});
```

## 3. 実装パターン

### 型安全な実装パターン

```typescript
// db/utils.ts
export function createTypedStatement<TParams, TResult>(
  db: Database,
  sql: string
) {
  const stmt = db.prepare(sql);
  return {
    get: (params: TParams) => stmt.get(params) as TResult | undefined,
    all: (params?: TParams) => stmt.all(params) as TResult[],
    run: (params: TParams) => stmt.run(params)
  };
}

// 使用例
const todoQueries = {
  findById: createTypedStatement<{ id: number }, Todo>(
    db,
    'SELECT * FROM todos WHERE id = @id'
  )
};
```

## 4. 推奨構成

### 小規模プロジェクト向け
- **ライブラリ**: better-sqlite3 または Drizzle
- **理由**: 
  - 学習コストが低い
  - セットアップが簡単
  - 十分なパフォーマンス

### 中〜大規模プロジェクト向け
- **ライブラリ**: Prisma
- **理由**:
  - 強力な型安全性
  - スキーマ管理が容易
  - 豊富な機能セット
  - 優れた開発者体験

### SQLに精通したチーム向け
- **ライブラリ**: Kysely
- **理由**:
  - SQLライクな構文
  - 型安全性の確保
  - クエリの柔軟性

## 5. サンプル実装

### プロジェクトのセットアップ

```bash
npm init -y
npm install hono @hono/node-server better-sqlite3
npm install @types/better-sqlite3 typescript ts-node -D
```

### データベースのセットアップ

```typescript
// src/db/db.ts
import Database from 'better-sqlite3';

const db = new Database('todo.db');

db.exec(`
  CREATE TABLE IF NOT EXISTS todos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

export default db;
```

### モデルの定義

```typescript
// src/models/todo.ts
export interface Todo {
  id: number;
  title: string;
  completed: boolean;
  created_at: string;
}

export type CreateTodoInput = Omit<Todo, 'id' | 'created_at'>;
```

### ルーティングの実装

```typescript
// src/routes/todos.ts
import { Hono } from 'hono';
import { Todo, CreateTodoInput } from '../models/todo';
import db from '../db/db';

const todos = new Hono();

todos.get('/', (c) => {
  const todos = db.prepare('SELECT * FROM todos ORDER BY created_at DESC').all();
  return c.json(todos);
});

todos.post('/', async (c) => {
  const body = await c.req.json<CreateTodoInput>();
  const result = db
    .prepare('INSERT INTO todos (title, completed) VALUES (?, ?)')
    .run(body.title, body.completed);
  
  const newTodo = db
    .prepare('SELECT * FROM todos WHERE id = ?')
    .get(result.lastInsertRowid);
  
  return c.json(newTodo, 201);
});

todos.put('/:id', async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json<Partial<CreateTodoInput>>();
  
  db.prepare('UPDATE todos SET title = ?, completed = ? WHERE id = ?')
    .run(body.title, body.completed, id);
  
  const updatedTodo = db
    .prepare('SELECT * FROM todos WHERE id = ?')
    .get(id);
  
  return c.json(updatedTodo);
});

todos.delete('/:id', (c) => {
  const id = c.req.param('id');
  db.prepare('DELETE FROM todos WHERE id = ?').run(id);
  return c.json({ message: 'Deleted successfully' }, 200);
});

export default todos;
```

### メインアプリケーション

```typescript
// src/index.ts
import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { logger } from 'hono/logger';
import todos from './routes/todos';

const app = new Hono();

app.use('*', logger());
app.route('/api/todos', todos);

serve(app, () => {
  console.log('Server is running on http://localhost:3000');
});
```

### APIエンドポイント

- `GET /api/todos`: 全てのTodoを取得
- `POST /api/todos`: 新しいTodoを作成
- `PUT /api/todos/:id`: 既存のTodoを更新
- `DELETE /api/todos/:id`: Todoを削除

## 実装時の注意点

1. **エラーハンドリング**
   - データベース操作のエラーを適切に捕捉
   - クライアントへの適切なエラーレスポンス

2. **バリデーション**
   - 入力データの検証
   - 適切なステータスコードの返却

3. **パフォーマンス**
   - プリペアドステートメントの活用
   - 適切なインデックス設計

4. **セキュリティ**
   - SQLインジェクション対策
   - 適切なアクセス制御

## まとめ

Hono + TypeScript + SQLiteの組み合わせは、軽量で高速なWebAPIの実装に適しています。プロジェクトの規模や要件に応じて適切なSQLiteライブラリを選択することで、効率的な開発が可能です。

特に、小規模プロジェクトではDrizzleやbetter-sqlite3、大規模プロジェクトではPrismaの使用を推奨します。型安全性を重視する場合は、PrismaやKyselyが良い選択肢となります。