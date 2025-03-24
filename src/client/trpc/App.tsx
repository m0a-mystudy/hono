import { useState } from 'react'
import { trpc } from '../trpc'
import type { Todo } from '../../db/schema'

function TodoApp() {
  const [newTodo, setNewTodo] = useState('')
  const utils = trpc.useUtils();

  const { data: todos = [] } = trpc.todo.getAll.useQuery(undefined, {
    refetchOnWindowFocus: true,
  })

  const addTodoMutation = trpc.todo.create.useMutation({
    onSuccess: async () => {
      await utils.todo.getAll.invalidate()
      setNewTodo('')
    }
  })

  const toggleTodoMutation = trpc.todo.update.useMutation({
    onSuccess: async () => {
      await utils.todo.getAll.invalidate()
    }
  })

  const deleteTodoMutation = trpc.todo.delete.useMutation({
    onSuccess: async () => {
      await utils.todo.getAll.invalidate()
    }
  })

  return (
    <div className="todo-list">
      <h1>TODOリスト (tRPC)</h1>
      
      <form 
        className="todo-form"
        onSubmit={async (e) => {
          e.preventDefault()
          if (newTodo.trim()) {
            await addTodoMutation.mutateAsync({ title: newTodo })
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
        {todos.map((todo: Todo) => (
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
                await deleteTodoMutation.mutateAsync({ id: todo.id })
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