import React, { useState } from "react";
import PomodoroSection from "./PomodoroSection";
import TaskSection from "./TaskSection/TaskSection";
import FinishedTasksSection from "./FinishedTasksSection";
import supabase from "../../utils/supabase";

const PomodoroPage = () => {
  const [tasks, setTasks] = useState([]);
  const [todaysTasks, setTodaysTasks] = useState([]);
  const [selectedTaskId, setSelectedTaskId] = useState("");

  const [hasFetched, setHasFetched] = useState(false);
  if (!hasFetched) {
    fetchTasks();
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

      const todayFiltered = (allTasks || []).filter((task) => task.isToday);

      setTasks(allTasks || []);
      setTodaysTasks(todayFiltered);
    } catch (err) {
      console.error("❌ Unexpected fetch error:", err.message);
    }
  }

  const selectedTask = tasks.find((task) => task.id === selectedTaskId);

  return (
    <main className="flex flex-col items-center space-y-10 min-h-screen px-4 py-10 bg-[#fef9f4]">
      <section className="w-full max-w-2xl bg-[#fcebea] rounded-3xl shadow-lg border border-[#f8d8d8] p-6">
        <PomodoroSection
          selectedTask={selectedTask}
          tasks={tasks}
          setTasks={setTasks}
        />
      </section>

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

      <section className="w-full max-w-4xl bg-[#fbe4e5] shadow-inner rounded-xl p-6 border border-[#f3cdd5]">
        <FinishedTasksSection />
      </section>
    </main>
  );
};

export default PomodoroPage;
