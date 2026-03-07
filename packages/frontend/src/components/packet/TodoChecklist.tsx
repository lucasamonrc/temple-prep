import { useState } from "react";
import type { Todo } from "@/lib/types";
import { TODO_CATEGORIES } from "@/lib/constants";
import * as api from "@/lib/api";

interface Props {
  packetId: string;
  todos: Todo[];
  readOnly?: boolean;
}

export function TodoChecklist({
  packetId,
  todos: initialTodos,
  readOnly,
}: Props) {
  const [todos, setTodos] = useState(initialTodos);
  const completedCount = todos.filter((t) => t.completed).length;
  const totalCount = todos.length;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  async function handleToggle(todoId: number, completed: boolean) {
    setTodos((prev) =>
      prev.map((t) =>
        t.id === todoId
          ? {
              ...t,
              completed: completed ? 1 : 0,
              completed_at: completed ? new Date().toISOString() : null,
            }
          : t,
      ),
    );
    if (!readOnly) {
      await api.toggleTodo(packetId, todoId, completed);
    }
  }

  // Group by category
  const grouped = todos.reduce<Record<string, Todo[]>>((acc, todo) => {
    const cat = todo.category || "other";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(todo);
    return acc;
  }, {});

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-6 sm:p-8">
      <h2 className="text-2xl font-serif text-temple-blue mb-2">
        Preparation Checklist
      </h2>
      <p className="text-sm text-gray-500 mb-4">
        Track your progress as you prepare for your temple visit.
      </p>

      {/* Progress bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-sm mb-1">
          <span data-testid="todo-progress" className="text-gray-600">
            {completedCount} of {totalCount} complete
          </span>
          <span className="text-gray-400">{Math.round(progress)}%</span>
        </div>
        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-sage rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Grouped todos */}
      <div className="space-y-6">
        {Object.entries(grouped).map(([category, items]) => (
          <div key={category}>
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
              {TODO_CATEGORIES[category] || category}
            </h3>
            <div className="space-y-2">
              {items.map((todo) => (
                <label
                  key={todo.id}
                  data-testid={`todo-${todo.id}`}
                  className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                    todo.completed
                      ? "bg-sage-light/10 border-sage/20"
                      : "bg-gray-50 border-gray-100 hover:bg-gray-100"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={!!todo.completed}
                    onChange={(e) => handleToggle(todo.id, e.target.checked)}
                    disabled={readOnly}
                    className="w-5 h-5 mt-0.5 shrink-0 accent-sage rounded"
                  />
                  <div className="min-w-0">
                    <span
                      className={`text-sm ${
                        todo.completed
                          ? "line-through text-gray-400"
                          : "text-gray-700"
                      }`}
                    >
                      {todo.title}
                    </span>
                    {todo.description && (
                      <p className="text-xs text-gray-400 mt-0.5">
                        {todo.description}
                      </p>
                    )}
                  </div>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
