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
            {task.description}
          </h3>
          <p className="text-sm text-[#7c4a4a] opacity-80 mt-1">
            Total Pomodoros: {task.pomodoroNumbers}
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
  const [todaysTasksList, setTodaysTasksList] = useState([]);
  const [tasksList, setTasksList] = useState([]);
  const [orderedTaskIds, setOrderedTaskIds] = useState([]);

  // Fetch today's task IDs
  useEffect(() => {
    const fetchToday = async () => {
      try {
        const res = await fetch("http://localhost:3001/todaystasks");
        const data = await res.json();
        setTodaysTasksList(data);
        setOrderedTaskIds(data.map((t) => t.id));
      } catch (err) {
        console.error("❌ Failed to fetch todaystasks:", err.message);
      }
    };
    setTimeout(fetchToday, 2000);
  }, []);

  // Fetch all tasks
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await fetch("http://localhost:3001/tasks");
        const data = await res.json();
        setTasksList(data);
      } catch (err) {
        console.error("❌ Failed to fetch tasks:", err.message);
      }
    };
    setTimeout(fetchTasks, 2000);
  }, []);

  // Add new task if needed
  useEffect(() => {
    if (!newtaskId) return;

    const addToToday = async () => {
      try {
        const res = await fetch("http://localhost:3001/todaystasks");
        const data = await res.json();
        const already = data.some((t) => t.id === newtaskId);
        if (!already) {
          await fetch("http://localhost:3001/todaystasks", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: newtaskId }),
          });
          setTodaysTasksList((prev) => [...prev, { id: newtaskId }]);
          setOrderedTaskIds((prev) => [...prev, newtaskId]);
        }
      } catch (err) {
        console.error("❌ Failed to add task:", err.message);
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
