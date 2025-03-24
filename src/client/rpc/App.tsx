import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { Todo } from '../../db/schema'
import { hc } from 'hono/client'
import type { AppType } from '../../routes/rpc'

// APIのベースURL
const API_BASE = import.meta.env.DEV ? 'http://localhost:8787' : '';

// RPCクライアントの生成
const client = hc<AppType>(`${API_BASE}/rpc/todo`)

function TodoApp() {
  const [newTodo, setNewTodo] = useState('')
  const queryClient = useQueryClient()

  const { data: todos = [] } = useQuery<Todo[]>({
    queryKey: ['todos'],
    queryFn: async () => {
      const response = await client.getAll.$get()
      return response.json()
    }
  })

  const addTodoMutation = useMutation({
    mutationFn: async (title: string) => {
      const response = await client.create.$post({
        json: { title }
      })
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] })
      setNewTodo('')
    }
  })

  const toggleTodoMutation = useMutation({
    mutationFn: async ({ id, completed }: { id: number, completed: boolean }) => {
      const response = await client.update.$post({
        json: { id, completed }
      })
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] })
    }
  })

  const deleteTodoMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await client.delete.$post({
        json: { id }
      })
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] })
    }
  })

  return (
    <div className="todo-list">
      <h1>TODOリスト (Hono RPC)</h1>
      
      <form 
        className="todo-form"
        onSubmit={async (e) => {
          e.preventDefault()
          if (newTodo.trim()) {
            await addTodoMutation.mutateAsync(newTodo)
          }
        }}
      >
        <input
          type="text"
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          placeholder="新しいTODOを入力"
        />
        <button type="submit">追加</button>
      </form>

      <div className="todo-items">
        {todos.map((todo) => (
          <div key={todo.id} className="todo-item">
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={async () => {
                await toggleTodoMutation.mutateAsync({
                  id: todo.id,
                  completed: !todo.completed
                })
              }}
            />
            <span className={todo.completed ? 'completed' : ''}>
              {todo.title}
            </span>
            <button 
              onClick={async () => {
                await deleteTodoMutation.mutateAsync(todo.id)
              }}
              className="delete"
            >
              削除
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

export default TodoApp 