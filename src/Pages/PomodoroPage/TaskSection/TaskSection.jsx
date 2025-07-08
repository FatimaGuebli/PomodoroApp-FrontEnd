import React, { useState, useEffect } from "react";
import DisplayTodaysTasks from "./DisplayTodaysTasks";
import AddNewTask from "../../../components/AddNewTask";
import SelectExistingTask from "./SelectexistingTask";
import supabase from "../../../utils/supabase";

const TaskSection = ({
  tasks,
  setTasks,
  todaysTasks,
  setTodaysTasks,
  selectedTaskId,
  setSelectedTaskId,
}) => {
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
      <h2 className="text-2xl font-bold text-[#b33a3a] mb-2">Today's Tasks</h2>

      <div className="flex gap-4 flex-wrap mb-4">
        <button onClick={handleNewTaskButton} className="btn-primary w-50">
          New Task
        </button>
        <button
          onClick={handleSelectExistingButton}
          className="btn-primary w-60"
        >
          Add Existing Task
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
          tasks={tasks}
          todaysTasks={todaysTasks}
          selectedId={selectedTaskId}
          setSelectedId={setSelectedTaskId}
          refreshTodayTasks={refreshTodayTasks}
          newlyCreatedTaskId={newlyCreatedTaskId} // ✨
        />
      </div>
    </section>
  );
};

export default TaskSection;
