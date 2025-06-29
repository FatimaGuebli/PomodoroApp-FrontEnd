import React, { useEffect, useState } from "react";

const DisplayTodaysTasks = ({ newtaskId }) => {
  //fetchtodaystasks is into an array
  const [todaysTasksList, setTodaysTasksList] = useState([]);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("http://localhost:3001/todaystasks");
        if (!response.ok) {
          throw Error("data from TodaysTasks is not fetchd properly");
        }

        const todaysTasksArray = await response.json();
        setTodaysTasksList(todaysTasksArray);
        //console
        //console.log("fetched : ", todaysTasksArray);
      } catch (err) {
        console.log(err.message);
      }
    };

    setTimeout(() => {
      (async () => await fetchData())();
    }, 2000);
  }, []);

  //fetch all tasks & then filter them to have todays tasks
  const [tasksList, setTasksList] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("http://localhost:3001/tasks");
        if (!response.ok) {
          throw Error("data from TodaysTasks is not fetchd properly");
        }

        const tasksArray = await response.json();
        setTasksList(tasksArray);

        //console
        //console.log(tasksArray);

        setTasksList(tasksArray);
      } catch (err) {
        console.log(err.message);
      }
    };

    setTimeout(() => {
      (async () => await fetchData())();
    }, 2000);
  }, [tasksList]);

  //filter the tasks to have todaystasks
  const todaysTasks = tasksList.filter((task) =>
    todaysTasksList.some((t) => t.id === task.id)
  );

  //if a new task was created it will be displayed in today's tasks array
  useEffect(() => {
    if (!newtaskId) return;

    const updateTodaysTasks = async () => {
      try {
        const response = await fetch("http://localhost:3001/todaystasks");
        const todaysTasks = await response.json();

        const alreadyExists = todaysTasks.some((t) => t.id === newtaskId);
        if (!alreadyExists) {
          await fetch("http://localhost:3001/todaystasks", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: newtaskId }),
          });
        }
      } catch (err) {
        console.log(
          "error updating the todays tasks array while adding the new created task, error : ",
          err.message
        );
      }
    };

    updateTodaysTasks();
  }, [newtaskId]);

  return (
    <div>
      <ul>
        {todaysTasks.map((task) => (
          <li key={task.id}>{task.description}</li>
        ))}
      </ul>
    </div>
  );
};

export default DisplayTodaysTasks;
