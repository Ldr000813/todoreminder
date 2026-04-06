import { motion, AnimatePresence } from "framer-motion";
import { X, AlertCircle } from "lucide-react";
import { Task, TaskStatus } from "./TaskItem";
import { useState, useEffect } from "react";
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, addMonths } from "date-fns";

interface TaskFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Partial<Task>, selectedDates?: string[]) => void;
  onBulkDelete?: (bulkId: string) => void;
  task?: Task | null;
  currentDate?: Date;
}

const statusDisplay: Record<TaskStatus, { label: string, colorClass: string }> = {
  TODO: { label: "TODO", colorClass: "text-slate-600 dark:text-slate-300 bg-white dark:bg-[#1a1a1f]" },
  IN_PROGRESS: { label: "進行中", colorClass: "text-amber-600 dark:text-amber-400 bg-white dark:bg-[#1a1a1f]" },
  DONE: { label: "完了", colorClass: "text-emerald-600 dark:text-emerald-400 bg-white dark:bg-[#1a1a1f]" },
  FAILED: { label: "失敗", colorClass: "text-rose-600 dark:text-rose-400 bg-white dark:bg-[#1a1a1f]" },
};

export function TaskFormDialog({ isOpen, onClose, onSave, onBulkDelete, task, currentDate = new Date() }: TaskFormDialogProps) {
  const [title, setTitle] = useState("");
  const [memo, setMemo] = useState("");
  const [status, setStatus] = useState<TaskStatus>("TODO");
  const [failureReason, setFailureReason] = useState("");
  const [taskDate, setTaskDate] = useState("");
  const [formMode, setFormMode] = useState<"single" | "bulk" | "delete">("single");
  const [selectedDates, setSelectedDates] = useState<string[]>([]);
  const [bulkGroups, setBulkGroups] = useState<{bulkId: string, title: string, count: number, dates: string[]}[]>([]);

  useEffect(() => {
    if (formMode === "delete") {
      fetch("/api/tasks")
        .then(res => res.json())
        .then(data => {
          if (data.tasks) {
            const groups: Record<string, { title: string, count: number, dates: string[] }> = {};
            data.tasks.forEach((t: Task) => {
              if (t.bulkId) {
                if (!groups[t.bulkId]) {
                   groups[t.bulkId] = { title: t.title, count: 0, dates: [] };
                }
                groups[t.bulkId].count++;
                groups[t.bulkId].dates.push(t.date);
              }
            });
            const validGroups = Object.keys(groups)
              .filter(bulkId => groups[bulkId].count >= 2)
              .map(bulkId => ({ bulkId, ...groups[bulkId] }));
            setBulkGroups(validGroups);
          }
        });
    }
  }, [formMode, isOpen]);

  useEffect(() => {
    if (task) {
      setTitle(task.title || "");
      setMemo(task.memo || "");
      setStatus(task.status || "TODO");
      setFailureReason(task.failureReason || "");
      setTaskDate(task.date || format(currentDate, "yyyy-MM-dd"));
      setFormMode("single");
      setSelectedDates([]);
    } else {
      setTitle("");
      setMemo("");
      setStatus("TODO");
      setFailureReason("");
      const defaultDate = format(currentDate, "yyyy-MM-dd");
      setTaskDate(defaultDate);
      if(formMode !== "delete") setFormMode("single");
      setSelectedDates([]);
    }
  }, [task, isOpen, currentDate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (formMode === "bulk" && !task) {
      if (selectedDates.length === 0) return;
      onSave({ 
        title: title.trim(), 
        memo: memo.trim(), 
        status,
        failureReason: status === "FAILED" ? failureReason.trim() : ""
      }, selectedDates);
    } else if (formMode === "single" || task) {
      onSave({ 
        title: title.trim(), 
        memo: memo.trim(), 
        status,
        date: taskDate,
        failureReason: status === "FAILED" ? failureReason.trim() : ""
      });
    }
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

            <div className="flex flex-col gap-5 px-2">
              {!task ? (
                <div className="flex bg-slate-100 dark:bg-[#0f0f11] p-1 rounded-xl mb-1">
                  <button
                    type="button"
                    onClick={() => setFormMode("single")}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${formMode === "single" ? "bg-white dark:bg-[#1a1a1f] shadow-sm text-brand-600 dark:text-brand-400" : "text-slate-500 hover:text-slate-700"}`}
                  >
                    単一登録
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormMode("bulk")}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${formMode === "bulk" ? "bg-white dark:bg-[#1a1a1f] shadow-sm text-brand-600 dark:text-brand-400" : "text-slate-500 hover:text-slate-700"}`}
                  >
                    一括登録
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormMode("delete")}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${formMode === "delete" ? "bg-rose-500 shadow-sm text-white dark:text-white" : "text-slate-500 hover:text-rose-500"}`}
                  >
                    一括削除
                  </button>
                </div>
              ) : null}

              {formMode === "delete" && !task ? (
                <div className="flex flex-col gap-3 max-h-[50vh] overflow-y-auto pr-2 pb-6 custom-scrollbar">
                  {bulkGroups.length === 0 ? (
                    <p className="text-center text-sm text-slate-500 my-8">
                      削除可能な一括登録タスクはありません<br/>
                      <span className="text-xs opacity-80">(同じIDのタスクが2つ以上必要です)</span>
                    </p>
                  ) : (
                    bulkGroups.map(bg => (
                      <div key={bg.bulkId} className="flex justify-between items-center p-4 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl">
                        <div className="flex-1 min-w-0 pr-3">
                          <h4 className="font-bold text-sm text-slate-800 dark:text-slate-100 truncate">{bg.title}</h4>
                          <p className="text-xs text-slate-500 mt-1">{bg.count}件のタスク ( {bg.dates.slice(0, 3).map(d => d.slice(5)).join(', ')}{bg.count > 3 ? '...' : ''} )</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            if (onBulkDelete) onBulkDelete(bg.bulkId);
                            setBulkGroups(prev => prev.filter(g => g.bulkId !== bg.bulkId));
                          }}
                          className="px-4 py-2 bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400 text-xs font-bold rounded-xl hover:bg-rose-200 dark:hover:bg-rose-800/60 transition-colors"
                        >
                          削除
                        </button>
                      </div>
                    ))
                  )}
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
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

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  日付
                </label>
                {formMode !== "bulk" ? (
                  <input
                    type="date"
                    required
                    value={taskDate}
                    onChange={(e) => setTaskDate(e.target.value)}
                    className="w-full text-base bg-slate-50 dark:bg-[#0f0f11] border border-slate-200 dark:border-white/10 rounded-xl p-3 focus:ring-2 focus:ring-brand-500/50 outline-none transition-all"
                  />
                ) : (
                  <div className="h-[18rem] overflow-y-auto pr-1 pb-2 custom-scrollbar space-y-6">
                    {Array.from({ length: 12 }).map((_, mIndex) => {
                      const monthStart = startOfMonth(addMonths(currentDate, mIndex));
                      const monthEnd = endOfMonth(monthStart);
                      const startDate = startOfWeek(monthStart);
                      const endDate = endOfWeek(monthEnd);
                      const days = eachDayOfInterval({ start: startDate, end: endDate });
                      const todayStr = format(new Date(), "yyyy-MM-dd");

                      return (
                        <div key={mIndex}>
                          <p className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-3 ml-1">
                            {format(monthStart, "yyyy年 M月")}
                          </p>
                          <div className="grid grid-cols-7 gap-1 mb-2">
                            {["日", "月", "火", "水", "木", "金", "土"].map((day, i) => (
                              <div key={day} className={`text-center text-[10px] font-extrabold ${i === 0 ? "text-rose-500/80" : i === 6 ? "text-blue-500/80" : "text-slate-400"}`}>
                                {day}
                              </div>
                            ))}
                          </div>
                          <div className="grid grid-cols-7 gap-1.5">
                            {days.map((d) => {
                              const dateStr = format(d, "yyyy-MM-dd");
                              const isSelected = selectedDates.includes(dateStr);
                              const isCurrentMonth = isSameMonth(d, monthStart);
                              const isPast = dateStr < todayStr;
                              
                              if (!isCurrentMonth) {
                                return <div key={`empty-${d.toString()}`} className="aspect-square"></div>;
                              }

                              return (
                                <button
                                  key={dateStr}
                                  type="button"
                                  disabled={isPast}
                                  onClick={() => {
                                    if (isSelected) {
                                      setSelectedDates(prev => prev.filter(x => x !== dateStr));
                                    } else {
                                      setSelectedDates(prev => [...prev, dateStr]);
                                    }
                                  }}
                                  className={`aspect-square rounded-xl flex items-center justify-center text-sm font-bold transition-all ${
                                    isPast
                                      ? "opacity-30 cursor-not-allowed text-slate-400"
                                      : isSelected
                                      ? "bg-brand-500 text-white shadow-md shadow-brand-500/30 scale-105 ring-2 ring-brand-500/50"
                                      : "bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 hover:border-slate-300 dark:hover:border-white/20"
                                  }`}
                                >
                                  {format(d, "d")}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
                {formMode === "bulk" && selectedDates.length === 0 && (
                  <p className="text-xs text-rose-500 mt-2 font-medium">1日以上選択してください</p>
                )}
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
            )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
