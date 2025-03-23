import { drizzle } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import Database from 'better-sqlite3';
import { todos } from './schema';

// データベース接続の設定
const sqlite = new Database('todo.db');
export const db = drizzle(sqlite);

// マイグレーション実行（開発環境向け）
migrate(db, { migrationsFolder: './drizzle' }); 