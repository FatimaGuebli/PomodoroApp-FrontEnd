import React from "react";
import PomodoroSection from "./PomodoroSection";
import TaskSection from "./TaskSection/TaskSection";
import FinishedTasksSection from "./FinishedTasksSection";

const PomodoroPage = () => {
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
        <PomodoroSection />
      </section>

      {/* 📋 Task Section */}
      <section className="w-full max-w-4xl bg-white shadow-md rounded-xl p-6 border border-[#f3d3da]">
        <TaskSection />
      </section>

      {/* ✅ Finished Tasks */}
      <section className="w-full max-w-4xl bg-[#fbe4e5] shadow-inner rounded-xl p-6 border border-[#f3cdd5]">
        <FinishedTasksSection />
      </section>
    </main>
  );
};

export default PomodoroPage;
