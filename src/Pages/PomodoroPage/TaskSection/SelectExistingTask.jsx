import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import supabase from "../../../utils/supabase";
import { useAuth } from "../../../hooks/useAuth";
import SignInModal from "../../../components/SignInModal";
import { useTranslation } from "react-i18next";

const SelectExistingTask = ({
  tasks,
  todaysTasks,
  setTodaysTasks,
  setNewlyCreatedTaskId,
}) => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [selectedId, setSelectedId] = useState("");
  const [showSignIn, setShowSignIn] = useState(false);
  const [showNoTasksHint, setShowNoTasksHint] = useState(false);

  // auto-hide hint after a few seconds
  useEffect(() => {
    if (!showNoTasksHint) return;
    const tId = setTimeout(() => setShowNoTasksHint(false), 3000);
    return () => clearTimeout(tId);
  }, [showNoTasksHint]);

  // fetch latest tasks if parent didn't provide fresh data
  const { data: tasksData = [], isLoading } = useQuery({
    queryKey: ["tasks"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tasks")
        .select("id, description, isToday")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    staleTime: 60 * 1000,
    retry: false,
    refetchOnWindowFocus: false,
  });

  const sourceTasks = Array.isArray(tasks) && tasks.length ? tasks : tasksData;

  const nonSelectedTasks = sourceTasks.filter(
    (task) => !todaysTasks.some((t) => String(t.id) === String(task.id))
  );

  const handleSelectChange = async (e) => {
    if (!user) {
      setShowSignIn(true);
      return;
    }
    const taskId = e.target.value;
    setSelectedId(taskId);

    try {
      // update the selected task to be today's task with order 0
      const { data, error } = await supabase
        .from("tasks")
        .update({ isToday: true, order: 0 })
        .eq("id", taskId)
        .select()
        .single();

      if (error) throw error;

      // update UI immediately
      setTodaysTasks((prev) => [data, ...prev]);
      // notify parent that a new task was added so PomodoroSection can react if needed
      if (typeof setNewlyCreatedTaskId === "function") setNewlyCreatedTaskId(data.id);
      setSelectedId("");
    } catch (err) {
      console.log("❌ Error adding selected task:", err?.message ?? err);
      if (!user) setShowSignIn(true);
    }
  };

  // onFocus handler for the select: show sign-in modal for unauthenticated users,
  // or a small reddish hint for authenticated users with no available tasks
  const handleFocus = () => {
    if (!user) {
      setShowSignIn(true);
      return;
    }
    if (!nonSelectedTasks || nonSelectedTasks.length === 0) {
      setShowNoTasksHint(true);
    }
  };

  return (
    <div className="mb-6 mt-4">
      <label className="block text-sm font-semibold text-[#4b2e2e] mb-2">
        {t("select_task_label")}
      </label>

      {isLoading && (!tasks || tasks.length === 0) ? (
        <div className="text-sm text-gray-500">{t("loading_tasks")}</div>
      ) : (
        <>
          <select
            value={selectedId}
            onChange={handleSelectChange}
            onFocus={handleFocus}
            className="w-full bg-white border border-[#f4e1e6] rounded-md px-4 py-2 text-sm text-[#4b2e2e] shadow-sm focus:ring-2 focus:ring-[#b33a3a] focus:outline-none transition"
          >
            <option value="">{t("select_option_placeholder")}</option>
            {nonSelectedTasks.map((task) => (
              <option key={task.id} value={task.id}>
                {task.description}
              </option>
            ))}
          </select>

          {showNoTasksHint && (
            <div className="mt-2 text-sm text-[#b33a3a] bg-[#fff4f4] border border-[#f4e1e6] inline-block px-3 py-1 rounded">
              {t("no_existing_tasks_hint")}
            </div>
          )}
        </>
      )}

      <SignInModal open={showSignIn} onClose={() => setShowSignIn(false)} />
    </div>
  );
};

export default SelectExistingTask;
