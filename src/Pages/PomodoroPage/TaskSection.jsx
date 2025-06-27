import React, { useState } from "react";
import DisplayTodaysTasks from "./DisplayTodaysTasks";
import AddNewTask from "../../components/AddNewTask";

const TaskSection = () => {
  //new task button
  const [newTaskButtonState, setNewtaskButtonState] = useState(false);
  const handleClickNewTaskButton = () => {
    const currenState = newTaskButtonState;
    setNewtaskButtonState(!currenState);
  };
  return (
    <section>
      <h2>Today's Tasks</h2>
      <div>
        <button onClick={handleClickNewTaskButton}>new task</button>
        {newTaskButtonState && <AddNewTask />}
        <button>add an existing task</button>
      </div>
      <div>
        <DisplayTodaysTasks />
      </div>
    </section>
  );
};

export default TaskSection;
