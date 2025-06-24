import React, { useState } from "react";
import tasks from "../data/tasks";

const AddNewTask = ({ onAddTask }) => {
  const [description, setDescription] = useState("");
  const [pomodoros, setPomodoros] = useState(1);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (description === "") return;

    const generateUniqueId = () => {
      let id;
      const usedIds = tasks.map((task) => task.id);
      do {
        id = Math.floor(Math.random() * 10000); // 0 to 9999
      } while (usedIds.includes(id));
      return id;
    };

    const newTask = {
      id: generateUniqueId(),
      description,
      pomodoroNumbers: pomodoros,
      pomodorosDone: 0,
    };

    onAddTask(newTask);
    setDescription("");
    setPomodoros(1);
  };

  const increase = () => setPomodoros((prev) => prev + 1);
  const decrease = () => setPomodoros((prev) => (prev > 1 ? prev - 1 : 1));

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-md mx-auto p-4 bg-white rounded shadow space-y-4"
    >
      <div>
        <label className="block text-sm font-medium mb-1">
          Task Description:
        </label>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full border border-gray-300 rounded px-3 py-2"
          placeholder="e.g. Read chapter 5"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          Number of Pomodoros:
        </label>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={decrease}
            className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
          >
            -
          </button>
          <span className="text-lg">{pomodoros}</span>
          <button
            type="button"
            onClick={increase}
            className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
          >
            +
          </button>
        </div>
      </div>

      <button
        type="submit"
        className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
      >
        Add Task
      </button>
    </form>
  );
};

export default AddNewTask;
