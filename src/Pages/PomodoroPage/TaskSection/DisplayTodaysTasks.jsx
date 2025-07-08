import React from "react";
import { ClockIcon, GripVertical } from "lucide-react";
import {
  DndContext,
  closestCenter,
  useSensor,
  useSensors,
  PointerSensor,
  KeyboardSensor,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  sortableKeyboardCoordinates as coordinates,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const SortableTaskItem = ({ task, setSelectedId, selectedId }) => {
  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={`bg-white border ${
        selectedId === task.id
          ? "border-[#b33a3a] ring-2 ring-[#fcb6c6]"
          : "border-[#f4e1e6]"
      } rounded-2xl px-6 py-5 shadow-md hover:shadow-lg transition-all flex justify-between items-start gap-4`}
      onClick={() => setSelectedId(task.id)}
    >
      <div className="flex items-start gap-4 cursor-pointer">
        <ClockIcon className="text-[#b33a3a] w-6 h-6 mt-1" />
        <div>
          <h3 className="text-[#4b2e2e] font-semibold text-lg">
            {task.description}
          </h3>
          <p className="text-sm text-[#7c4a4a] opacity-80 mt-1">
            Pomodoros: {task.pomodorosDone} / {task.pomodorosNumber}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="text-sm bg-[#fce8e8] text-[#b33a3a] font-medium px-3 py-1 rounded-lg">
          {task.pomodorosDone} done
        </div>
        <button
          {...attributes}
          {...listeners}
          onClick={(e) => e.stopPropagation()}
          className="p-2 cursor-grab active:cursor-grabbing text-[#b33a3a]"
        >
          <GripVertical />
        </button>
      </div>
    </li>
  );
};

const DisplayTodaysTasks = ({ todaysTasks, selectedId, setSelectedId }) => {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: coordinates,
    })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = todaysTasks.findIndex((t) => t.id === active.id);
    const newIndex = todaysTasks.findIndex((t) => t.id === over.id);

    const newOrder = arrayMove(todaysTasks, oldIndex, newIndex);
    console.log("🔃 New order (not persisted):", newOrder);
    // Optional: Update order in Supabase if needed
  };

  return (
    <div className="space-y-5">
      {todaysTasks.length === 0 ? (
        <p className="text-sm text-gray-400 italic">No tasks for today yet.</p>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={todaysTasks.map((t) => t.id)}
            strategy={verticalListSortingStrategy}
          >
            <ul className="space-y-4">
              {todaysTasks.map((task) => (
                <SortableTaskItem
                  key={task.id}
                  task={task}
                  selectedId={selectedId}
                  setSelectedId={setSelectedId}
                />
              ))}
            </ul>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
};

export default DisplayTodaysTasks;
