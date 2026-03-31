import { useEffect, useState } from "react";
import { 
  DndContext, 
  closestCenter, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors, 
  DragEndEvent 
} from "@dnd-kit/core";
import { 
  arrayMove, 
  SortableContext, 
  sortableKeyboardCoordinates, 
  verticalListSortingStrategy 
} from "@dnd-kit/sortable";

import { TaskItem, Task, TaskStatus } from "./TaskItem";

interface TaskListProps {
  tasks: Task[];
  onToggleStatus: (task: Task) => void;
  onDelete: (id: string) => void;
  onEdit: (task: Task) => void;
}

export function TaskList({ tasks, onToggleStatus, onDelete, onEdit }: TaskListProps) {


  if (!tasks.length) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-slate-400">
        <div className="text-4xl mb-4">✨</div>
        <p className="font-medium text-lg">No tasks today</p>
        <p className="text-sm">Enjoy your clear schedule!</p>
      </div>
    );
  }

  return (
    <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
        <div className="px-4 pb-[8rem]">
          {tasks.map(task => (
             <TaskItem 
               key={task.id} 
               task={task} 
               onDelete={onDelete}
               onToggleStatus={onToggleStatus}
               onEdit={onEdit}
             />
          ))}
        </div>
      </SortableContext>
  );
}
