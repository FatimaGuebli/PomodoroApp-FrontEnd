import React, { useState } from "react";
import supabase from "../utils/supabase";

const AddNewTask = ({
  tasks,
  setTasks,
  setTodaysTasks,
  goals,
  setGoals,
  setNewlyCreatedTaskId,
}) => {
  const [taskDescription, setTaskDescription] = useState("");
  const [pomodoroNumber, setPomodoroNumber] = useState(1);
  const [selectedGoal, setSelectedGoal] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleIncrease = () => setPomodoroNumber((prev) => prev + 1);
  const handleDecrease = () =>
    setPomodoroNumber((prev) => (prev > 1 ? prev - 1 : prev));

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!taskDescription.trim()) {
      alert("Please enter a task description.");
      return;
    }

    setIsSubmitting(true);

    try {
      // 🧠 Step 1: Shift all current today's tasks (order++) to make space
      const { error: reorderError } = await supabase
        .from("tasks")
        .update({ order: supabase.raw("order + 1") })
        .eq("isToday", true);

      if (reorderError) throw reorderError;

      // 🧠 Step 2: Create new task with order = 0
      const payload = {
        description: taskDescription,
        pomodorosNumber: pomodoroNumber,
        pomodorosDone: 0,
        isToday: true,
        isFinished: false,
        goal_id: selectedGoal || null,
        order: 0,
      };

      const { data, error } = await supabase
        .from("tasks")
        .insert([payload])
        .select()
        .single();

      if (error) {
        alert("Insert failed: " + error.message);
        return;
      }

      // 🧠 Step 3: Update UI state
      setTasks((prev) => [data, ...prev]);
      setTodaysTasks((prev) => [data, ...prev]);
      setNewlyCreatedTaskId(data.id); // ✨ Highlight trigger

      // 🧹 Reset inputs
      setTaskDescription("");
      setPomodoroNumber(1);
      setSelectedGoal("");
    } catch (err) {
      alert("Unexpected error: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-[#fff4f4] p-6 rounded-xl shadow-md border border-[#f4e1e6] space-y-5"
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
            onClick={handleDecrease}
            className="bg-[#f4e1e6] text-[#b33a3a] px-3 py-1 rounded-md font-bold hover:bg-[#f2cfd7]"
          >
            -
          </button>
          <span className="text-lg font-semibold text-[#4b2e2e]">
            {pomodoroNumber}
          </span>
          <button
            type="button"
            onClick={handleIncrease}
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
          onChange={(e) => setSelectedGoal(e.target.value)}
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
        disabled={isSubmitting}
        className={`w-full mt-4 py-2 px-4 rounded-md shadow-md transition text-white ${
          isSubmitting
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-[#b33a3a] hover:bg-[#912d2d]"
        }`}
      >
        {isSubmitting ? "Creating..." : "Create Task"}
      </button>
    </form>
  );
};

export default AddNewTask;
