import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../../hooks/useAuth";
import PomodoroSection from "./PomodoroSection";
import TaskSection from "./TaskSection/TaskSection";
import FinishedTasksSection from "./FinishedTasksSection";
import supabase from "../../utils/supabase";

// fetch tasks from Supabase
const fetchTasks = async () => {
  const { data, error } = await supabase.from("tasks").select("*");
  if (error) throw new Error(error.message);
  return data;
};

const PomodoroPage = (props) => {
  const [selectedTaskId, setSelectedTaskId] = useState("");
  const [todaysTasks, setTodaysTasks] = useState([]);
  const { user } = useAuth();
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);

  // React Query -> source of truth for remote data
  const { data: queryTasks = [], isLoading, isError, error } = useQuery({
    queryKey: ["tasks"],
    queryFn: fetchTasks,
  });

  // local state that children can update via setTasks
  const [tasksState, setTasks] = useState([]);

  // keep local tasksState synced with query results
  useEffect(() => {
    setTasks(Array.isArray(queryTasks) ? queryTasks : []);
  }, [queryTasks]);

  // compute today's tasks derivation
  useEffect(() => {
    // Always refresh today's tasks when tasksState changes (ensures pomodorosDone updates show)
    const today = tasksState.filter((task) => task.isToday);
    setTodaysTasks(today);
  }, [tasksState]);

  const selectedTask = tasksState.find((task) => task.id === selectedTaskId);

  const { data: quotes = [] } = useQuery({
    queryKey: ["userQuotes", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from("quotes")
        .select("id, content")
        .eq("user_id", user.id)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
    staleTime: 60 * 1000,
  });

  // rotate every 5 minutes
  useEffect(() => {
    if (!quotes || quotes.length === 0) return;
    // reset index if out of bounds
    setCurrentQuoteIndex((i) => (i >= quotes.length ? 0 : i));
    const interval = setInterval(() => {
      setCurrentQuoteIndex((i) => {
        const next = (i + 1) % quotes.length;
        return next;
      });
    }, 300000); // 5 minutes
    return () => clearInterval(interval);
  }, [quotes]);

  const currentQuote = quotes && quotes.length ? quotes[currentQuoteIndex]?.content : "";

  if (isLoading)
    return <div className="text-center mt-10">⏳ Loading tasks...</div>;

  if (isError)
    return (
      <div className="text-center mt-10 text-red-600">❌ {error.message}</div>
    );

  return (
    <main className="flex flex-col items-center space-y-10 min-h-screen m-0 p-0 bg-[#fef9f4]">
      {/* Pomodoro Section — pass tasksState and setTasks so PomodoroSection can update local list */}
      <section className="w-full max-w-2xl bg-[#fcebea] rounded-3xl shadow-lg border border-[#f8d8d8] p-6">
        <PomodoroSection
          selectedTask={selectedTask}
          tasks={tasksState}
          setTasks={setTasks}
          setSelectedTask={(task) => setSelectedTaskId(task ? task.id : "")}
        />
      </section>

      {/* Task List Section */}
      <section className="w-full max-w-4xl bg-white shadow-md rounded-xl p-6 border border-[#f3d3da]">
        <TaskSection
          tasks={tasksState}
          todaysTasks={todaysTasks}
          setTodaysTasks={setTodaysTasks}
          selectedTaskId={selectedTaskId}
          setSelectedTaskId={setSelectedTaskId}
        />
      </section>

      {/* Finished Tasks Section */}
      {/*
        <section className="w-full max-w-4xl bg-[#fbe4e5] shadow-inner rounded-xl p-6 border border-[#f3cdd5]">
          <FinishedTasksSection />
        </section>
       */}
      
    </main>
  );
};

export default PomodoroPage;
