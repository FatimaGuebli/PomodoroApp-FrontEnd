import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2 } from "lucide-react";
import supabase from "../../utils/supabase";
import AddNewTask from "../../components/AddNewTask";
import SortableTaskItem from "../../Pages/PomodoroPage/TaskSection/SortableTaskItem";
import { useAuth } from "../../hooks/useAuth";
import SignInModal from "../../components/SignInModal";
import { useTranslation } from "react-i18next";

const GoalsListSection = () => {
  const qc = useQueryClient();
  const { user } = useAuth();
  const { t } = useTranslation();
  const [addTaskGoalId, setAddTaskGoalId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [showSignIn, setShowSignIn] = useState(false);

  const [openGoalId, setOpenGoalId] = useState(null);

  const GoalTaskList = ({ goalId }) => {
    const { data: tasksForGoal = [], isLoading, isError } = useQuery({
      queryKey: ["tasks", "byGoal", goalId],
      queryFn: async () => {
        const { data, error } = await supabase
          .from("tasks")
          .select("id, description, pomodorosNumber, pomodorosDone, isToday, isFinished")
          .eq("goal_id", goalId)
          .order("created_at", { ascending: true });
        if (error) throw error;
        return data;
      },
      enabled: !!goalId,
      staleTime: 60 * 1000,
      retry: false,
      refetchOnWindowFocus: false,
    });

    if (isLoading) return <div className="text-sm text-gray-500 mt-2">{t("Loading tasks…")}</div>;
    if (isError) return <div className="text-sm text-red-600 mt-2">{t("Failed to load tasks.")}</div>;
    if (!tasksForGoal.length) return <div className="text-sm text-gray-600 mt-2">{t("No tasks for this goal.")}</div>;

    return (
      <ul className="mt-2 space-y-2">
        {tasksForGoal.map((task) => (
          <SortableTaskItem
            key={task.id}
            task={task}
            selectedId={selectedTaskId}
            setSelectedId={setSelectedTaskId}
            compact={true}
            showGoalName={false}
            showDragHandle={false}
          />
        ))}
      </ul>
    );
  };

  const { data: goals = [], isLoading, isError } = useQuery({
    queryKey: ["goals"],
    queryFn: async () => {
      const { data, error } = await supabase.from("goals").select("id, name").order("created_at", { ascending: true });
      if (error) throw error;
      return data;
    },
    staleTime: 60 * 1000,
    retry: false,
    refetchOnWindowFocus: false,
  });

  const editGoalMutation = useMutation({
    mutationFn: async ({ id, name }) => {
      const { data, error } = await supabase.from("goals").update({ name }).eq("id", id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["goals"] });
      setEditingId(null);
      setEditName("");
    },
  });

  const deleteGoalMutation = useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase.from("goals").delete().eq("id", id);
      if (error) throw error;
      return true;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["goals"] });
      qc.invalidateQueries({ queryKey: ["tasks"] });
      setDeleteConfirmId(null);
    },
  });

  if (isLoading) {
    return (
      <section className="soft-panel animate-fadeIn">
        <h2 className="mb-3">{t("Your goals")}</h2>
        <p className="text-sm text-gray-600">{t("Loading goals…")}</p>
      </section>
    );
  }

  if (isError) {
    return (
      <section className="soft-panel animate-fadeIn">
        <h2 className="mb-3">{t("Your goals")}</h2>
        <p className="text-sm text-red-600">{t("Failed to load goals.")}</p>
      </section>
    );
  }

  return (
    <section className="soft-panel animate-fadeIn">
      <h2 className="mb-3">{t("Your goals")}</h2>

      {goals.length === 0 ? (
        <p className="text-sm text-gray-600">{t("No goals yet.")}</p>
      ) : (
        <ul className="space-y-3">
          {goals.map((g) => (
            <li key={g.id} className="border border-[#f4e1e6] rounded-lg px-3 py-2 bg-white">
              <div className="flex items-center justify-between w-full">
                <div className="flex-1">
                  {editingId === g.id ? (
                    <div className="flex gap-2 items-center">
                      <input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="border px-2 py-1 rounded-md text-sm w-full"
                      />
                      <button
                        onClick={() => editGoalMutation.mutate({ id: g.id, name: editName })}
                        className="text-sm text-[#b33a3a] font-semibold"
                        disabled={editGoalMutation.isLoading}
                      >
                        {editGoalMutation.isLoading ? t("Saving…") : t("Save")}
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingId(null);
                          setEditName("");
                        }}
                        className="text-sm text-gray-600"
                      >
                        {t("Cancel")}
                      </button>
                    </div>
                  ) : (
                    <div>
                      <div
                        className="text-sm font-semibold text-[#4b2e2e] cursor-pointer select-none"
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenGoalId((prev) => (prev === g.id ? null : g.id));
                          setAddTaskGoalId(null);
                        }}
                        role="button"
                        aria-expanded={openGoalId === g.id}
                      >
                        {g.name}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 ml-4">
                  <button
                    title={t("Add task to this goal")}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!user) {
                        setShowSignIn(true);
                        return;
                      }
                      setAddTaskGoalId((prev) => (prev === g.id ? null : g.id));
                    }}
                    className="p-2 rounded-md hover:bg-gray-50"
                    disabled={false}
                  >
                    <Plus className="w-4 h-4 text-green-600" />
                  </button>

                  <button
                    title={t("Edit goal name")}
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingId(g.id);
                      setEditName(g.name);
                    }}
                    className="p-2 rounded-md hover:bg-gray-50"
                  >
                    <Pencil className="w-4 h-4 text-[#b33a3a]" />
                  </button>

                  <button
                    title={t("Delete goal")}
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteConfirmId(g.id);
                    }}
                    className="p-2 rounded-md hover:bg-gray-50"
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </button>
                </div>
              </div>

              {openGoalId === g.id && (
                <div className="mt-3 w-full">
                  <GoalTaskList goalId={g.id} />
                </div>
              )}

              {addTaskGoalId === g.id && (
                <div className="w-full border-t pt-3 mt-3">
                  <AddNewTask
                    goalId={g.id}
                    onClose={() => setAddTaskGoalId(null)}
                    createdInPomodoro={false}
                    onCreated={() => {
                      qc.invalidateQueries({ queryKey: ["tasks"] });
                      qc.invalidateQueries({ queryKey: ["goals"] });
                      setAddTaskGoalId(null);
                    }}
                  />
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={() => setDeleteConfirmId(null)}>
          <div className="absolute inset-0 bg-black/40" />
          <div
            className="relative z-50 w-full max-w-sm bg-white rounded-lg shadow-lg p-6 mx-4"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label={t("Delete goal confirmation title")}
          >
            <h4 className="text-lg font-semibold text-[#4b2e2e]">{t("Delete goal")}</h4>
            <p className="text-sm text-gray-600 mt-2">{t("Delete goal confirmation body")}</p>
            <div className="mt-4 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                className="px-3 py-1 rounded-md text-sm border hover:bg-gray-50"
                disabled={deleteGoalMutation.isLoading}
              >
                {t("Cancel")}
              </button>
              <button
                type="button"
                onClick={() => deleteGoalMutation.mutate(deleteConfirmId)}
                className="px-4 py-1 rounded-md text-sm bg-red-600 text-white"
                disabled={deleteGoalMutation.isLoading}
              >
                {deleteGoalMutation.isLoading ? t("Deleting...") : t("Delete (confirm button)")}
              </button>
            </div>
          </div>
        </div>
      )}

      <SignInModal open={showSignIn} onClose={() => setShowSignIn(false)} />
    </section>
  );
};

export default GoalsListSection;