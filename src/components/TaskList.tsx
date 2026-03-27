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
  onReorder: (tasks: Task[]) => void;
  onToggleStatus: (task: Task) => void;
  onDelete: (id: string) => void;
  onEdit: (task: Task) => void;
}

export function TaskList({ tasks, onReorder, onToggleStatus, onDelete, onEdit }: TaskListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { delay: 100, tolerance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = tasks.findIndex((t) => t.id === active.id);
      const newIndex = tasks.findIndex((t) => t.id === over.id);
      const newTasks = arrayMove(tasks, oldIndex, newIndex);
      // Generate new sorting orders
      const reordered = newTasks.map((t, idx) => ({ ...t, order: idx }));
      onReorder(reordered);
    }
  };

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
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
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
    </DndContext>
  );
}
