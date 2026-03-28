import { motion, AnimatePresence } from "framer-motion";
import { X, AlertCircle } from "lucide-react";
import { Task, TaskStatus } from "./TaskItem";
import { useState, useEffect } from "react";

interface TaskFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Partial<Task>) => void;
  task?: Task | null;
}

const statusDisplay: Record<TaskStatus, { label: string, colorClass: string }> = {
  TODO: { label: "TODO", colorClass: "text-slate-600 dark:text-slate-300 bg-white dark:bg-[#1a1a1f]" },
  IN_PROGRESS: { label: "進行中", colorClass: "text-amber-600 dark:text-amber-400 bg-white dark:bg-[#1a1a1f]" },
  DONE: { label: "完了", colorClass: "text-emerald-600 dark:text-emerald-400 bg-white dark:bg-[#1a1a1f]" },
  FAILED: { label: "失敗", colorClass: "text-rose-600 dark:text-rose-400 bg-white dark:bg-[#1a1a1f]" },
};

export function TaskFormDialog({ isOpen, onClose, onSave, task }: TaskFormDialogProps) {
  const [title, setTitle] = useState("");
  const [memo, setMemo] = useState("");
  const [status, setStatus] = useState<TaskStatus>("TODO");
  const [failureReason, setFailureReason] = useState("");

  useEffect(() => {
    if (task) {
      setTitle(task.title || "");
      setMemo(task.memo || "");
      setStatus(task.status || "TODO");
      setFailureReason(task.failureReason || "");
    } else {
      setTitle("");
      setMemo("");
      setStatus("TODO");
      setFailureReason("");
    }
  }, [task, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSave({ 
      title: title.trim(), 
      memo: memo.trim(), 
      status,
      failureReason: status === "FAILED" ? failureReason.trim() : ""
    });
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
            className="fixed bottom-0 left-0 right-0 z-50 p-4 mx-auto max-w-md pb-12 rounded-t-[2rem] bg-white dark:bg-[#1a1a1f] shadow-2xl border-t border-slate-200 dark:border-white/10 overflow-y-auto max-h-[90vh]"
          >
            <div className="flex justify-between items-center mb-6 pl-2">
              <h2 className="text-xl font-bold">{task ? "タスクを編集" : "新規タスク"}</h2>
              <button 
                onClick={onClose}
                className="p-2 bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 rounded-full transition-colors"
                type="button"
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
                  placeholder="タスク名 (例: 朝9時起床)"
                  className="w-full text-2xl font-semibold bg-transparent border-none placeholder-slate-300 dark:placeholder-slate-700 focus:ring-0 px-0 outline-none"
                />
              </div>

              <div>
                <textarea
                  value={memo}
                  onChange={(e) => setMemo(e.target.value)}
                  placeholder="メモや詳細..."
                  rows={2}
                  className="w-full text-base bg-slate-50 dark:bg-[#0f0f11] border border-slate-200 dark:border-white/10 rounded-xl p-4 focus:ring-2 focus:ring-brand-500/50 outline-none transition-all resize-none"
                />
              </div>

              {task && (
                <div className="flex flex-col gap-2 relative">
                  <div className="flex bg-slate-100 dark:bg-[#0f0f11] p-1 rounded-xl">
                    {(Object.keys(statusDisplay) as TaskStatus[]).map(s => {
                      const isActive = status === s;
                      return (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setStatus(s)}
                          className={`flex-1 py-3 text-sm font-semibold rounded-lg transition-all ${
                            isActive 
                              ? statusDisplay[s].colorClass + ' shadow-sm'
                              : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                          }`}
                        >
                          {statusDisplay[s].label}
                        </button>
                      );
                    })}
                  </div>

                  {/* Failure Reason Field with Animation */}
                  <AnimatePresence>
                    {status === "FAILED" && (
                      <motion.div
                        initial={{ height: 0, opacity: 0, marginTop: 0 }}
                        animate={{ height: "auto", opacity: 1, marginTop: 12 }}
                        exit={{ height: 0, opacity: 0, marginTop: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="bg-rose-50 dark:bg-rose-950/20 rounded-xl p-4 border border-rose-200/60 dark:border-rose-900/40">
                          <label className="flex items-center text-sm font-bold text-rose-700 dark:text-rose-400 mb-2">
                            <AlertCircle size={16} className="mr-1.5" />
                            失敗した原因・振り返り
                          </label>
                          <textarea
                            value={failureReason}
                            onChange={(e) => setFailureReason(e.target.value)}
                            placeholder="例: アラームをかけ忘れて10時まで寝坊した..."
                            rows={3}
                            className="w-full text-sm bg-white dark:bg-[#0f0f11] border border-rose-100 dark:border-rose-900/50 rounded-lg p-3 focus:ring-1 focus:ring-rose-400 outline-none transition-all resize-none placeholder-rose-300 dark:placeholder-rose-800"
                          />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-4 mt-2 bg-brand-600 hover:bg-brand-700 active:bg-brand-800 text-white font-bold rounded-2xl shadow-lg shadow-brand-500/30 transition-all"
              >
                {task ? "保存する" : "追加する"}
              </button>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
