"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2 } from "lucide-react";
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
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);

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

  const handleDelete = (id: string) => {
    setTaskToDelete(id);
  };

  const executeDelete = async () => {
    if (!taskToDelete) return;
    const id = taskToDelete;
    setTaskToDelete(null);
    
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

      {/* Delete Confirmation Dialog */}
      <AnimatePresence>
        {taskToDelete && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setTaskToDelete(null)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 touch-none"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10, translateX: "-50%", translateY: "-50%" }}
              animate={{ opacity: 1, scale: 1, y: 0, translateX: "-50%", translateY: "-50%" }}
              exit={{ opacity: 0, scale: 0.95, y: 10, translateX: "-50%", translateY: "-50%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed top-1/2 left-1/2 z-50 w-[90%] max-w-sm bg-white dark:bg-[#1a1a1f] p-6 rounded-[2rem] shadow-2xl border border-slate-200 dark:border-white/10"
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-14 h-14 bg-rose-100 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 rounded-full flex items-center justify-center mb-5">
                  <Trash2 size={26} strokeWidth={2.5} />
                </div>
                <h3 className="text-xl font-extrabold text-slate-900 dark:text-slate-100 mb-2">タスクを削除しますか？</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm mb-7 font-medium leading-relaxed">
                  この操作は元に戻せません。<br/>本当に削除してもよろしいですか？
                </p>
                <div className="flex gap-3 w-full">
                  <button
                    onClick={() => setTaskToDelete(null)}
                    className="flex-1 py-3.5 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 font-bold rounded-2xl transition-colors"
                  >
                    キャンセル
                  </button>
                  <button
                    onClick={executeDelete}
                    className="flex-1 py-3.5 px-4 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white font-bold rounded-2xl shadow-lg shadow-rose-500/30 transition-all"
                  >
                    削除する
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </main>
  );
}
