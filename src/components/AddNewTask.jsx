import React, { useEffect, useState } from "react";

const AddNewTask = () => {
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
  const [goalSelected, setSelectedGoal] = useState(null);

  const handleselectGoal = (e) => {
    setSelectedGoal(e.target.value);
  };

  return (
    <form>
      <label>task description</label>
      <input />
      <label>number of pomodoros</label>
      <span>{pomodoroNumber} </span>
      <button type="button" onClick={handleIncreaseButton}>
        +
      </button>
      <button type="button" onClick={handleDecreaseButton}>
        -
      </button>
      <label>select a goal</label>
      <select value={selectGoalId} onChange={handleselectGoal}>
        <option></option>
      </select>
    </form>
  );
};

export default AddNewTask;
