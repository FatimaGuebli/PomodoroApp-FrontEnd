import React, { useEffect, useState } from "react";
import PomodoroSection from "./PomodoroSection";
import TaskSection from "./TaskSection/TaskSection";
import FinishedTasksSection from "./FinishedTasksSection";

const PomodoroPage = () => {
  const [tasks, setTasks] = useState([]);
  const [todaysTasks, setTodaysTasks] = useState([]);
  const [selectedTaskId, setSelectedTaskId] = useState("");

  // Fetch tasks and today's tasks once
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [taskRes, todayRes] = await Promise.all([
          fetch("http://localhost:3001/tasks"),
          fetch("http://localhost:3001/todaystasks"),
        ]);

        const taskData = await taskRes.json();
        const todaysData = await todayRes.json();

        setTasks(taskData);
        setTodaysTasks(todaysData);
      } catch (err) {
        console.error("❌ Error fetching data:", err.message);
      }
    };

    fetchData();
  }, []);

  const selectedTask = tasks.find((task) => task.id === selectedTaskId);

  return (
    <main
      className="
        flex flex-col items-center 
        space-y-10 md:space-y-6 lg:space-y-4 
        min-h-screen 
        px-4 py-10 
        md:py-0 lg:py-0 
        bg-[#fef9f4]
      "
    >
      {/* 🍓 Pomodoro Section */}
      <section className="w-full max-w-2xl bg-[#fcebea] rounded-3xl shadow-lg border border-[#f8d8d8] p-6 md:p-8">
        <PomodoroSection
          selectedTask={selectedTask}
          tasks={tasks}
          setTasks={setTasks}
        />
      </section>

      {/* 📋 Task Section */}
      <section className="w-full max-w-4xl bg-white shadow-md rounded-xl p-6 border border-[#f3d3da]">
        <TaskSection
          tasks={tasks}
          setTasks={setTasks}
          todaysTasks={todaysTasks}
          setTodaysTasks={setTodaysTasks}
          selectedTaskId={selectedTaskId}
          setSelectedTaskId={setSelectedTaskId}
        />
      </section>

      {/* ✅ Finished Tasks */}
      <section className="w-full max-w-4xl bg-[#fbe4e5] shadow-inner rounded-xl p-6 border border-[#f3cdd5]">
        <FinishedTasksSection />
      </section>
    </main>
  );
};

export default PomodoroPage;
