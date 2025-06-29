import React, { useEffect, useState } from "react";

const AddNewTask = () => {
  // task description
  const [taskDescription, setTaskDescription] = useState("");

  // select pomodoro numbers for the task
  const [pomodoroNumber, setPomodoroNumber] = useState(1);

  const handleIncreaseButton = () => {
    setPomodoroNumber((prev) => prev + 1);
  };

  const handleDecreaseButton = () => {
    setPomodoroNumber((prev) => (prev > 1 ? prev - 1 : prev));
  };

  // fetch goals
  const [goalsList, setGoalsList] = useState([]);
  useEffect(() => {
    const fetchGoals = async () => {
      try {
        const response = await fetch("http://localhost:3001/goals");
        if (!response.ok) throw Error("Failed to fetch goals");
        const goals = await response.json();
        setGoalsList(goals);
      } catch (err) {
        console.log(err.message);
      }
    };

    setTimeout(() => {
      fetchGoals();
    }, 2000);
  }, []);

  // fetch tasks to calculate next ID
  const [tasksList, setTasksList] = useState([]);
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await fetch("http://localhost:3001/tasks");
        if (!response.ok) throw Error("Failed to fetch tasks");
        const tasksArray = await response.json();
        setTasksList(tasksArray);
      } catch (err) {
        console.log(err.message);
      }
    };

    setTimeout(() => {
      fetchTasks();
    }, 2000);
  }, []);

  // select a goal
  const [selectedGoal, setSelectedGoal] = useState("");

  const handleselectGoal = (e) => {
    setSelectedGoal(e.target.value);
  };

  // handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault(); // prevent page reload

    if (!taskDescription.trim()) {
      alert("Please fill in the task description.");
      return;
    }

    const newId =
      tasksList.length > 0 ? Math.max(...tasksList.map((t) => t.id)) + 1 : 1;

    const newTask = {
      id: newId,
      description: taskDescription,
      pomodoroNumbers: pomodoroNumber,
      pomodorosDone: 0,
    };

    try {
      const response = await fetch("http://localhost:3001/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTask),
      });

      if (!response.ok) throw Error("Failed to add task");
      alert("Task added successfully!");
    } catch (err) {
      console.log(err.message);
    }

    // if the task is linked to a goal
    if (selectedGoal) {
      try {
        const goal = goalsList.find((g) => g.id === selectedGoal);

        const updatedGoal = {
          ...goal,
          tasks: [...(goal.tasks || []), newId],
        };

        const response = await fetch(`http://localhost:3001/goals/${goal.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedGoal),
        });

        if (!response.ok) {
          throw Error("failed to update goal");
        }
      } catch (err) {
        console.log(err.message);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <label>Task Description</label>
      <input
        required
        value={taskDescription}
        onChange={(e) => setTaskDescription(e.target.value)}
      />

      <label>Number of Pomodoros</label>
      <span>{pomodoroNumber} </span>
      <button type="button" onClick={handleIncreaseButton}>
        +
      </button>
      <button type="button" onClick={handleDecreaseButton}>
        -
      </button>

      <label>Select a Goal</label>
      <select value={selectedGoal} onChange={handleselectGoal}>
        <option value="">No goal selected</option>
        {goalsList.map((goal) => (
          <option key={goal.id} value={goal.id}>
            {goal.name}
          </option>
        ))}
      </select>

      <button type="submit">Create Task</button>
    </form>
  );
};

export default AddNewTask;
