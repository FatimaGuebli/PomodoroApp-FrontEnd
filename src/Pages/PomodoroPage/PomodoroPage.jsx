import React from "react";
import PomodoroSection from "./PomodoroSection";
import TaskSection from "./TaskSection/TaskSection";
import FinishedTasksSection from "./FinishedTasksSection";

const PomodoroPage = () => {
  return (
    <main>
      <PomodoroSection />
      <TaskSection />
      <FinishedTasksSection />
    </main>
  );
};

export default PomodoroPage;
