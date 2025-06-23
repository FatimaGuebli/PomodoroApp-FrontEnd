import React, { useState, useEffect, useRef } from "react";
import tasksData from "../../assets/tasks";
import goals from "../../assets/goals";
import PomodoroSection from "./PomodoroSection";
import TaskSection from "./TaskSection";

const PomodoroPage = () => {
  const today = new Date().toISOString().split("T")[0];

  const [tasks, setTasks] = useState(tasksData);
  const [todayTasks, setTodayTasks] = useState(
    tasksData.filter(
      (task) =>
        task.reminder.startsWith(today) &&
        task.pomodorosDone < task.pomodoroNumbers
    )
  );
  const [currentTask, setCurrentTask] = useState(null);
  const [finishedTasks, setFinishedTasks] = useState([]);
  const [secondsLeft, setSecondsLeft] = useState(1500);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [showSkipConfirm, setShowSkipConfirm] = useState(false);
  const [sessionType, setSessionType] = useState("focus");
  const [pomodoroCycle, setPomodoroCycle] = useState(1);

  const timerRef = useRef(null);

  const defaultDurations = {
    focus: 10, // Change to 1500 for production
    shortBreak: 3,
    longBreak: 5,
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, "0")} : ${String(secs).padStart(
      2,
      "0"
    )}`;
  };

  const getGoalName = (taskId) => {
    const goal = goals.find((g) => g.tasks?.includes(taskId));
    return goal ? goal.name : null;
  };

  const updateTaskInState = (updatedTask) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === updatedTask.id ? updatedTask : t))
    );
    setTodayTasks((prev) =>
      updatedTask.pomodorosDone >= updatedTask.pomodoroNumbers
        ? prev.filter((t) => t.id !== updatedTask.id)
        : prev.map((t) => (t.id === updatedTask.id ? updatedTask : t))
    );
  };

  const startTimer = () => {
    if (!currentTask || isRunning) return;
    setIsRunning(true);
    setIsPaused(false);
    timerRef.current = setInterval(() => {
      setSecondsLeft((prev) => prev - 1);
    }, 1000);
  };

  const pauseTimer = () => {
    clearInterval(timerRef.current);
    setIsRunning(false);
    setIsPaused(true);
  };

  const resumeTimer = () => {
    if (!currentTask || isRunning) return;
    setIsRunning(true);
    setIsPaused(false);
    timerRef.current = setInterval(() => {
      setSecondsLeft((prev) => prev - 1);
    }, 1000);
  };

  const resetTimer = () => {
    clearInterval(timerRef.current);
    setIsRunning(false);
    setIsPaused(false);
    setSecondsLeft(defaultDurations.focus);
  };

  const skipAndMarkDone = () => {
    clearInterval(timerRef.current);
    setIsRunning(false);
    setIsPaused(false);
    endFocusSession();
  };

  const handleTaskSelect = (task) => {
    resetTimer();
    setCurrentTask(task);
    setSessionType("focus");
    setPomodoroCycle(1);
    setSecondsLeft(defaultDurations.focus);
  };

  const endFocusSession = () => {
    if (!currentTask) return;

    const updatedTask = {
      ...currentTask,
      pomodorosDone: currentTask.pomodorosDone + 1,
    };

    updateTaskInState(updatedTask);

    if (updatedTask.pomodorosDone >= updatedTask.pomodoroNumbers) {
      setFinishedTasks((prev) => [...prev, updatedTask]);
      setCurrentTask(null);
    } else {
      setCurrentTask(updatedTask);
    }

    if (pomodoroCycle < 4) {
      setSessionType("shortBreak");
      setSecondsLeft(defaultDurations.shortBreak);
      setPomodoroCycle((prev) => prev + 1);
    } else {
      setSessionType("longBreak");
      setSecondsLeft(defaultDurations.longBreak);
      setPomodoroCycle(1);
    }
  };

  const endBreakSession = () => {
    if (
      currentTask &&
      currentTask.pomodorosDone < currentTask.pomodoroNumbers
    ) {
      setSessionType("focus");
      setSecondsLeft(defaultDurations.focus);
    } else {
      setCurrentTask(null);
      setSessionType("focus");
      setSecondsLeft(defaultDurations.focus);
    }
  };

  useEffect(() => {
    if (secondsLeft > 0) return;

    clearInterval(timerRef.current);
    setIsRunning(false);

    if (sessionType === "focus") {
      endFocusSession();
    } else {
      endBreakSession();
    }
  }, [secondsLeft]);

  return (
    <div className="flex flex-col lg:flex-row items-start justify-center gap-8 px-4 py-10 bg-gray-100 min-h-screen w-full">
      <PomodoroSection
        currentTask={currentTask}
        secondsLeft={secondsLeft}
        isRunning={isRunning}
        isPaused={isPaused}
        startTimer={startTimer}
        pauseTimer={pauseTimer}
        resumeTimer={resumeTimer}
        skipAndMarkDone={skipAndMarkDone}
        showSkipConfirm={showSkipConfirm}
        setShowSkipConfirm={setShowSkipConfirm}
        formatTime={formatTime}
        sessionType={sessionType}
        defaultDurations={defaultDurations}
      />

      <TaskSection
        todayTasks={todayTasks}
        currentTask={currentTask}
        handleTaskSelect={handleTaskSelect}
        getGoalName={getGoalName}
      />
    </div>
  );
};

export default PomodoroPage;
