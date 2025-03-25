import { Hono } from 'hono'
import { eq } from 'drizzle-orm'
import { todos } from '../db/schema'
import { DrizzleD1Database } from 'drizzle-orm/d1'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'

type HonoEnv = {
  Bindings: {
    DB: D1Database
  },
  Variables: {
    db: DrizzleD1Database
  }
}

// RPCエンドポイント
const routes = new Hono<HonoEnv>()
  .get('/getAll', async (c) => {
    const result = await c.var.db.select().from(todos).all()
    return c.json(result, 200)
  })
  .post('/create', zValidator('json', z.object({
    title: z.string().min(1)
  })), async (c) => {
    const { title } = c.req.valid('json')
    const result = await c.var.db.insert(todos).values({ title }).returning().get()
    return c.json(result, 201)
  })
  .post('/update', zValidator('json', z.object({
    id: z.number(),
    completed: z.boolean()
  })), async (c) => {
    const { completed, id } = c.req.valid('json')
    const result = await c.var.db
      .update(todos)
      .set({ completed })
      .where(eq(todos.id, id))
      .returning()
      .get()
    return c.json(result, 200)
  })
  .post('/delete', zValidator('json', z.object({
    id: z.number()
  })), async (c) => {
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