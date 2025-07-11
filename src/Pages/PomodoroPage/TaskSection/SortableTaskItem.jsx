import React, { useState } from "react";
import { GripVertical, Pencil } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useUpdateTask, useDeleteTask } from "../../../hooks/useTaskMutations";

const SortableTaskItem = ({ task, setSelectedId, selectedId }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    description: task.description,
    pomodorosDone: task.pomodorosDone,
    pomodorosNumber: task.pomodorosNumber,
    goal_id: task.goal_id || "",
  });

  const updateTaskMutation = useUpdateTask();
  const deleteTaskMutation = useDeleteTask();

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name.includes("pomodoros") ? parseInt(value) || 0 : value,
    }));
  };

  const handleSave = async () => {
    const done = Number(formData.pomodorosDone);
    const total = Number(formData.pomodorosNumber);

    if (isNaN(done) || isNaN(total)) {
      alert("❌ Pomodoro values must be valid numbers.");
      return;
    }

    if (done > total) {
      alert("❌ Pomodoros done cannot be greater than total.");
      return;
    }

    try {
      await updateTaskMutation.mutateAsync({
        id: task.id,
        description: formData.description,
        pomodorosDone: done,
        pomodorosNumber: total,
        goal_id: formData.goal_id || null,
      });
      setIsEditing(false);
    } catch (err) {
      alert("❌ Failed to update: " + err.message);
    }
  };

  const handleDiscard = () => {
    setIsEditing(false);
    setFormData({
      description: task.description,
      pomodorosDone: task.pomodorosDone,
      pomodorosNumber: task.pomodorosNumber,
      goal_id: task.goal_id || "",
    });
  };

  const handleDelete = async () => {
    const confirm = window.confirm(
      "Are you sure you want to delete this task?"
    );
    if (!confirm) return;

    try {
      await deleteTaskMutation.mutateAsync(task.id);
    } catch (err) {
      alert("❌ Failed to delete: " + err.message);
    }
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={`bg-white border ${
        selectedId === task.id
          ? "border-[#b33a3a] ring-2 ring-[#fcb6c6]"
          : "border-[#f4e1e6]"
      } rounded-2xl px-4 py-3 shadow-md hover:shadow-lg transition-all flex gap-4 items-start`}
      onClick={() => setSelectedId(task.id)}
    >
      {/* Drag Handle */}
      <button
        {...attributes}
        {...listeners}
        onClick={(e) => e.stopPropagation()}
        className="p-2 cursor-grab active:cursor-grabbing text-[#b33a3a]"
      >
        <GripVertical className="w-6 h-6" />
      </button>

      {/* Task Content */}
      <div className="flex-1 cursor-default space-y-3">
        {isEditing ? (
          <>
            <div className="space-y-1">
              <label className="text-sm text-[#4b2e2e] font-semibold">
                Description
              </label>
              <input
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="w-full border px-4 py-2 rounded-md text-sm"
              />
            </div>

            <div className="flex gap-4">
              <div className="w-1/2 space-y-1">
                <label className="text-sm text-[#4b2e2e] font-semibold">
                  Pomodoros Done
                </label>
                <input
                  name="pomodorosDone"
                  type="number"
                  min={0}
                  max={formData.pomodorosNumber}
                  value={formData.pomodorosDone}
                  onChange={handleChange}
                  className="w-full border px-4 py-2 rounded-md text-sm"
                />
              </div>
              <div className="w-1/2 space-y-1">
                <label className="text-sm text-[#4b2e2e] font-semibold">
                  Pomodoros Total
                </label>
                <input
                  name="pomodorosNumber"
                  type="number"
                  min={1}
                  value={formData.pomodorosNumber}
                  onChange={handleChange}
                  className="w-full border px-4 py-2 rounded-md text-sm"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm text-[#4b2e2e] font-semibold">
                Goal
              </label>
              <select
                name="goal_id"
                value={formData.goal_id}
                onChange={handleChange}
                className="w-full border px-4 py-2 rounded-md text-sm"
              >
                <option value="">No goal selected</option>
                <option value="demo-goal-id">Demo Goal</option>
              </select>
            </div>

            {/* Buttons */}
            <div className="flex justify-between pt-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete();
                }}
                className="text-red-600 text-sm font-medium hover:underline"
              >
                Delete
              </button>
              <div className="flex gap-3">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDiscard();
                  }}
                  className="text-gray-600 text-sm font-medium hover:underline"
                >
                  Discard
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSave();
                  }}
                  className="text-[#b33a3a] text-sm font-semibold hover:underline"
                >
                  Save
                </button>
              </div>
            </div>
          </>
        ) : (
          <div
            onClick={() => setSelectedId(task.id)}
            className="cursor-pointer"
          >
            <h3 className="text-[#4b2e2e] font-semibold text-base leading-snug">
              {task.description}
            </h3>
            <p className="text-sm text-[#7c4a4a] opacity-80 mt-1">
              Pomodoros: {task.pomodorosDone} / {task.pomodorosNumber}
            </p>
          </div>
        )}
      </div>

      {/* Edit Button */}
      {!isEditing && (
        <div className="flex items-start mt-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsEditing(true);
            }}
            className="p-2 text-[#b33a3a] hover:bg-[#fcebea] rounded-md transition"
            title="Edit Task"
          >
            <Pencil className="w-4 h-4" />
          </button>
        </div>
      )}
    </li>
  );
};

export default SortableTaskItem;
