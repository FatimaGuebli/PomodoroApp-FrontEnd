import React, { useEffect, useState } from "react";

const SelectExistingTask = ({ setSelectedtasks }) => {
  //selected id
  const [selectedId, setSelectedId] = useState("");

  //fetch tasks
  const [allTasks, setAllTasks] = useState([]);

  useEffect(() => {
    const fetchAllTasks = async () => {
      try {
        const response = await fetch("http://localhost:3001/tasks");

        if (!response.ok) {
          throw Error("an error fetching tasks from SelectExistingTask");
        }

        const allTasksArray = await response.json();
        setAllTasks(allTasksArray);
      } catch (error) {
        console.log(error.message);
      }
    };

    fetchAllTasks();
  }, []);

  //fetch today's task array
  const [todaysTasks, setTodaysTasks] = useState([]);

  useEffect(() => {
    const fetchTodaystasks = async () => {
      try {
        const response = await fetch("http://localhost:3001/todaystasks");

        if (!response.ok) {
          throw Error("error fetching todays tasks at SelectExistingsTasks");
        }

        const todaystasksArray = await response.json();
        setTodaysTasks(todaystasksArray);
      } catch (error) {
        console.log(error.message);
      }
    };

    fetchTodaystasks();
  }, []);

  //filter non selected tasks into an array
  const nonSelectedTasks = allTasks.filter(
    (task) => !todaysTasks.some((t) => String(t.id) == String(task.id))
  );

  const handleSelectChange = async (e) => {
    const taskId = e.target.value;
    setSelectedId(taskId);

    try {
      await fetch("http://localhost:3001/todaystasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: String(taskId) }),
      });

      //notify parent
      setSelectedtasks((prev) => [...prev, taskId]);
    } catch (error) {
      console.log(`error adding a selected task before submit`);
    }
  };

  return (
    <div>
      <label>select the Task to add : </label>
      <select value={selectedId} onChange={handleSelectChange}>
        <option value="">-- select a task --</option>
        {nonSelectedTasks.map((task) => (
          <option key={task.id} value={task.id}>
            {task.description}
          </option>
        ))}
      </select>
    </div>
  );
};

export default SelectExistingTask;
