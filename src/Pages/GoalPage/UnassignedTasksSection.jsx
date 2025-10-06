import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import supabase from "../../utils/supabase";
import SortableTaskItem from "../PomodoroPage/TaskSection/SortableTaskItem";
import { useAuth } from "../../hooks/useAuth";
import SignInModal from "../../components/SignInModal";
import { useTranslation } from "react-i18next";

const UnassignedTasksSection = () => {
  const { t } = useTranslation();
  const [selectedId, setSelectedId] = useState(null);
  const { user } = useAuth();
  const [showSignIn, setShowSignIn] = useState(false);
  const [assignForTaskId, setAssignForTaskId] = useState(null);
  const [chosenGoalId, setChosenGoalId] = useState("");
  const qc = useQueryClient();

  const { data: tasks = [], isLoading, isError } = useQuery({
    queryKey: ["tasks", "unassigned"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tasks")
        .select("id, description, pomodorosNumber, pomodorosDone, isToday, isFinished, goal_id")
        .is("goal_id", null)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    staleTime: 60 * 1000,
    retry: false,
    refetchOnWindowFocus: false,
  });

  // fetch available goals for assignment
  const { data: goals = [] } = useQuery({
    queryKey: ["goals"],
    queryFn: async () => {
      const { data, error } = await supabase.from("goals").select("id, name").order("created_at", { ascending: true });
      if (error) throw error;
      return data;
    },
    staleTime: 60 * 1000,
    retry: false,
  });

  const assignGoalMutation = useMutation({
    mutationFn: async ({ taskId, goalId }) => {
      const { data, error } = await supabase.from("tasks").update({ goal_id: goalId }).eq("id", taskId).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tasks"] });
      qc.invalidateQueries({ queryKey: ["goals"] });
      setAssignForTaskId(null);
      setChosenGoalId("");
    },
  });

  return (
    <section className="soft-panel animate-fadeIn">
      <h2 className="mb-3">{t("Unassigned Tasks")}</h2>

      {isLoading ? (
        <p className="text-sm text-gray-600">{t("Loading…")}</p>
      ) : isError ? (
        <p className="text-sm text-red-600">{t("Failed to load tasks.")}</p>
      ) : tasks.length === 0 ? (
        <p className="text-sm text-gray-600">{t("No tasks without a goal.")}</p>
      ) : (
        <ul className="space-y-3">
          {tasks.map((titem) => (
            <SortableTaskItem
              key={titem.id}
              task={titem}
              selectedId={selectedId}
              setSelectedId={setSelectedId}
              showGoalName={false}
              showDragHandle={false}
              showRemoveGoalButton={false}
              rightControls={
                assignForTaskId === titem.id ? (
                  <div className="flex items-center gap-2">
                    <select
                      value={chosenGoalId}
                      onChange={(e) => setChosenGoalId(e.target.value)}
                      className="border rounded-md px-2 py-1 text-sm"
                    >
                      <option value="">{t("Select goal…")}</option>
                      {goals.map((g) => (
                        <option key={g.id} value={g.id}>
                          {g.name}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={() => assignGoalMutation.mutate({ taskId: titem.id, goalId: chosenGoalId || null })}
                      disabled={assignGoalMutation.isLoading || !chosenGoalId}
                      className="px-2 py-1 bg-[#b33a3a] text-white rounded-md text-sm"
                    >
                      {t("Save")}
                    </button>
                    <button
                      onClick={() => {
                        setAssignForTaskId(null);
                        setChosenGoalId("");
                      }}
                      className="px-2 py-1 border rounded-md text-sm"
                    >
                      {t("Cancel")}
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!user) {
                        setShowSignIn(true);
                        return;
                      }
                      setAssignForTaskId(titem.id);
                      setChosenGoalId("");
                    }}
                    className="px-2 py-1 bg-green-50 text-green-700 rounded-md text-sm"
                  >
                    {t("Assign")}
                  </button>
                )
              }
            />
          ))}
        </ul>
      )}
      <SignInModal open={showSignIn} onClose={() => setShowSignIn(false)} />
    </section>
  );
};

export default UnassignedTasksSection;