import React, { useState } from "react";
import AddNewTask from "../../components/AddNewTask";

const TaskSection = () => {
  const [todaystasks, setTodaysTasks] = useState([]);

  //new task displays
  const [displayNewTaskForm, setDisplayNewTaskForm] = useState(false);

  const handleDisplayNewtaskForm = () => {
    const buttonstate = displayNewTaskForm;
    setDisplayNewTaskForm(!buttonstate);
  };

  const handleAddTask = (task) => {
    setTodaysTasks((prev) => [...prev, task]);
  };

  return (
    <section>
      <div>
        <h2>Today's tasks</h2>
        <div>
          <button onClick={handleDisplayNewtaskForm}>new task</button>
          <button>add an existing task to the list</button>
        </div>
        {displayNewTaskForm && <AddNewTask onAddTask={handleAddTask} />}
      </div>
    </section>
  );
};

export default TaskSection;
