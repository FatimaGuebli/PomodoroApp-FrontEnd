import React, { useEffect, useState } from "react";

const SelectExistingTask = ({ tasks, todaysTasks, setTodaysTasks }) => {
  const [selectedId, setSelectedId] = useState("");

  const nonSelectedTasks = tasks.filter(
    (task) => !todaysTasks.some((t) => String(t.id) === String(task.id))
  );

  const handleSelectChange = async (e) => {
    const taskId = e.target.value;
    setSelectedId(taskId);

    try {
      await fetch("http://localhost:3001/todaystasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: String(taskId) }),
      });

      setTodaysTasks((prev) => [...prev, { id: String(taskId) }]);
      setSelectedId("");
    } catch (error) {
      console.log("Error adding selected task:", error.message);
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
