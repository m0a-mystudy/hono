import { Hono } from 'hono'
import { eq } from 'drizzle-orm'
import { todos, type Todo } from '../db/schema'
import { DrizzleD1Database } from 'drizzle-orm/d1'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'

type Bindings = {
  DB: D1Database
}

type HonoEnv = {
  Bindings: Bindings
  Variables: {
    db: DrizzleD1Database
  }
}

// RPCのスキーマ定義
const createTodoSchema = z.object({
  title: z.string().min(1)
})

const updateTodoSchema = z.object({
  id: z.number(),
  completed: z.boolean()
})

const deleteTodoSchema = z.object({
  id: z.number()
})

const app = new Hono<HonoEnv>()
// RPCエンドポイント
const routes = app.get('/getAll', async (c) => {
  const result = await c.var.db.select().from(todos).all()
  return c.json(result, 200)
}).
post('/create', zValidator('json', createTodoSchema), async (c) => {
  const { title } = c.req.valid('json')
  const result = await c.var.db.insert(todos).values({ title }).returning().get()
  return c.json(result, 201)
})
.post('/update', zValidator('json', updateTodoSchema), async (c) => {
  const { id, completed } = c.req.valid('json')
  const result = await c.var.db
    .update(todos)
    .set({ completed })
    .where(eq(todos.id, id))
    .returning()
    .get()
  return c.json(result, 200)
})
.post('/delete', zValidator('json', deleteTodoSchema), async (c) => {
  const { id } = c.req.valid('json')
  const result = await c.var.db
    .delete(todos)
    .where(eq(todos.id, id))
    .returning()
    .get()
  return c.json(result, 200)
})


// クライアント生成用の型
export type AppType = typeof routes
export default routes 