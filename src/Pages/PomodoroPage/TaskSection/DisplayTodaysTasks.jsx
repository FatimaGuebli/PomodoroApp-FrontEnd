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
import supabase from "../../../utils/supabase"; // ✅ import supabase

const DisplayTodaysTasks = ({
  todaysTasks,
  setTodaysTasks,
  selectedId,
  setSelectedId,
}) => {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: coordinates,
    })
  );

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = todaysTasks.findIndex((t) => t.id === active.id);
    const newIndex = todaysTasks.findIndex((t) => t.id === over.id);

    const newOrder = arrayMove(todaysTasks, oldIndex, newIndex);
    setTodaysTasks(newOrder);
    console.log(
      "🔃 New order (persisting to Supabase):",
      newOrder.map((t) => t.description)
    );

    // ✅ Update Supabase 'order' fields
    const updates = newOrder.map((task, index) => ({
      id: task.id,
      order: index,
    }));

    const { error } = await supabase.from("tasks").upsert(updates, {
      onConflict: "id",
    });

    if (error) {
      console.error("❌ Failed to update order in Supabase:", error.message);
    } else {
      console.log("✅ Order persisted to Supabase");
    }
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
