import { Hono } from 'hono';
import { logger } from 'hono/logger';
import { prettyJSON } from 'hono/pretty-json';
import todos from './routes/todos';

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

// ルーティング
app.route('/api/todos', todos);

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