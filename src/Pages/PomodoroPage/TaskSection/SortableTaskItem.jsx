import React, { useState } from "react";
import { GripVertical, Pencil } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const SortableTaskItem = ({ task, setSelectedId, selectedId }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    description: task.description,
    pomodorosDone: task.pomodorosDone,
    pomodorosNumber: task.pomodorosNumber,
    goal_id: task.goal_id || "",
  });

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
      [name]: name.includes("pomodoros") ? parseInt(value) : value,
    }));
  };

  const handleSave = () => {
    alert("Saving not implemented yet");
    setIsEditing(false);
  };

  const handleDelete = () => {
    alert("Delete not implemented yet");
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

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={`bg-white border ${
        selectedId === task.id
          ? "border-[#b33a3a] ring-2 ring-[#fcb6c6]"
          : "border-[#f4e1e6]"
      } rounded-2xl px-4 py-3 shadow-md hover:shadow-lg transition-all flex gap-4`}
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
      <div className="flex-1 cursor-default">
        {isEditing ? (
          <div className="space-y-3">
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

            {/* Buttons under form */}
            <div className="flex justify-between pt-2">
              {/* Delete on the left */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete();
                }}
                className="text-sm text-[#b33a3a] px-4 py-1.5 rounded-xl bg-white hover:bg-[#ffe5e5] transition shadow-sm"
              >
                Delete
              </button>

              {/* Save + Discard on the right */}
              <div className="flex gap-4">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDiscard();
                  }}
                  className="text-sm text-[#7c4a4a] px-4 py-1.5 rounded-xl bg-white hover:bg-[#f4e1e6] transition shadow-sm"
                >
                  Discard
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSave();
                  }}
                  className="text-sm text-[#b33a3a] font-medium px-4 py-1.5 rounded-xl bg-white hover:bg-[#fcebea] transition shadow-sm"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
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

      {/* Edit Button (when not editing) */}
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
