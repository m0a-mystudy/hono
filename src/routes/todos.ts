import { Hono } from 'hono';
import { todos } from '../db/schema';
import { eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/d1';

export interface Env {
  DB: D1Database;
}

const router = new Hono<{ Bindings: Env }>();

// データベース接続の確認
router.use('*', async (c, next) => {
  console.log('Database connection:', JSON.stringify(c.env.DB, null, 2));
  await next();
});

// 全てのTodoを取得
router.get('/', async (c) => {
  try {
    const db = drizzle(c.env.DB);
    const result = await db.select().from(todos);
    return c.json(result);
  } catch (error) {
    console.error('Error fetching todos:', error);
    return c.json(
      { 
        error: 'Failed to fetch todos', 
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      500
    );
  }
});

// 新しいTodoを作成
router.post('/', async (c) => {
  try {
    const body = await c.req.json();
    const db = drizzle(c.env.DB);
    
    const [newTodo] = await db
      .insert(todos)
      .values({
        title: body.title,
        completed: false,

      })
      .returning();
    
    return c.json(newTodo, 201);
  } catch (error) {
    console.error('Error creating todo:', error);
    return c.json({ 
      error: 'Failed to create todo',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

// Todoを更新
router.put('/:id', async (c) => {
  try {
    const id = Number(c.req.param('id'));
    const body = await c.req.json();
    const db = drizzle(c.env.DB);
    
    const [updatedTodo] = await db
      .update(todos)
      .set(body)
      .where(eq(todos.id, id))
      .returning();
    
    if (!updatedTodo) {
      return c.json({ message: 'Todo not found' }, 404);
    }
    
    return c.json(updatedTodo);
  } catch (error) {
    console.error('Error updating todo:', error);
    return c.json({ 
      error: 'Failed to update todo',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

// Todoを削除
router.delete('/:id', async (c) => {
  try {
    const id = Number(c.req.param('id'));
    const db = drizzle(c.env.DB);
    
    await db
      .delete(todos)
      .where(eq(todos.id, id));
    
    return c.json({ message: 'Deleted successfully' });
  } catch (error) {
    console.error('Error deleting todo:', error);
    return c.json({ 
      error: 'Failed to delete todo',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

export default router; 