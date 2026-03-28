import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { CheckCircle2, Circle, GripVertical, Trash2, Clock, XCircle } from "lucide-react";

export type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE" | "FAILED";

export interface Task {
  id: string;
  title: string;
  memo: string;
  status: TaskStatus;
  date: string;
  order: number;
  failureReason?: string;
}

interface TaskItemProps {
  task: Task;
  onToggleStatus: (task: Task) => void;
  onDelete: (id: string) => void;
  onEdit: (task: Task) => void;
}

export function TaskItem({ task, onToggleStatus, onDelete, onEdit }: TaskItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : "auto",
    opacity: isDragging ? 0.7 : 1,
  };

  const isDone = task.status === "DONE";
  const isInProgress = task.status === "IN_PROGRESS";
  const isFailed = task.status === "FAILED";

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`glass dark:glass-dark group relative flex items-center p-4 mb-3 rounded-2xl transition-all hover:shadow-md cursor-default ${
        isDone ? "opacity-60" : ""
      } ${
        isFailed ? "border-rose-200 dark:border-rose-900/30 bg-rose-50/50 dark:bg-rose-950/20" : ""
      } ${
        isDragging ? "shadow-xl ring-2 ring-brand-500 scale-[1.02]" : "ring-1 ring-slate-200 dark:ring-white/10"
      }`}
    >
      <button 
        {...attributes} 
        {...listeners}
        className="mr-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 active:cursor-grabbing cursor-grab touch-none"
      >
        <GripVertical size={20} />
      </button>

      <button 
        onClick={() => onToggleStatus(task)}
        className={`mr-4 flex-shrink-0 transition-transform active:scale-75 ${isFailed ? "cursor-default" : "cursor-pointer"}`}
        disabled={isFailed}
      >
        {isDone ? (
          <CheckCircle2 size={26} className="text-emerald-500 fill-emerald-500/20" />
        ) : isInProgress ? (
          <Clock size={26} className="text-amber-500 fill-amber-500/10" />
        ) : isFailed ? (
          <XCircle size={26} className="text-rose-500 fill-rose-500/20" />
        ) : (
          <Circle size={26} className="text-slate-300 dark:text-slate-600" />
        )}
      </button>

      <div 
        className="flex-1 overflow-hidden cursor-pointer" 
        onClick={() => onEdit(task)}
      >
        <h3 className={`font-semibold text-lg truncate transition-all ${
          isDone ? "text-slate-400 dark:text-slate-500 line-through" : 
          isFailed ? "text-rose-700 dark:text-rose-400 line-through" : 
          "text-slate-800 dark:text-slate-100"
        }`}>
          {task.title}
        </h3>
        
        {task.memo && !isFailed && (
          <p className="text-sm text-slate-500 dark:text-slate-400 truncate mt-0.5">
            {task.memo}
          </p>
        )}
        
        {isFailed && task.failureReason && (
          <p className="text-sm text-rose-600 dark:text-rose-400 mt-1.5 bg-rose-100/50 dark:bg-rose-900/40 p-2 rounded-lg leading-relaxed">
            <strong className="block text-xs uppercase tracking-wider mb-0.5 opacity-80">失敗の理由:</strong>
            {task.failureReason}
          </p>
        )}
      </div>

      <button 
        onClick={() => onDelete(task.id)}
        className="ml-2 p-2 text-rose-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-full transition-colors opacity-100 md:opacity-0 md:group-hover:opacity-100"
      >
        <Trash2 size={18} />
      </button>
    </div>
  );
}
