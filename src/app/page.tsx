"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Plus } from "lucide-react";
import { CalendarStrip } from "@/components/CalendarStrip";
import { TaskList } from "@/components/TaskList";
import { TaskFormDialog } from "@/components/TaskFormDialog";
import { Task, TaskStatus } from "@/components/TaskItem";

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  // Dialog state
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  useEffect(() => {
    fetchTasks(selectedDate);
  }, [selectedDate]);

  const fetchTasks = async (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    const res = await fetch(`/api/tasks?date=${dateStr}`);
    if (res.ok) {
      const data = await res.json();
      setTasks(data.tasks);
    }
  };

  const handleSaveTask = async (taskData: Partial<Task>) => {
    if (editingTask) {
      // Edit
      const res = await fetch(`/api/tasks/${editingTask.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(taskData),
      });
      if (res.ok) fetchTasks(selectedDate);
    } else {
      // Create
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          ...taskData, 
          date: format(selectedDate, "yyyy-MM-dd"),
          order: tasks.length 
        }),
      });
      if (res.ok) fetchTasks(selectedDate);
    }
    setEditingTask(null);
  };

  const handleToggleStatus = async (task: Task) => {
    // Optimistic UI update
    const previousTasks = [...tasks];
    const nextStatus = task.status === "TODO" ? "IN_PROGRESS" : task.status === "IN_PROGRESS" ? "DONE" : "TODO";
    setTasks(tasks.map(t => t.id === task.id ? { ...t, status: nextStatus } : t));
    
    // API Call
    const res = await fetch(`/api/tasks/${task.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: nextStatus }),
    });
    
    // Revert if failed
    if (!res.ok) {
      setTasks(previousTasks);
    }
  };

  const handleDelete = async (id: string) => {
    const previousTasks = [...tasks];
    setTasks(tasks.filter(t => t.id !== id));
    
    const res = await fetch(`/api/tasks/${id}`, { method: "DELETE" });
    if (!res.ok) setTasks(previousTasks);
  };

  const handleReorder = async (newTasks: Task[]) => {
    setTasks(newTasks);
    // Persist all new orders at once sequentially (or a batch api if exists, but we'll do sequentially for now)
    await Promise.all(
       newTasks.map(task => 
          fetch(`/api/tasks/${task.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ order: task.order }),
          })
       )
    );
  };

  const openNewTask = () => {
    setEditingTask(null);
    setDialogOpen(true);
  };

  const openEditTask = (task: Task) => {
    setEditingTask(task);
    setDialogOpen(true);
  };

  return (
    <main className="flex flex-col h-[100dvh]">
      {/* Header Area */}
      <header className="pt-10 pb-4 px-6 relative z-20">
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-br from-brand-600 to-indigo-400 dark:from-brand-300 dark:to-indigo-200 bg-clip-text text-transparent">
          TaskFlow
        </h1>
        <p className="text-slate-500 font-medium text-sm mt-1">
          {format(selectedDate, "MMMM yyyy")}
        </p>
      </header>

      {/* Calendar Area */}
      <div className="z-10 mt-2 mb-4 shrink-0">
        <CalendarStrip selectedDate={selectedDate} onSelectDate={setSelectedDate} />
      </div>

      {/* Tasks Area */}
      <div className="flex-1 overflow-y-auto z-0">
        <TaskList 
          tasks={tasks}
          onReorder={handleReorder}
          onToggleStatus={handleToggleStatus}
          onDelete={handleDelete}
          onEdit={openEditTask}
        />
      </div>

      {/* Floating Action Button */}
      <button 
        onClick={openNewTask}
        className="absolute bottom-6 right-6 p-4 rounded-full bg-brand-600 text-white shadow-xl shadow-brand-500/40 hover:scale-110 active:scale-95 transition-all z-30 flex items-center justify-center"
      >
        <Plus size={32} strokeWidth={2.5} />
      </button>

      {/* Form Dialog */}
      <TaskFormDialog 
        isOpen={isDialogOpen}
        onClose={() => setDialogOpen(false)}
        onSave={handleSaveTask}
        task={editingTask}
      />
    </main>
  );
}
