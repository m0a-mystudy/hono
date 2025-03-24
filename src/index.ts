import { Hono } from 'hono';
import { logger } from 'hono/logger';
import { prettyJSON } from 'hono/pretty-json';
import { cors } from 'hono/cors';
import todos from './routes/todos';
import rpc from './routes/rpc';
import { drizzle } from 'drizzle-orm/d1';
import { todos as todosSchema } from './db/schema';

type Bindings = {
  ASSETS: {
    fetch: (request: Request) => Promise<Response>;
  };
  DB: D1Database;
};

type Variables = {
  db: ReturnType<typeof drizzle>;
};

const app = new Hono<{ Bindings: Bindings; Variables: Variables }>();

// ミドルウェアの設定
app.use('*', logger());
app.use('*', prettyJSON());
app.use('*', cors());

// データベースミドルウェア
app.use('*', async (c, next) => {
  c.set('db', drizzle(c.env.DB, { schema: { todos: todosSchema } }));
  await next();
});

// APIルーティング
app.route('/api/todos', todos);
app.route('/rpc/todo', rpc);

// 静的アセットの配信
app.get('*', async (c) => {
  const url = new URL(c.req.url);
  // APIリクエストはスキップ
  if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/rpc/')) {
    return c.notFound();
  }

  try {
    // 静的アセットを取得
    const response = await c.env.ASSETS.fetch(c.req.raw);
    if (response.status === 404) {
      // 404の場合はindex.htmlを返す（SPA用）
      return c.env.ASSETS.fetch(new Request(new URL('/', c.req.url).href, c.req.raw));
    }
    // Content-Typeヘッダーを設定
    const contentType = response.headers.get('Content-Type');
    if (contentType) {
      c.header('Content-Type', contentType);
    }
    return response;
  } catch (error) {
    console.error('Static asset error:', error);
    return c.notFound();
  }
});

// エラーハンドリング
app.onError((err, c) => {
  console.error(`${err}`);
  return c.json({ message: 'Internal Server Error' }, 500);
});

export default app; 