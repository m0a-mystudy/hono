import { Hono } from 'hono';
import { db } from '../db';
import { todos } from '../db/schema';
import { eq } from 'drizzle-orm';

const router = new Hono();

// 全てのTodoを取得
router.get('/', async (c) => {
  const allTodos = await db
    .select()
    .from(todos)
    .orderBy(todos.createdAt);
  
  return c.json(allTodos);
});

// 新しいTodoを作成
router.post('/', async (c) => {
  const body = await c.req.json();
  
  const [newTodo] = await db
    .insert(todos)
    .values({
      title: body.title,
      completed: false,
    })
    .returning();
  
  return c.json(newTodo, 201);
});

// Todoを更新
router.put('/:id', async (c) => {
  const id = Number(c.req.param('id'));
  const body = await c.req.json();
  
  const [updatedTodo] = await db
    .update(todos)
    .set(body)
    .where(eq(todos.id, id))
    .returning();
  
  if (!updatedTodo) {
    return c.json({ message: 'Todo not found' }, 404);
  }
  
  return c.json(updatedTodo);
});

// Todoを削除
router.delete('/:id', async (c) => {
  const id = Number(c.req.param('id'));
  
  await db
    .delete(todos)
    .where(eq(todos.id, id));
  
  return c.json({ message: 'Deleted successfully' });
});

export default router; 