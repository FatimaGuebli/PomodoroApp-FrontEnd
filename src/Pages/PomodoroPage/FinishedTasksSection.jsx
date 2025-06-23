// components/PomodoroPage/FinishedTasksSection.jsx
import React from "react";

const FinishedTasksSection = ({ finishedTasks }) => {
  return (
    <section className="w-full lg:w-1/3 bg-white rounded-xl p-6 shadow-md h-fit">
      <h3 className="text-lg font-semibold text-gray-700 mb-4">
        ✅ Finished Tasks
      </h3>
      {finishedTasks.length > 0 ? (
        <ul className="space-y-2">
          {finishedTasks.map((task) => (
            <li
              key={task.id}
              className="text-sm text-gray-600 bg-green-50 border border-green-200 px-3 py-2 rounded"
            >
              {task.description}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-gray-400 italic">No tasks finished yet.</p>
      )}
    </section>
  );
};

export default FinishedTasksSection;
