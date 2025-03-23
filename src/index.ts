import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { logger } from 'hono/logger';
import { prettyJSON } from 'hono/pretty-json';
import todos from './routes/todos';

const app = new Hono();

// ミドルウェアの設定
app.use('*', logger());
app.use('*', prettyJSON());

// ルーティング
app.route('/api/todos', todos);

// サーバー起動
serve(app, () => {
  console.log('Server is running on http://localhost:3000');
}); 