import React, { useState } from "react";
import { GripVertical, Pencil, X } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useUpdateTask, useDeleteTask } from "../../../hooks/useTaskMutations";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import supabase from "../../../utils/supabase";
import { useTranslation } from "react-i18next";

const SortableTaskItem = ({
  task,
  setSelectedId,
  selectedId,
  compact = false,
  showGoalName = true,
  showDragHandle = true,
  showRemoveGoalButton = true,
  rightControls = null, // React node to render on the right instead of default remove button
}) => {
  const qc = useQueryClient();
  const { t } = useTranslation();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    description: task.description,
    pomodorosDone: task.pomodorosDone,
    pomodorosNumber: task.pomodorosNumber,
    goal_id: task.goal_id || "",
  });

  const updateTaskMutation = useUpdateTask();
  const deleteTaskMutation = useDeleteTask();

  // load goals for the select dropdown
  const { data: goals = [], isLoading: goalsLoading } = useQuery({
    queryKey: ["goals"],
    queryFn: async () => {
      // select the real columns present in your goals table
      const { data, error } = await supabase.from("goals").select("id, name")
         .order("created_at", { ascending: true });
       if (error) throw error;
       return data;
     },
     staleTime: 60 * 1000,
     // reduce noisy retries/refetch while debugging
     retry: false,
     refetchOnWindowFocus: false,
   });

  // derive the goal name for this task (used in non-editing view)
  const goalName = goalsLoading
    ? t("loading")
    : (goals.find((g) => g.id === task.goal_id)?.name ?? t("no_goal_selected"));
  
  // local UI state for processing and delete confirmation modal
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

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

    setIsSaving(true);
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
      alert("❌ Failed to update: " + (err?.message || err));
    } finally {
      setIsSaving(false);
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

  // open confirmation dialog (used by Delete button in edit mode)
  const handleDelete = (e) => {
    e?.stopPropagation();
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteTaskMutation.mutateAsync(task.id);
      // clear selection if this was selected
      try {
        setSelectedId((prev) => (prev === task.id ? null : prev));
      } catch {}
    } catch (err) {
      alert("❌ Failed to delete: " + (err?.message || err));
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
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
      {/* Drag Handle (only shown when showDragHandle === true) */}
      {showDragHandle && (
        <button
          {...attributes}
          {...listeners}
          onClick={(e) => e.stopPropagation()}
          className="p-2 cursor-grab active:cursor-grabbing text-[#b33a3a]"
          aria-hidden={!showDragHandle}
        >
          <GripVertical className="w-6 h-6" />
        </button>
      )}

      {/* Task Content */}
      <div className="flex-1 cursor-default space-y-3">
        {isEditing ? (
          <>
            <div className="space-y-1">
              <label className="text-sm text-[#4b2e2e] font-semibold">
                {t("label_description")}
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
                  {t("label_pomodoros_done")}
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
                  {t("label_pomodoros_total")}
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
                {t("label_goal")}
              </label>
              <select
                name="goal_id"
                value={formData.goal_id}
                onChange={handleChange}
                className="w-full border px-4 py-2 rounded-md text-sm"
              >
                <option value="">{t("no_goal_selected")}</option>
                {goalsLoading ? (
                  <option disabled>{t("Loading goals…")}</option>
                ) : (
                  goals.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name ?? t("unnamed_goal")}
                    </option>
                  ))
                )}
              </select>
            </div>

            {/* Buttons */}
            <div className="flex justify-between pt-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(e);
                }}
                className="text-red-600 text-sm font-medium hover:underline"
                disabled={isDeleting}
              >
                {isDeleting ? t("deleting") : t("btn_delete")}
              </button>
              <div className="flex gap-3">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDiscard();
                  }}
                  className="text-gray-600 text-sm font-medium hover:underline"
                >
                  {t("btn_discard")}
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSave();
                  }}
                  className="text-[#b33a3a] text-sm font-semibold hover:underline"
                  disabled={isSaving}
                >
                  {isSaving ? t("saving") : t("btn_save")}
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
            {showGoalName && (
              <p className={compact ? "text-xs text-[#7c4a4a] opacity-70 mt-1" : "text-xs text-[#7c4a4a] opacity-70 mb-1"}>
                {goalName}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Edit Button */}
      {!isEditing && (
        <div className="flex items-start mt-1 gap-2">
          {/* Right-side controls: either a custom node (rightControls) or the default remove-goal button */}
          {rightControls ? (
            rightControls
          ) : (
            showRemoveGoalButton && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  const prevGoalId = task.goal_id;
                  const prevTasksByGoal = qc.getQueryData(["tasks", "byGoal", prevGoalId]);
                  const prevTasksAll = qc.getQueryData(["tasks"]);
                  const prevToday = qc.getQueryData(["tasks", "today"]);

                  // optimistic: remove task from caches used by UI
                  if (prevGoalId) {
                    qc.setQueryData(["tasks", "byGoal", prevGoalId], (old = []) =>
                      old.filter((t) => String(t.id) !== String(task.id))
                    );
                  }
                  qc.setQueryData(["tasks"], (old = []) => (old || []).filter((t) => String(t.id) !== String(task.id)));
                  qc.setQueryData(["tasks", "today"], (old = []) => (old || []).filter((t) => String(t.id) !== String(task.id)));

                  const payload = { id: task.id, goal_id: null, isToday: false };
                  console.debug("Updating task (optimistic):", payload);

                  updateTaskMutation.mutate(payload, {
                    onSuccess: (res) => {
                      console.debug("Update success:", res);
                      // make sure server state is reflected (safe refresh)
                      qc.invalidateQueries(["tasks"]);
                      if (prevGoalId) qc.invalidateQueries(["tasks", "byGoal", prevGoalId]);
                      qc.invalidateQueries(["tasks", "today"]);
                    },
                    onError: (err) => {
                      console.error("Failed to update task:", err);
                      // rollback caches
                      if (prevGoalId) qc.setQueryData(["tasks", "byGoal", prevGoalId], prevTasksByGoal);
                      qc.setQueryData(["tasks"], prevTasksAll);
                      qc.setQueryData(["tasks", "today"], prevToday);
                    },
                  });
                }}
                className="p-2 text-red-600 hover:bg-red-50 rounded-md transition"
                title={t("tooltip_remove_goal")}
                aria-label={t("tooltip_remove_goal")}
              >
                <X className="w-4 h-4" />
              </button>
            )
          )}

          {/* Edit button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsEditing(true);
            }}
            className="p-2 text-[#b33a3a] hover:bg-[#fcebea] rounded-md transition"
            title={t("tooltip_edit_task")}
          >
            <Pencil className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Delete confirmation modal */}
      {showDeleteConfirm && (
        <div
          className="fixed inset-0 z-70 flex items-center justify-center"
          onClick={handleCancelDelete}
        >
          <div className="absolute inset-0 bg-black/40" />
          <div
            className="relative z-80 w-full max-w-sm bg-white rounded-lg shadow-lg p-6 mx-4"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label={t("confirm_delete_task_title")}
          >
            <h4 className="text-lg font-semibold text-[#4b2e2e]">{t("confirm_delete_task_title")}</h4>
            <p className="text-sm text-gray-600 mt-2">{t("confirm_delete_task_body")}</p>
            <div className="mt-4 flex justify-end gap-3">
              <button
                type="button"
                onClick={handleCancelDelete}
                className="px-3 py-1 rounded-md text-sm border hover:bg-gray-50"
                disabled={isDeleting}
              >
                {t("btn_cancel")}
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-1 rounded-md text-sm bg-red-600 text-white"
                disabled={isDeleting}
              >
                {isDeleting ? t("deleting") : t("btn_delete")}
              </button>
            </div>
          </div>
        </div>
      )}
    </li>
  );
};

export default SortableTaskItem;
