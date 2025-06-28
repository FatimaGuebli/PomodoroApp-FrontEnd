import React, { useEffect, useState } from "react";

const AddNewTask = () => {
  //task description
  const [taskDescription, setTaskDescription] = useState("");

  //select pomodoro numbers for the task
  const [pomodoroNumber, setPomodoroNumber] = useState(1);

  const handleIncreaseButton = () => {
    const currentNumber = pomodoroNumber;
    setPomodoroNumber(currentNumber + 1);
  };

  const handleDecreaseButton = () => {
    const currentNumber = pomodoroNumber;
    if (currentNumber != 1) {
      setPomodoroNumber(currentNumber - 1);
    }
  };

  //fetch goals
  const [goalsList, setGoalsList] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("http://localhost:3001/goals");
        if (!response.ok) {
          throw Error("data from goals is not fetched properly");
        }

        const goals = await response.json();
        setGoalsList(goals);

        //console
        console.log(goals);
      } catch (err) {
        console.log(err.message);
      }
    };

    setTimeout(() => {
      (async () => await fetchData())();
    }, 2000);
  }, []);

  //select a goal
  const [selectedGoal, setSelectedGoal] = useState("");

  const handleselectGoal = (e) => {
    setSelectedGoal(e.target.value);
  };

  //handle submission
  const handleSubmit = async (e) => {
    //if task description is empty
    if (!taskDescription.trim()) {
      alert("please fill the task description input");
      return;
    }

    const [tasksList, setTasksList] = useState([]);

    //create new id for the task
    useEffect(() => {
      const fetchData = async () => {
        try {
          const response = await fetch("http://localhost:3001/tasks");
          if (!response.ok) {
            throw Error(
              "data fetched in add new task, tasks array are not fetch properly"
            );
          }

          const tasksArray = await response.json();
          setTasksList(tasksArray);
        } catch (err) {
          console.log(err.message);
        }

        fetchData();
      };

      setTimeout(() => {
        (async () => await fetchData())();
      }, 2000);
    }, []);

    const newId =
      tasksList.length > 0 ? Math.max(...tasksList.map((t) => t.id)) + 1 : 1;

    //create new task
    const newTask = {
      id: newId,
      description: taskDescription,
      pomodoroNumbers: pomodoroNumber,
      pomodorosDone: 0,
    };

    //update the new task into the data (json file currently)
    try {
      const response = await fetch("http://localhost:3001/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTask),
      });

      if (!response.ok) throw Error("Failed to add task");

      alert("Task added successfully!");
      // Optionally reset inputs here
    } catch (err) {
      console.log(err.message);
    }
  };

  return (
    <form>
      <label>task description</label>
      <input
        required
        value={taskDescription}
        onChange={(e) => setTaskDescription(e.target.value)}
      />

      <label>number of pomodoros</label>
      <span>{pomodoroNumber} </span>

      <button type="button" onClick={handleIncreaseButton}>
        +
      </button>

      <button type="button" onClick={handleDecreaseButton}>
        -
      </button>

      <label>select a goal</label>
      <select value={selectedGoal} onChange={handleselectGoal}>
        <option value="">no goal selected</option>

        {goalsList.map((goal) => (
          <option key={goal.id} value={goal.id}>
            {goal.name}
          </option>
        ))}
      </select>

      <button>create task</button>
    </form>
  );
};

export default AddNewTask;
