import React, { useState, useEffect, useRef } from "react";
import tasks from "../../assets/tasks";
import goals from "../../assets/goals";
import PomodoroSection from "./PomodoroSection";
import TaskSection from "./TaskSection";
import FinishedTasksSection from "./FinishedTasksSection";

const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, "0")} : ${String(secs).padStart(2, "0")}`;
};

const getGoalName = (taskId) => {
  const goal = goals.find(
    (g) => Array.isArray(g.tasks) && g.tasks.includes(taskId)
  );
  return goal ? goal.name : null;
};

const defaultDurations = {
  focus: 1500,
  shortBreak: 300,
  longBreak: 600,
};

const PomodoroPage = () => {
  const today = new Date().toISOString().split("T")[0];
  const [todayTasks, setTodayTasks] = useState(() =>
    tasks.filter((task) => task.reminder.startsWith(today))
  );
  const [currentTask, setCurrentTask] = useState(null);
  const [finishedTasks, setFinishedTasks] = useState([]);
  const [secondsLeft, setSecondsLeft] = useState(defaultDurations.focus);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [showSkipConfirm, setShowSkipConfirm] = useState(false);
  const [sessionType, setSessionType] = useState("focus");
  const [pomodoroCycle, setPomodoroCycle] = useState(1);

  const timerRef = useRef(null);

  // Start timer
  const startTimer = () => {
    if (!currentTask || isRunning) return;
    setIsRunning(true);
    setIsPaused(false);
  };

  // Pause timer
  const pauseTimer = () => {
    setIsRunning(false);
    setIsPaused(true);
  };

  // Resume
  const resumeTimer = () => {
    if (!currentTask || isRunning) return;
    setIsRunning(true);
    setIsPaused(false);
  };

  // Reset timer
  const resetTimer = () => {
    setIsRunning(false);
    setIsPaused(false);
    setSecondsLeft(defaultDurations.focus);
  };

  // Select a task
  const handleTaskSelect = (task) => {
    resetTimer();
    setCurrentTask(task);
    setSessionType("focus");
    setPomodoroCycle(1);
    setSecondsLeft(defaultDurations.focus);
  };

  const updateTodayTask = (updatedTask) => {
    setTodayTasks((prev) =>
      prev.map((task) => (task.id === updatedTask.id ? updatedTask : task))
    );
  };

  const skipAndMarkDone = () => {
    if (!currentTask) return;

    const updated = {
      ...currentTask,
      pomodorosDone: currentTask.pomodorosDone + 1,
    };

    updateTodayTask(updated);

    if (updated.pomodorosDone >= updated.pomodoroNumbers) {
      setFinishedTasks((prev) => [...prev, updated]);
      setTodayTasks((prev) => prev.filter((t) => t.id !== updated.id));
      setCurrentTask(null);
    } else {
      setCurrentTask(updated);
    }

    setSessionType("focus");
    setSecondsLeft(defaultDurations.focus);
    setIsRunning(false);
    setIsPaused(false);
  };

  const endFocusSession = () => {
    if (!currentTask) return;

    const updated = {
      ...currentTask,
      pomodorosDone: currentTask.pomodorosDone + 1,
    };

    updateTodayTask(updated);

    if (updated.pomodorosDone >= updated.pomodoroNumbers) {
      setFinishedTasks((prev) => [...prev, updated]);
      setTodayTasks((prev) => prev.filter((t) => t.id !== updated.id));
      setCurrentTask(null);
    } else {
      setCurrentTask(updated);
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

    setIsRunning(false);
    setIsPaused(false);
  };

  const endBreakSession = () => {
    setSessionType("focus");
    setSecondsLeft(defaultDurations.focus);
    setIsRunning(false);
    setIsPaused(false);
  };

  // Main timer logic using useEffect
  useEffect(() => {
    if (!isRunning) {
      clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          if (sessionType === "focus") {
            endFocusSession();
          } else {
            endBreakSession();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [isRunning, sessionType]);

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

      <FinishedTasksSection finishedTasks={finishedTasks} />
    </div>
  );
};

export default PomodoroPage;
