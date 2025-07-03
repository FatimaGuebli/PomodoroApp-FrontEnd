import React, { useEffect, useState } from "react";
import { ClockIcon } from "lucide-react"; // You can swap this icon

const DisplayTodaysTasks = ({ newtaskId }) => {
  const [todaysTasksList, setTodaysTasksList] = useState([]);
  const [tasksList, setTasksList] = useState([]);

  // Fetch todaystasks
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("http://localhost:3001/todaystasks");
        if (!response.ok)
          throw Error("data from TodaysTasks is not fetched properly");
        const todaysTasksArray = await response.json();
        setTodaysTasksList(todaysTasksArray);
      } catch (err) {
        console.log(err.message);
      }
    };
    setTimeout(fetchData, 2000);
  }, []);

  // Fetch all tasks
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("http://localhost:3001/tasks");
        if (!response.ok)
          throw Error("data from Tasks is not fetched properly");
        const tasksArray = await response.json();
        setTasksList(tasksArray);
      } catch (err) {
        console.log(err.message);
      }
    };
    setTimeout(fetchData, 2000);
  }, []);

  // Filter only today's tasks
  const todaysTasks = tasksList.filter((task) =>
    todaysTasksList.some((t) => t.id === task.id)
  );

  // Add newly created task to today's tasks
  useEffect(() => {
    if (!newtaskId) return;

    const updateTodaysTasks = async () => {
      try {
        const response = await fetch("http://localhost:3001/todaystasks");
        const todaysTasks = await response.json();
        const alreadyExists = todaysTasks.some((t) => t.id === newtaskId);
        if (!alreadyExists) {
          await fetch("http://localhost:3001/todaystasks", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: newtaskId }),
          });
        }
      } catch (err) {
        console.log("❌ Error updating today's tasks:", err.message);
      }
    };

    updateTodaysTasks();
  }, [newtaskId]);

  return (
    <div className="space-y-5">
      {todaysTasks.length === 0 ? (
        <p className="text-sm text-gray-400 italic">No tasks for today yet.</p>
      ) : (
        <ul className="space-y-4">
          {todaysTasks.map((task) => (
            <li
              key={task.id}
              className="bg-white border border-[#f4e1e6] rounded-2xl px-6 py-5 shadow-md hover:shadow-lg transition-all flex justify-between items-start gap-4"
            >
              <div className="flex items-start gap-4">
                <ClockIcon className="text-[#b33a3a] w-6 h-6 mt-1" />
                <div>
                  <h3 className="text-[#4b2e2e] font-semibold text-lg">
                    {task.description}
                  </h3>
                  <p className="text-sm text-[#7c4a4a] opacity-80 mt-1">
                    Total Pomodoros: {task.pomodoroNumbers}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-center text-sm bg-[#fce8e8] text-[#b33a3a] font-medium px-3 py-1 rounded-lg">
                {task.pomodorosDone} done
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default DisplayTodaysTasks;
