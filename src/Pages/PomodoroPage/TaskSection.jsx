import React from "react";

const TaskSection = ({
  todayTasks,
  currentTask,
  handleTaskSelect,
  getGoalName,
}) => {
  return (
    <section className="w-full lg:w-[28rem] space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-gray-800">Today's Tasks</h2>
        <button className="text-sm px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600">
          + New Task
        </button>
      </div>

      <div className="space-y-3">
        {todayTasks && todayTasks.length > 0 ? (
          todayTasks.map((task) => {
            const goalName = getGoalName?.(task.id);

            return (
              <div
                key={task.id}
                className={`bg-white p-4 rounded shadow transition ${
                  currentTask?.id === task.id
                    ? "ring-2 ring-green-400"
                    : "hover:ring-2 ring-blue-300"
                }`}
              >
                <div className="text-xs text-gray-500 italic mb-1">
                  {goalName ? `🎯 ${goalName}` : "📌 Independent Task"}
                </div>

                <h3 className="text-lg font-semibold text-gray-800">
                  {task.description}
                </h3>

                <p className="text-sm text-gray-600">
                  🍅 {task.pomodorosDone} / {task.pomodoroNumbers} Pomodoros
                </p>

                <p className="text-sm text-gray-600">
                  ⏰ Reminder:{" "}
                  {new Date(task.reminder).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>

                <button
                  className="mt-3 text-sm px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                  onClick={() => handleTaskSelect(task)}
                >
                  {currentTask?.id === task.id ? "Selected" : "Start"}
                </button>
              </div>
            );
          })
        ) : (
          <p className="text-gray-500 italic">No tasks scheduled for today.</p>
        )}
      </div>
    </section>
  );
};

export default TaskSection;
