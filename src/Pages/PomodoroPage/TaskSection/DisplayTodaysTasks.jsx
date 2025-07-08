import React from "react";
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
  verticalListSortingStrategy,
  sortableKeyboardCoordinates as coordinates,
  arrayMove,
} from "@dnd-kit/sortable";

import SortableTaskItem from "./SortableTaskItem";

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
    // Optional: persist to Supabase
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
