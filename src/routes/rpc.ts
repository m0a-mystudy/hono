import { Hono } from 'hono'
import { eq } from 'drizzle-orm'
import { todos } from '../db/schema'
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

type Schema = {
  'json': { in: z.infer<typeof createTodoSchema | typeof updateTodoSchema | typeof deleteTodoSchema> }
}

const app = new Hono<HonoEnv, Schema>()

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

// RPCエンドポイント
app.get('/getAll', async (c) => {
  const result = await c.var.db.select().from(todos).all()
  return c.json(result)
})

app.post('/create', zValidator('json', createTodoSchema), async (c) => {
  const { title } = c.req.valid('json')
  const result = await c.var.db.insert(todos).values({ title }).returning().get()
  return c.json(result)
})

app.post('/update', zValidator('json', updateTodoSchema), async (c) => {
  const { id, completed } = c.req.valid('json')
  const result = await c.var.db
    .update(todos)
    .set({ completed })
    .where(eq(todos.id, id))
    .returning()
    .get()
  return c.json(result)
})

app.post('/delete', zValidator('json', deleteTodoSchema), async (c) => {
  const { id } = c.req.valid('json')
  const result = await c.var.db
    .delete(todos)
    .where(eq(todos.id, id))
    .returning()
    .get()
  return c.json(result)
})

export default app 