import { useState } from 'react'
import { QueryClient, QueryClientProvider, useMutation, useQuery } from '@tanstack/react-query'
import type { Todo } from '../db/schema'

const queryClient = new QueryClient()

function TodoApp() {
  const [newTodo, setNewTodo] = useState('')

  const { data: todos = [] } = useQuery<Todo[]>({
    queryKey: ['todos'],
    queryFn: async () => {
      const response = await fetch('/api/todos')
      return response.json()
    }
  })

  const addTodoMutation = useMutation({
    mutationFn: async (title: string) => {
      await fetch('/api/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title })
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] })
      setNewTodo('')
    }
  })

  const toggleTodoMutation = useMutation({
    mutationFn: async ({ id, completed }: { id: number; completed: boolean }) => {
      await fetch(`/api/todos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed })
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] })
    }
  })

  const deleteTodoMutation = useMutation({
    mutationFn: async (id: number) => {
      await fetch(`/api/todos/${id}`, {
        method: 'DELETE'
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] })
    }
  })

  return (
    <div className="todo-list">
      <h1>TODOリスト</h1>
      
      <form 
        className="todo-form"
        onSubmit={(e) => {
          e.preventDefault()
          if (newTodo.trim()) {
            addTodoMutation.mutate(newTodo)
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
              onChange={() => 
                toggleTodoMutation.mutate({
                  id: todo.id,
                  completed: !todo.completed
                })
              }
            />
            <span className={todo.completed ? 'completed' : ''}>
              {todo.title}
            </span>
            <button 
              onClick={() => deleteTodoMutation.mutate(todo.id)}
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

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TodoApp />
    </QueryClientProvider>
  )
}

export default App 