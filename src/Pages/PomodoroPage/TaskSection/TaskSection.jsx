import React, { useEffect, useState } from "react";
import DisplayTodaysTasks from "./DisplayTodaysTasks";
import AddNewTask from "../../../components/AddNewTask";
import SelectExistingTask from "./SelectexistingTask";

const TaskSection = () => {
  const [tasks, setTasks] = useState([]);
  const [todaysTasks, setTodaysTasks] = useState([]);
  const [goals, setGoals] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [taskRes, todayRes, goalsRes] = await Promise.all([
          fetch("http://localhost:3001/tasks"),
          fetch("http://localhost:3001/todaystasks"),
          fetch("http://localhost:3001/goals"),
        ]);

        const taskData = await taskRes.json();
        const todaysData = await todayRes.json();
        const goalsData = await goalsRes.json();

        setTasks(taskData);
        setTodaysTasks(todaysData);
        setGoals(goalsData);
      } catch (err) {
        console.error("Failed to fetch data:", err.message);
      }
    };

    fetchData();
  }, []);

  const [newTaskButtonState, setNewTaskButtonState] = useState(false);
  const [selectExistingButtonState, setSelectExistingButtonState] =
    useState(false);

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

      {/* Display Today's Tasks */}
      <div className="soft-panel">
        <DisplayTodaysTasks tasks={tasks} todaysTasks={todaysTasks} />
      </div>
    </section>
  );
};

export default TaskSection;
