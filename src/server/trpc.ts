import { initTRPC } from '@trpc/server';
import { FetchCreateContextFnOptions } from '@trpc/server/adapters/fetch';
import { drizzle, DrizzleD1Database } from 'drizzle-orm/d1';
import { todos } from '../db/schema';

type Schema = {
  todos: typeof todos;
};

interface Context {
  db: DrizzleD1Database<Schema>;
}

interface Env {
  DB: D1Database;
}

export const createContext = async (opts: FetchCreateContextFnOptions & { env: Env }): Promise<Context> => {
  return {
    db: drizzle(opts.env.DB) as DrizzleD1Database<Schema>
  };
};

const t = initTRPC.context<Context>().create();

export const router = t.router;
export const publicProcedure = t.procedure; 