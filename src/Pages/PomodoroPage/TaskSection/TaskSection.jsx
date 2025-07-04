import React, { useState, useEffect } from "react";
import DisplayTodaysTasks from "./DisplayTodaysTasks";
import AddNewTask from "../../../components/AddNewTask";
import SelectExistingTask from "./SelectexistingTask";

const TaskSection = ({
  tasks,
  setTasks,
  todaysTasks,
  setTodaysTasks,
  selectedTaskId,
  setSelectedTaskId,
}) => {
  const [goals, setGoals] = useState([]);

  // Local UI state for form toggles
  const [newTaskButtonState, setNewTaskButtonState] = useState(false);
  const [selectExistingButtonState, setSelectExistingButtonState] =
    useState(false);

  // Fetch goals only (tasks & today's tasks are handled in PomodoroPage)
  useEffect(() => {
    const fetchGoals = async () => {
      try {
        const res = await fetch("http://localhost:3001/goals");
        const data = await res.json();
        setGoals(data);
      } catch (err) {
        console.error("❌ Failed to fetch goals:", err.message);
      }
    };

    fetchGoals();
  }, []);

  const handleSelectExistingButton = () => {
    setSelectExistingButtonState((prev) => {
      const newState = !prev;
      if (newState) setNewTaskButtonState(false);
      return newState;
    });
  };

  const handleNewTaskButton = () => {
    setNewTaskButtonState((prev) => {
      const newState = !prev;
      if (newState) setSelectExistingButtonState(false);
      return newState;
    });
  };

  return (
    <section className="space-y-6">
      {/* Header */}
      <h2 className="text-2xl font-bold text-[#b33a3a] mb-2">Today's Tasks</h2>

      {/* Buttons */}
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

      {/* Forms */}
      <div className="space-y-4">
        {newTaskButtonState && (
          <div className="soft-panel">
            <AddNewTask
              tasks={tasks}
              setTasks={setTasks}
              setTodaysTasks={setTodaysTasks}
              goals={goals}
              setGoals={setGoals}
            />
          </div>
        )}

        {selectExistingButtonState && (
          <div className="soft-panel">
            <SelectExistingTask
              tasks={tasks}
              todaysTasks={todaysTasks}
              setTodaysTasks={setTodaysTasks}
            />
          </div>
        )}
      </div>

      {/* Display Tasks */}
      <div className="soft-panel">
        <DisplayTodaysTasks
          tasks={tasks}
          todaysTasks={todaysTasks}
          selectedId={selectedTaskId}
          setSelectedId={setSelectedTaskId}
        />
      </div>
    </section>
  );
};

export default TaskSection;
