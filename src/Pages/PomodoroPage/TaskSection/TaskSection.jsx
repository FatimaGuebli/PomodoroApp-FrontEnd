import React, { useState } from "react";
import DisplayTodaysTasks from "./DisplayTodaysTasks";
import AddNewTask from "../../../components/AddNewTask";

const TaskSection = () => {
  //new task button
  const [newTaskButtonState, setNewtaskButtonState] = useState(false);
  const handleClickNewTaskButton = () => {
    const currenState = newTaskButtonState;
    setNewtaskButtonState(!currenState);
  };

  //add the new task to be displayed in todaystasksList
  const [newtaskId, setNewtaskId] = useState();
  return (
    <section>
      <h2>Today's Tasks</h2>
      <div>
        <button onClick={handleClickNewTaskButton}>new task</button>
        {newTaskButtonState && <AddNewTask setNewtaskId={setNewtaskId} />}
        <button>add an existing task</button>
      </div>
      <div>
        <DisplayTodaysTasks newtaskId={newtaskId} />
      </div>
    </section>
  );
};

export default TaskSection;
