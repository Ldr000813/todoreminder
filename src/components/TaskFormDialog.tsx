import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { Task, TaskStatus } from "./TaskItem";
import { useState, useEffect } from "react";

interface TaskFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Partial<Task>) => void;
  task?: Task | null;
}

export function TaskFormDialog({ isOpen, onClose, onSave, task }: TaskFormDialogProps) {
  const [title, setTitle] = useState("");
  const [memo, setMemo] = useState("");
  const [status, setStatus] = useState<TaskStatus>("TODO");

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setMemo(task.memo);
      setStatus(task.status);
    } else {
      setTitle("");
      setMemo("");
      setStatus("TODO");
    }
  }, [task, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSave({ title: title.trim(), memo: memo.trim(), status });
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 touch-none"
          />
          <motion.div
            initial={{ y: "100%", opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: "100%", opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 p-4 mx-auto max-w-md pb-12 rounded-t-[2rem] bg-white dark:bg-[#1a1a1f] shadow-2xl border-t border-slate-200 dark:border-white/10"
          >
            <div className="flex justify-between items-center mb-6 pl-2">
              <h2 className="text-xl font-bold">{task ? "Edit Task" : "New Task"}</h2>
              <button 
                onClick={onClose}
                className="p-2 bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-5 px-2">
              <div>
                <input
                  autoFocus
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Task title..."
                  className="w-full text-2xl font-semibold bg-transparent border-none placeholder-slate-300 dark:placeholder-slate-700 focus:ring-0 px-0 outline-none"
                />
              </div>

              <div>
                <textarea
                  value={memo}
                  onChange={(e) => setMemo(e.target.value)}
                  placeholder="Add details or context..."
                  rows={3}
                  className="w-full text-base bg-slate-50 dark:bg-[#0f0f11] border border-slate-200 dark:border-white/10 rounded-xl p-4 focus:ring-2 focus:ring-brand-500/50 outline-none transition-all resize-none"
                />
              </div>

              {task && (
                <div className="flex bg-slate-100 dark:bg-[#0f0f11] p-1 rounded-xl">
                  {(["TODO", "IN_PROGRESS", "DONE"] as TaskStatus[]).map(s => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setStatus(s)}
                      className={`flex-1 py-3 text-sm font-semibold rounded-lg transition-all ${
                        status === s 
                          ? "bg-white dark:bg-[#1a1a1f] shadow-sm text-brand-600 dark:text-brand-400" 
                          : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                      }`}
                    >
                      {s.replace("_", " ")}
                    </button>
                  ))}
                </div>
              )}

              <button
                type="submit"
                className="w-full py-4 mt-2 bg-brand-600 hover:bg-brand-700 active:bg-brand-800 text-white font-bold rounded-2xl shadow-lg shadow-brand-500/30 transition-all"
              >
                {task ? "Save Changes" : "Create Task"}
              </button>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
