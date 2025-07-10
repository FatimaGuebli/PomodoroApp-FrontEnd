import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import PomodoroSection from "./PomodoroSection";
import TaskSection from "./TaskSection/TaskSection";
import FinishedTasksSection from "./FinishedTasksSection";
import supabase from "../../utils/supabase";

// 🔄 Fetch all tasks from Supabase
const fetchTasks = async () => {
  const { data, error } = await supabase.from("tasks").select("*");
  if (error) throw new Error(error.message);
  return data;
};

const PomodoroPage = () => {
  const [selectedTaskId, setSelectedTaskId] = useState("");
  const [todaysTasks, setTodaysTasks] = useState([]);

  // 📦 Load tasks using React Query
  const {
    data: tasks = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["tasks"],
    queryFn: fetchTasks,
  });

  // ✅ Safely sync todaysTasks only if IDs actually changed
  useEffect(() => {
    const today = tasks.filter((task) => task.isToday);

    setTodaysTasks((prev) => {
      const prevIds = prev
        .map((t) => t.id)
        .sort()
        .join(",");
      const nextIds = today
        .map((t) => t.id)
        .sort()
        .join(",");
      return prevIds !== nextIds ? today : prev;
    });
  }, [tasks]);

  const selectedTask = tasks.find((task) => task.id === selectedTaskId);

  if (isLoading)
    return <div className="text-center mt-10">⏳ Loading tasks...</div>;

  if (isError)
    return (
      <div className="text-center mt-10 text-red-600">❌ {error.message}</div>
    );

  return (
    <main className="flex flex-col items-center space-y-10 min-h-screen px-4 py-10 bg-[#fef9f4]">
      {/* 🍅 Pomodoro Section */}
      <section className="w-full max-w-2xl bg-[#fcebea] rounded-3xl shadow-lg border border-[#f8d8d8] p-6">
        <PomodoroSection selectedTask={selectedTask} tasks={tasks} />
      </section>

      {/* 📋 Task List Section */}
      <section className="w-full max-w-4xl bg-white shadow-md rounded-xl p-6 border border-[#f3d3da]">
        <TaskSection
          tasks={tasks}
          todaysTasks={todaysTasks}
          setTodaysTasks={setTodaysTasks}
          selectedTaskId={selectedTaskId}
          setSelectedTaskId={setSelectedTaskId}
        />
      </section>

      {/* ✅ Finished Tasks Section */}
      <section className="w-full max-w-4xl bg-[#fbe4e5] shadow-inner rounded-xl p-6 border border-[#f3cdd5]">
        <FinishedTasksSection />
      </section>
    </main>
  );
};

export default PomodoroPage;
