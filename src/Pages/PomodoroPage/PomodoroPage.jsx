import React, { useState } from "react";
import PomodoroSection from "./PomodoroSection";
import TaskSection from "./TaskSection/TaskSection";
import FinishedTasksSection from "./FinishedTasksSection";
import supabase from "../../utils/supabase";

const PomodoroPage = () => {
  const [tasks, setTasks] = useState([]);
  const [todaysTasks, setTodaysTasks] = useState([]);
  const [selectedTaskId, setSelectedTaskId] = useState("");

  // 🧠 Only fetch once
  const [hasFetched, setHasFetched] = useState(false);
  if (!hasFetched) {
    fetchTasks(); // manually call
    setHasFetched(true);
  }

  async function fetchTasks() {
    try {
      const { data: allTasks, error } = await supabase
        .from("tasks")
        .select("*");

      if (error) {
        console.error("❌ Supabase error:", error.message);
        return;
      }

      console.log("✅ Fetched all tasks:", allTasks);

      const todayFiltered = (allTasks || []).filter((task) => task.isToday);
      console.log("🌞 Today's tasks (isToday === true):", todayFiltered);

      if (allTasks?.length === 0) {
        console.warn("⚠️ No tasks found in the 'tasks' table.");
      }

      if (todayFiltered.length === 0) {
        console.warn("⚠️ No tasks are marked as 'isToday' == true.");
      }

      setTasks(allTasks || []);
      setTodaysTasks(todayFiltered);
    } catch (err) {
      console.error("❌ Unexpected fetch error:", err.message);
    }
  }

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
