import { useState } from 'react'
import RestApp from './rest/App'
import RpcApp from './rpc/App'

function App() {
  const [activeTab, setActiveTab] = useState<'rest' | 'rpc'>('rest')

  return (
    <div>
      <div style={{ marginBottom: '20px', textAlign: 'center' }}>
        <button 
          onClick={() => setActiveTab('rest')}
          style={{ 
            marginRight: '10px',
            padding: '8px 16px',
            backgroundColor: activeTab === 'rest' ? '#4CAF50' : '#f0f0f0',
            color: activeTab === 'rest' ? 'white' : 'black',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          REST API
        </button>
        <button 
          onClick={() => setActiveTab('rpc')}
          style={{ 
            padding: '8px 16px',
            backgroundColor: activeTab === 'rpc' ? '#4CAF50' : '#f0f0f0',
            color: activeTab === 'rpc' ? 'white' : 'black',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Hono RPC
        </button>
      </div>
      {activeTab === 'rest' ? <RestApp /> : <RpcApp />}
    </div>
  )
}

export default App 