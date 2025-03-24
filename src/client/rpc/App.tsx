import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { Todo } from '../../db/schema'

// APIのベースURL
const API_BASE = import.meta.env.DEV ? 'http://localhost:8787' : '';
const RPC_BASE = `${API_BASE}/rpc/todo`;

function TodoApp() {
  const [newTodo, setNewTodo] = useState('')
  const queryClient = useQueryClient()

  const { data: todos = [] } = useQuery<Todo[]>({
    queryKey: ['todos'],
    queryFn: async () => {
      const response = await fetch(`${RPC_BASE}/getAll`)
      const data = await response.json() as Todo[]
      return data
    }
  })

  const addTodoMutation = useMutation({
    mutationFn: async (title: string) => {
      const response = await fetch(`${RPC_BASE}/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title }),
      })
      const data = await response.json() as Todo
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] })
      setNewTodo('')
    }
  })

  const toggleTodoMutation = useMutation({
    mutationFn: async ({ id, completed }: { id: number, completed: boolean }) => {
      const response = await fetch(`${RPC_BASE}/update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, completed }),
      })
      const data = await response.json() as Todo
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] })
    }
  })

  const deleteTodoMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`${RPC_BASE}/delete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }),
      })
      const data = await response.json() as Todo
      return data
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