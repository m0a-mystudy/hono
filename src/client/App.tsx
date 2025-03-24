import { useEffect, useState } from 'react'
import RestApp from './rest/App'
import TrpcApp from './trpc/App'
import { trpc, trpcClient } from './trpc'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 0,
      refetchOnMount: true,
      refetchOnReconnect: true,
      refetchOnWindowFocus: true,
    },
  },
})

function App() {
  const [client, setClient] = useState<'rest' | 'trpc'>('rest')

  useEffect(() => {
    const url = new URL(window.location.href)
    const clientParam = url.searchParams.get('client')
    if (clientParam === 'trpc') {
      setClient('trpc')
    }
  }, [])

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <div>
          <div style={{ marginBottom: '20px', textAlign: 'center' }}>
            <a 
              href="?client=rest" 
              style={{ 
                marginRight: '10px',
                color: client === 'rest' ? 'blue' : 'black'
              }}
            >
              REST API
            </a>
            <a 
              href="?client=trpc"
              style={{ 
                color: client === 'trpc' ? 'blue' : 'black'
              }}
            >
              tRPC
            </a>
          </div>
          {client === 'rest' ? <RestApp /> : <TrpcApp />}
        </div>
      </QueryClientProvider>
    </trpc.Provider>
  )
}

export default App 