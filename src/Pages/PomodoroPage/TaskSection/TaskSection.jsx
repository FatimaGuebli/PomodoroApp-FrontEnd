import React, { useState } from "react";
import DisplayTodaysTasks from "./DisplayTodaysTasks";
import AddNewTask from "../../../components/AddNewTask";
import SelectExistingTask from "./SelectexistingTask";

const TaskSection = () => {
  //new task button
  const [newTaskButtonState, setNewtaskButtonState] = useState(false);
  const handleClickNewTaskButton = () => {
    const currenState = newTaskButtonState;
    setNewtaskButtonState(!currenState);
  };

  //add the new task to be displayed in todaystasksList
  const [newtaskId, setNewtaskId] = useState();

  //select an existing task button
  const [selectExistingButtonState, setSelectExistingButtonState] =
    useState(false);

  const handleClickSelectAnExistingTaskButton = () => {
    const currentState = selectExistingButtonState;
    setSelectExistingButtonState(!currentState);
  };
  //array of the existing selected task
  const [SelectedTask, setSelectedTask] = useState([]);
  return (
    <section>
      <h2>Today's Tasks</h2>
      <div>
        <button onClick={handleClickNewTaskButton}>new task</button>
        {newTaskButtonState && <AddNewTask setNewtaskId={setNewtaskId} />}
        <button onClick={handleClickSelectAnExistingTaskButton}>
          add an existing task
        </button>
        {selectExistingButtonState && (
          <SelectExistingTask setSelectedTask={setSelectedTask} />
        )}
      </div>
      <div>
        <DisplayTodaysTasks newtaskId={newtaskId} />
      </div>
    </section>
  );
};

export default TaskSection;
