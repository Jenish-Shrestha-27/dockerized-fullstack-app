"use client";

import { useEffect, useState, useCallback } from "react";

interface Task {
  id: number;
  title: string;
  completed: boolean;
  createdAt: string;
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "completed">("all");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [backendStatus, setBackendStatus] = useState<"checking" | "connected" | "error">("checking");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Fetch tasks and verify backend health
  const fetchTasks = useCallback(async () => {
    try {
      setErrorMessage(null);
      const res = await fetch(`${API_BASE_URL}/tasks`, {
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
      });

      if (!res.ok) {
        throw new Error(`Server returned ${res.status}: ${res.statusText}`);
      }

      const data = await res.json();
      setTasks(Array.isArray(data) ? data : []);
      setBackendStatus("connected");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to connect to backend";
      setBackendStatus("error");
      setErrorMessage(`Cannot connect to backend (${API_BASE_URL}): ${msg}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Create Task
  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    const title = newTaskTitle.trim();
    if (!title) return;

    setSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await fetch(`${API_BASE_URL}/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, completed: false }),
      });

      if (!res.ok) {
        throw new Error(`Failed to create task (Status ${res.status})`);
      }

      const created: Task = await res.json();
      setTasks((prev) => [...prev, created]);
      setNewTaskTitle("");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error creating task";
      setErrorMessage(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // Toggle Complete (PATCH)
  const handleToggleTask = async (task: Task) => {
    const updatedStatus = !task.completed;

    // Optimistic UI update
    setTasks((prev) =>
      prev.map((t) => (t.id === task.id ? { ...t, completed: updatedStatus } : t))
    );

    try {
      const res = await fetch(`${API_BASE_URL}/tasks/${task.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: updatedStatus }),
      });

      if (!res.ok) {
        throw new Error(`Failed to update status (Status ${res.status})`);
      }

      const updated: Task = await res.json();
      setTasks((prev) => prev.map((t) => (t.id === task.id ? updated : t)));
    } catch (err: unknown) {
      // Rollback on error
      setTasks((prev) =>
        prev.map((t) => (t.id === task.id ? { ...t, completed: task.completed } : t))
      );
      const msg = err instanceof Error ? err.message : "Failed to update task";
      setErrorMessage(msg);
    }
  };

  // Save Title Edit (PATCH)
  const handleSaveEdit = async (id: number) => {
    const trimmed = editingTitle.trim();
    if (!trimmed) {
      setEditingTaskId(null);
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/tasks/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: trimmed }),
      });

      if (!res.ok) {
        throw new Error(`Failed to update title (Status ${res.status})`);
      }

      const updated: Task = await res.json();
      setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
      setEditingTaskId(null);
      setEditingTitle("");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to edit task";
      setErrorMessage(msg);
    }
  };

  // Delete Task (DELETE)
  const handleDeleteTask = async (id: number) => {
    // Optimistic UI update
    const previous = [...tasks];
    setTasks((prev) => prev.filter((t) => t.id !== id));

    try {
      const res = await fetch(`${API_BASE_URL}/tasks/${id}`, {
        method: "DELETE",
      });

      if (!res.ok && res.status !== 204) {
        throw new Error(`Failed to delete task (Status ${res.status})`);
      }
    } catch (err: unknown) {
      // Rollback
      setTasks(previous);
      const msg = err instanceof Error ? err.message : "Failed to delete task";
      setErrorMessage(msg);
    }
  };

  // Add sample DevOps tasks
  const handleAddSampleTasks = async () => {
    const samples = [
      "Configure Docker container for NestJS backend",
      "Setup PostgreSQL database migration scripts",
      "Connect Next.js frontend with REST API endpoints",
    ];

    setSubmitting(true);
    try {
      for (const title of samples) {
        const res = await fetch(`${API_BASE_URL}/tasks`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title, completed: false }),
        });
        if (res.ok) {
          const item = await res.json();
          setTasks((prev) => [...prev, item]);
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to add sample tasks";
      setErrorMessage(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // Filtering
  const filteredTasks = tasks.filter((t) => {
    if (filter === "active") return !t.completed;
    if (filter === "completed") return t.completed;
    return true;
  });

  const totalCount = tasks.length;
  const completedCount = tasks.filter((t) => t.completed).length;
  const activeCount = totalCount - completedCount;

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-slate-100 to-zinc-200 dark:from-zinc-950 dark:via-zinc-900 dark:to-neutral-950 text-zinc-900 dark:text-zinc-100 flex flex-col items-center py-12 px-4 sm:px-6">
      <main className="w-full max-w-2xl bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md rounded-2xl shadow-xl border border-zinc-200/80 dark:border-zinc-800 p-6 sm:p-8 flex flex-col gap-6">
        {/* Header */}
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-5 border-b border-zinc-200 dark:border-zinc-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">📋</span>
              <h1 className="text-2xl font-bold tracking-tight">Task Operations Center</h1>
            </div>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              Next.js Frontend &bull; NestJS REST Backend &bull; PostgreSQL
            </p>
          </div>

          {/* Backend Status Pill */}
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${
                backendStatus === "connected"
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800"
                  : backendStatus === "checking"
                  ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800"
                  : "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800"
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  backendStatus === "connected"
                    ? "bg-emerald-500 animate-pulse"
                    : backendStatus === "checking"
                    ? "bg-amber-500 animate-ping"
                    : "bg-rose-500"
                }`}
              />
              {backendStatus === "connected"
                ? "Backend Online"
                : backendStatus === "checking"
                ? "Connecting..."
                : "Offline"}
            </span>

            <button
              onClick={fetchTasks}
              title="Refresh connection & tasks"
              className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300 transition-colors text-xs"
            >
              🔄
            </button>
          </div>
        </header>

        {/* Error Notification */}
        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-sm flex items-start justify-between gap-3">
            <span>{errorMessage}</span>
            <button
              onClick={() => setErrorMessage(null)}
              className="font-semibold text-rose-500 hover:text-rose-700 dark:hover:text-rose-200"
            >
              ✕
            </button>
          </div>
        )}

        {/* Quick Metrics */}
        <section className="grid grid-cols-3 gap-3">
          <div className="bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/70 dark:border-zinc-700/60 rounded-xl p-3 text-center">
            <span className="block text-xs uppercase tracking-wider text-zinc-500 dark:text-zinc-400 font-semibold">
              Total
            </span>
            <span className="text-xl font-bold mt-0.5 block">{totalCount}</span>
          </div>
          <div className="bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200/70 dark:border-blue-900/50 rounded-xl p-3 text-center">
            <span className="block text-xs uppercase tracking-wider text-blue-600 dark:text-blue-400 font-semibold">
              Pending
            </span>
            <span className="text-xl font-bold mt-0.5 text-blue-700 dark:text-blue-300 block">
              {activeCount}
            </span>
          </div>
          <div className="bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200/70 dark:border-emerald-900/50 rounded-xl p-3 text-center">
            <span className="block text-xs uppercase tracking-wider text-emerald-600 dark:text-emerald-400 font-semibold">
              Completed
            </span>
            <span className="text-xl font-bold mt-0.5 text-emerald-700 dark:text-emerald-300 block">
              {completedCount}
            </span>
          </div>
        </section>

        {/* Create Task Form */}
        <form onSubmit={handleCreateTask} className="flex gap-2">
          <input
            type="text"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            placeholder="Add a new task (e.g. Implement Dockerfile)..."
            disabled={submitting || backendStatus === "error"}
            className="flex-1 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 disabled:opacity-50 transition-all shadow-sm"
          />
          <button
            type="submit"
            disabled={!newTaskTitle.trim() || submitting || backendStatus === "error"}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 dark:disabled:bg-blue-900 text-white rounded-xl text-sm font-medium transition-all shadow-sm flex items-center gap-1.5 shrink-0"
          >
            {submitting ? "Adding..." : "+ Add Task"}
          </button>
        </form>

        {/* Filter Tabs */}
        <div className="flex items-center justify-between pt-2">
          <div className="inline-flex rounded-xl bg-zinc-100 dark:bg-zinc-800 p-1 text-xs font-medium">
            {(["all", "active", "completed"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-3 py-1.5 rounded-lg capitalize transition-all ${
                  filter === tab
                    ? "bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm"
                    : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200"
                }`}
              >
                {tab}{" "}
                <span className="opacity-70 text-[10px]">
                  (
                  {tab === "all"
                    ? totalCount
                    : tab === "active"
                    ? activeCount
                    : completedCount}
                  )
                </span>
              </button>
            ))}
          </div>

          {tasks.length > 0 && (
            <span className="text-xs text-zinc-400">
              Showing {filteredTasks.length} task{filteredTasks.length === 1 ? "" : "s"}
            </span>
          )}
        </div>

        {/* Task List */}
        <section className="flex flex-col gap-2.5">
          {loading ? (
            <div className="py-12 text-center text-sm text-zinc-400 animate-pulse">
              Loading tasks from backend...
            </div>
          ) : filteredTasks.length === 0 ? (
            <div className="py-12 text-center border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl flex flex-col items-center gap-3">
              <span className="text-3xl">📝</span>
              <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                {filter === "all"
                  ? "No tasks found in the database yet."
                  : `No ${filter} tasks right now.`}
              </p>
              {tasks.length === 0 && backendStatus === "connected" && (
                <button
                  type="button"
                  onClick={handleAddSampleTasks}
                  disabled={submitting}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium"
                >
                  Generate starter DevOps tasks
                </button>
              )}
            </div>
          ) : (
            filteredTasks.map((task) => (
              <div
                key={task.id}
                className={`group flex items-center justify-between p-3.5 rounded-xl border transition-all ${
                  task.completed
                    ? "bg-zinc-50/60 dark:bg-zinc-900/40 border-zinc-200/50 dark:border-zinc-800/50 opacity-75"
                    : "bg-white dark:bg-zinc-800/90 border-zinc-200 dark:border-zinc-700/80 shadow-sm hover:border-zinc-300 dark:hover:border-zinc-600"
                }`}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0 pr-3">
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => handleToggleTask(task)}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-zinc-300 dark:border-zinc-600 cursor-pointer"
                  />

                  {editingTaskId === task.id ? (
                    <div className="flex items-center gap-2 flex-1">
                      <input
                        type="text"
                        value={editingTitle}
                        onChange={(e) => setEditingTitle(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleSaveEdit(task.id);
                          if (e.key === "Escape") setEditingTaskId(null);
                        }}
                        autoFocus
                        className="flex-1 text-sm bg-zinc-100 dark:bg-zinc-700 border border-blue-500 rounded px-2 py-1 focus:outline-none"
                      />
                      <button
                        onClick={() => handleSaveEdit(task.id)}
                        className="text-xs px-2.5 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingTaskId(null)}
                        className="text-xs px-2.5 py-1 text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col flex-1 min-w-0">
                      <span
                        onDoubleClick={() => {
                          setEditingTaskId(task.id);
                          setEditingTitle(task.title);
                        }}
                        className={`text-sm break-words select-none cursor-pointer ${
                          task.completed
                            ? "line-through text-zinc-400 dark:text-zinc-500"
                            : "text-zinc-800 dark:text-zinc-100 font-medium"
                        }`}
                      >
                        {task.title}
                      </span>
                      {task.createdAt && (
                        <span className="text-[11px] text-zinc-400 mt-0.5">
                          ID: #{task.id} &bull; Created{" "}
                          {new Date(task.createdAt).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {editingTaskId !== task.id && (
                  <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => {
                        setEditingTaskId(task.id);
                        setEditingTitle(task.title);
                      }}
                      title="Edit task"
                      className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-xs transition-colors"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      title="Delete task"
                      className="p-1.5 rounded-lg text-rose-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 text-xs transition-colors"
                    >
                      🗑️
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </section>

        {/* Footer info */}
        <footer className="text-center pt-2 text-xs text-zinc-400 dark:text-zinc-500 border-t border-zinc-200/60 dark:border-zinc-800/60">
          Double-click any task to edit &bull; Press Enter to save &bull; Connected to{" "}
          <code className="text-zinc-600 dark:text-zinc-400">{API_BASE_URL}</code>
        </footer>
      </main>
    </div>
  );
}
