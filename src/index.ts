import { Hono } from 'hono';
import { logger } from 'hono/logger';
import { prettyJSON } from 'hono/pretty-json';
import { cors } from 'hono/cors';
import todos from './routes/todos';
import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { appRouter } from './server/root';
import { createContext } from './server/trpc';
import { drizzle } from 'drizzle-orm/d1';
import { todos as todosSchema } from './db/schema';

type Bindings = {
  ASSETS: {
    fetch: (request: Request) => Promise<Response>;
  };
  DB: D1Database;
};

const app = new Hono<{ Bindings: Bindings }>();

// ミドルウェアの設定
app.use('*', logger());
app.use('*', prettyJSON());
app.use('*', cors());

// 既存のREST APIルーティング
app.route('/api/todos', todos);

// tRPCエンドポイントの設定
app.all('/trpc/*', async (c) => {
  const res = await fetchRequestHandler({
    endpoint: '/trpc',
    req: c.req.raw,
    router: appRouter,
    createContext: async () => ({
      db: drizzle(c.env.DB, { schema: { todos: todosSchema } }),
    }),
    onError: (error) => {
      console.error('tRPC Error:', error);
    },
  });
  return res;
});

// 静的ファイルの配信
app.use('*', async (c, next) => {
  const url = new URL(c.req.url);
  if (url.pathname === '/' || url.pathname.startsWith('/assets/')) {
    const request = new Request(c.req.url, {
      method: c.req.method,
      headers: c.req.header()
    });
    return c.env.ASSETS.fetch(request);
  }
  await next();
});

// エラーハンドリング
app.onError((err, c) => {
  console.error(`${err}`);
  return c.json({ message: 'Internal Server Error' }, 500);
});

export default app; 