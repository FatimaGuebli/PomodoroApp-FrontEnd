import React from "react";
import NewGoalSection from "./NewGoalSection";
import GoalsListSection from "./GoalsListSection";
import UnassignedTasksSection from "./UnassignedTasksSection";

const GoalPage = () => {
  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Layout follows Pomodoro page style: stacked sections (one above the other) */}
      <div className="space-y-6">
        <NewGoalSection />
        <GoalsListSection />
        <UnassignedTasksSection />
      </div>
    </div>
  );
};

export default GoalPage;