import React, { useState, useEffect } from "react";
import DisplayTodaysTasks from "./DisplayTodaysTasks";
import AddNewTask from "../../../components/AddNewTask";
import SelectExistingTask from "./SelectExistingTask";
import supabase from "../../../utils/supabase";
import { useTranslation } from "react-i18next";

const TaskSection = ({
  tasks,
  setTasks,
  todaysTasks,
  setTodaysTasks,
  selectedTaskId,
  setSelectedTaskId,
}) => {
  const { t } = useTranslation();
  const [goals, setGoals] = useState([]);
  const [newTaskButtonState, setNewTaskButtonState] = useState(false);
  const [selectExistingButtonState, setSelectExistingButtonState] =
    useState(false);
  const [refreshTodayTasks, setRefreshTodayTasks] = useState(false);
  const [newlyCreatedTaskId, setNewlyCreatedTaskId] = useState(null); // ✨

  useEffect(() => {
    const fetchGoals = async () => {
      try {
        const { data, error } = await supabase.from("goals").select("*");
        if (error) throw error;
        setGoals(data);
      } catch (err) {
        console.error("❌ Failed to fetch goals:", err.message);
      }
    };
    fetchGoals();
  }, []);

  const handleSelectExistingButton = () => {
    setSelectExistingButtonState((prev) => {
      if (!prev) setNewTaskButtonState(false);
      return !prev;
    });
  };

  const handleNewTaskButton = () => {
    setNewTaskButtonState((prev) => {
      if (!prev) setSelectExistingButtonState(false);
      return !prev;
    });
  };

  return (
    <section className="space-y-6">
      <h2 className="text-2xl font-bold text-[#b33a3a] mb-2">
        {t("todays_tasks")}
      </h2>

      <div className="flex gap-4 flex-wrap mb-4">
        <button onClick={handleNewTaskButton} className="btn-primary w-50">
          {t("new_task")}
        </button>
        <button
          onClick={handleSelectExistingButton}
          className="btn-primary w-60"
        >
          {t("add_existing_task")}
        </button>
      </div>

      <div className="space-y-4">
        {newTaskButtonState && (
          <div className="soft-panel">
            <AddNewTask
              tasks={tasks}
              setTasks={setTasks}
              setTodaysTasks={setTodaysTasks}
              goals={goals}
              setGoals={setGoals}
              setRefreshTodayTasks={setRefreshTodayTasks}
              setNewlyCreatedTaskId={setNewlyCreatedTaskId} // ✨
              createdInPomodoro={true}
            />
          </div>
        )}
        {selectExistingButtonState && (
          <div className="soft-panel">
            <SelectExistingTask
              tasks={tasks}
              todaysTasks={todaysTasks}
              setTodaysTasks={setTodaysTasks}
              setRefreshTodayTasks={setRefreshTodayTasks}
              setNewlyCreatedTaskId={setNewlyCreatedTaskId} // ✨ Add this line
            />
          </div>
        )}
      </div>

      <div className="soft-panel">
        <DisplayTodaysTasks
          todaysTasks={todaysTasks}
          setTodaysTasks={setTodaysTasks}
          selectedId={selectedTaskId}
          setSelectedId={setSelectedTaskId}
        />
      </div>
    </section>
  );
};

export default TaskSection;
