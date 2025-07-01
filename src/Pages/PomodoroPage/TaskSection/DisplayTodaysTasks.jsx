import React, { useEffect, useState } from "react";

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
    setTimeout(() => {
      fetchData();
    }, 2000);
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
    setTimeout(() => {
      fetchData();
    }, 2000);
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
    <div className="space-y-4">
      {todaysTasks.length === 0 ? (
        <p className="text-sm text-gray-400 italic">No tasks for today yet.</p>
      ) : (
        <ul className="space-y-3">
          {todaysTasks.map((task) => (
            <li
              key={task.id}
              className="bg-white border border-[#f4e1e6] rounded-lg px-4 py-3 shadow-sm flex items-center justify-between hover:shadow-md transition"
            >
              <span className="text-[#4b2e2e] font-medium">
                {task.description}
              </span>
              <span className="text-xs bg-[#b33a3a] text-white px-2 py-0.5 rounded-md">
                {task.pomodorosDone}/{task.pomodoroNumbers} 🍅
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default DisplayTodaysTasks;
