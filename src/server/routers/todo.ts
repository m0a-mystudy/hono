import { z } from 'zod';
import { router, publicProcedure } from '../trpc';
import { eq } from 'drizzle-orm';
import { todos } from '../../db/schema';

export const todoRouter = router({
  getAll: publicProcedure.query(async ({ ctx }) => {
    const result = await ctx.db.select().from(todos);
    return result;
  }),

  create: publicProcedure
    .input(z.object({
      title: z.string(),
      completed: z.boolean().default(false),
    }))
    .mutation(async ({ ctx, input }) => {
      const result = await ctx.db.insert(todos).values({
        title: input.title,
        completed: input.completed,
      }).returning();
      return result[0];
    }),

  update: publicProcedure
    .input(z.object({
      id: z.number(),
      completed: z.boolean(),
    }))
    .mutation(async ({ ctx, input }) => {
      const result = await ctx.db
        .update(todos)
        .set({ completed: input.completed })
        .where(eq(todos.id, input.id))
        .returning();
      return result[0];
    }),

  delete: publicProcedure
    .input(z.object({
      id: z.number(),
    }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .delete(todos)
        .where(eq(todos.id, input.id));
      return { success: true };
    }),
}); 