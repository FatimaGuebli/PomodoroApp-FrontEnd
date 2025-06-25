import React from "react";
import DisplayTodaysTasks from "./DisplayTodaysTasks";

const TaskSection = () => {
  return (
    <section>
      <h2>Today's Tasks</h2>
      <div>
        <button>new task</button>
        <button>add an existing task</button>
      </div>
      <div>
        <DisplayTodaysTasks />
      </div>
    </section>
  );
};

export default TaskSection;
