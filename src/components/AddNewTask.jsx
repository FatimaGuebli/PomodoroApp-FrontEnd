import React, { useState } from "react";

const AddNewTask = ({ tasks, setTasks, setTodaysTasks, goals, setGoals }) => {
  const [taskDescription, setTaskDescription] = useState("");
  const [pomodoroNumber, setPomodoroNumber] = useState(1);
  const [selectedGoal, setSelectedGoal] = useState("");

  const handleIncreaseButton = () => {
    setPomodoroNumber((prev) => prev + 1);
  };

  const handleDecreaseButton = () => {
    setPomodoroNumber((prev) => (prev > 1 ? prev - 1 : prev));
  };

  const handleSelectGoal = (e) => {
    setSelectedGoal(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!taskDescription.trim()) {
      alert("Please fill in the task description.");
      return;
    }

    const newId =
      tasks.length > 0 ? Math.max(...tasks.map((t) => Number(t.id))) + 1 : 1;

    const newTask = {
      id: String(newId),
      description: taskDescription,
      pomodoroNumbers: pomodoroNumber,
      pomodorosDone: 0,
    };

    try {
      const response = await fetch("http://localhost:3001/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTask),
      });

      if (!response.ok) throw Error("Failed to add task");

      setTasks((prev) => [...prev, newTask]);

      await fetch("http://localhost:3001/todaystasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: String(newId) }),
      });

      setTodaysTasks((prev) => [{ id: String(newId) }, ...prev]);

      setTaskDescription("");
      setPomodoroNumber(1);
      setSelectedGoal("");

      alert("Task added successfully!");
    } catch (err) {
      console.log(err.message);
    }

    if (selectedGoal) {
      try {
        const goal = goals.find((g) => g.id === selectedGoal);

        const updatedGoal = {
          ...goal,
          tasks: [...(goal.tasks || []), newId],
        };

        const response = await fetch(`http://localhost:3001/goals/${goal.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedGoal),
        });

        if (!response.ok) {
          throw Error("Failed to update goal");
        }
      } catch (err) {
        console.log(err.message);
      }
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-6 bg-[#fff4f4] p-6 rounded-xl shadow-md border border-[#f4e1e6] space-y-5"
    >
      <div>
        <label className="block text-[#4b2e2e] font-medium mb-1">
          📝 Task Description
        </label>
        <input
          required
          value={taskDescription}
          onChange={(e) => setTaskDescription(e.target.value)}
          className="w-full px-4 py-2 border border-[#f4e1e6] rounded-md text-[#4b2e2e] shadow-sm focus:outline-none focus:ring-2 focus:ring-[#b33a3a]"
          placeholder="e.g. Study Genki Lesson 5"
        />
      </div>

      <div>
        <label className="block text-[#4b2e2e] font-medium mb-1">
          🍅 Pomodoro Count
        </label>
        <div className="flex items-center space-x-4">
          <button
            type="button"
            onClick={handleDecreaseButton}
            className="bg-[#f4e1e6] text-[#b33a3a] px-3 py-1 rounded-md font-bold hover:bg-[#f2cfd7]"
          >
            -
          </button>
          <span className="text-lg font-semibold text-[#4b2e2e]">
            {pomodoroNumber}
          </span>
          <button
            type="button"
            onClick={handleIncreaseButton}
            className="bg-[#f4e1e6] text-[#b33a3a] px-3 py-1 rounded-md font-bold hover:bg-[#f2cfd7]"
          >
            +
          </button>
        </div>
      </div>

      <div>
        <label className="block text-[#4b2e2e] font-medium mb-1">
          🎯 Assign to Goal
        </label>
        <select
          value={selectedGoal}
          onChange={handleSelectGoal}
          className="w-full px-4 py-2 border border-[#f4e1e6] rounded-md text-[#4b2e2e] shadow-sm focus:outline-none focus:ring-2 focus:ring-[#b33a3a]"
        >
          <option value="">No goal selected</option>
          {goals.map((goal) => (
            <option key={goal.id} value={goal.id}>
              {goal.name}
            </option>
          ))}
        </select>
      </div>

      <button
        type="submit"
        className="btn-primary w-full mt-4 text-center text-white bg-[#b33a3a] py-2 px-4 rounded-md shadow-md hover:bg-[#912d2d] transition"
      >
        Create Task
      </button>
    </form>
  );
};

export default AddNewTask;
