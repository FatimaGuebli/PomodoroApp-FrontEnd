import React, { useEffect, useState } from "react";
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
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  sortableKeyboardCoordinates as coordinates,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import supabase from "../../../utils/supabase";

// Task Card Component
const SortableTaskItem = ({ task, setSelectedId, selectedId }) => {
  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const isSelected = selectedId === task.id;

  const handleClick = () => {
    setSelectedId(task.id);
    console.log("✅ Selected Task ID:", task.id);
  };

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
        isSelected
          ? "border-[#b33a3a] ring-2 ring-[#fcb6c6]"
          : "border-[#f4e1e6]"
      } rounded-2xl px-6 py-5 shadow-md hover:shadow-lg transition-all flex justify-between items-start gap-4`}
      onClick={handleClick}
    >
      <div className="flex items-start gap-4 cursor-pointer">
        <ClockIcon className="text-[#b33a3a] w-6 h-6 mt-1" />
        <div>
          <h3 className="text-[#4b2e2e] font-semibold text-lg">
            {task.description || "❌ No description"}
          </h3>
          <p className="text-sm text-[#7c4a4a] opacity-80 mt-1">
            Pomodoros: {task.pomodorosDone ?? "?"} /{" "}
            {task.pomodorosNumber ?? "?"}
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
          onClick={(e) => e.stopPropagation()} // prevent from selecting on drag handle click
          className="p-2 cursor-grab active:cursor-grabbing text-[#b33a3a]"
        >
          <GripVertical />
        </button>
      </div>
    </li>
  );
};

// Main List Component
const DisplayTodaysTasks = ({ newtaskId, selectedId, setSelectedId }) => {
  const [tasksList, setTasksList] = useState([]);
  const [orderedTaskIds, setOrderedTaskIds] = useState([]);

  // Fetch all tasks marked as isToday
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const { data, error } = await supabase
          .from("tasks")
          .select("*")
          .eq("isToday", true);

        if (error) throw error;

        setTasksList(data);
        setOrderedTaskIds(data.map((task) => task.id));
      } catch (err) {
        console.error("❌ Failed to fetch today's tasks:", err.message);
      }
    };

    fetchTasks();
  }, []);

  // Add new task if needed
  useEffect(() => {
    if (!newtaskId) return;

    const addToToday = async () => {
      try {
        const { data: existingTask, error: getError } = await supabase
          .from("tasks")
          .select("isToday")
          .eq("id", newtaskId)
          .single();

        if (getError) throw getError;

        if (!existingTask?.isToday) {
          const { error: updateError } = await supabase
            .from("tasks")
            .update({ isToday: true })
            .eq("id", newtaskId);

          if (updateError) throw updateError;

          setOrderedTaskIds((prev) => [...prev, newtaskId]);
        }
      } catch (err) {
        console.error("❌ Failed to update task to today:", err.message);
      }
    };

    addToToday();
  }, [newtaskId]);

  const todaysTasks = orderedTaskIds
    .map((id) => tasksList.find((task) => task.id === id))
    .filter(Boolean);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: coordinates,
    })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = orderedTaskIds.indexOf(active.id);
    const newIndex = orderedTaskIds.indexOf(over.id);
    setOrderedTaskIds((ids) => arrayMove(ids, oldIndex, newIndex));
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
            items={orderedTaskIds}
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
