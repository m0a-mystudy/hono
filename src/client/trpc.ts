import { createTRPCReact } from '@trpc/react-query';
import { httpBatchLink } from '@trpc/client';
import type { AppRouter } from '../server/root';

export const trpc = createTRPCReact<AppRouter>();

export const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: 'http://localhost:8787/trpc',
      headers: () => {
        console.log('Setting headers for tRPC request');
        return {
          'Content-Type': 'application/json',
        };
      },
      fetch(url, options) {
        console.log('tRPC request:', { url, options });
        return fetch(url, options);
      },
    }),
  ],
}); 