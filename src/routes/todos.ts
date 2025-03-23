import { Hono } from 'hono';
import { todos } from '../db/schema';
import { eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/d1';

export interface Env {
  DB: D1Database;
}

const router = new Hono<{ Bindings: Env }>();

// 全てのTodoを取得
router.get('/', async (c) => {
  try {
    console.log('Database connection:', c.env.DB);
    const db = drizzle(c.env.DB);
    console.log('Database instance created');
    const allTodos = await db
      .select()
      .from(todos)
      .orderBy(todos.createdAt);
    
    return c.json(allTodos);
  } catch (error) {
    console.error('Error fetching todos:', error);
    return c.json({ 
      error: 'Failed to fetch todos',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
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