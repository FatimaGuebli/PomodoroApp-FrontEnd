import React, { useState } from "react";
import supabase from "../../../utils/supabase";

const SelectExistingTask = ({
  tasks,
  todaysTasks,
  setTodaysTasks,
  setNewlyCreatedTaskId, // ✨ highlight trigger
}) => {
  const [selectedId, setSelectedId] = useState("");

  const nonSelectedTasks = tasks.filter(
    (task) => !todaysTasks.some((t) => String(t.id) === String(task.id))
  );

  const handleSelectChange = async (e) => {
    const taskId = e.target.value;
    setSelectedId(taskId);

    try {
      const { error } = await supabase
        .from("tasks")
        .update({ isToday: true })
        .eq("id", taskId);

      if (error) throw error;

      const fullTask = tasks.find((task) => String(task.id) === String(taskId));
      if (fullTask) {
        setTodaysTasks((prev) => [...prev, { ...fullTask, isToday: true }]);
        setNewlyCreatedTaskId(fullTask.id); // ✨ Highlight it!
      }

      setSelectedId("");
    } catch (error) {
      console.log("❌ Error adding selected task:", error.message);
    }
  };

  return (
    <div className="mb-6 mt-4">
      <label className="block text-sm font-semibold text-[#4b2e2e] mb-2">
        📌 Select a task to add:
      </label>
      <select
        value={selectedId}
        onChange={handleSelectChange}
        className="w-full bg-white border border-[#f4e1e6] rounded-md px-4 py-2 text-sm text-[#4b2e2e] shadow-sm focus:ring-2 focus:ring-[#b33a3a] focus:outline-none transition"
      >
        <option value="">-- Select a task --</option>
        {nonSelectedTasks.map((task) => (
          <option key={task.id} value={task.id}>
            {task.description}
          </option>
        ))}
      </select>
    </div>
  );
};

export default SelectExistingTask;
