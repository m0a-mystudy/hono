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

// Cloudflare Workers用のエクスポート
export default app; 