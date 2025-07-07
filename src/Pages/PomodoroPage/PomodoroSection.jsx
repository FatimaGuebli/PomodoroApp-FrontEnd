import React, { useEffect, useRef, useState } from "react";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import Confetti from "react-confetti";
import { useWindowSize } from "@react-hook/window-size";
import supabase from "../../utils/supabase";

const PomodoroSection = ({ selectedTask, tasks, setTasks }) => {
  const pomodoroSessionArray = [
    { sessionName: "focus", seconds: 10 },
    { sessionName: "short", seconds: 3 },
    { sessionName: "long", seconds: 5 },
  ];

  const [currentSession, setCurrentSession] = useState(pomodoroSessionArray[0]);
  const [focusLoop, setFocusLoop] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(currentSession.seconds);
  const [isRunning, setIsRunning] = useState(false);
  const [shouldTransition, setShouldTransition] = useState(false);
  const [activeTaskSnapshot, setActiveTaskSnapshot] = useState(null);

  const timerRef = useRef(null);
  const endAudioRef = useRef(null);
  const clickSoundRef = useRef(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [width, height] = useWindowSize();

  // Preload sounds
  useEffect(() => {
    endAudioRef.current = new Audio("/sounds/notification.mp3");
    clickSoundRef.current = new Audio("/sounds/button-click.mp3");
  }, []);

  const playClick = () => clickSoundRef.current?.play().catch(() => {});
  const playEndSound = () => endAudioRef.current?.play().catch(() => {});

  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const sec = secs % 60;
    return `${String(mins).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  };

  // Timer logic
  useEffect(() => {
    if (!isRunning) return;

    timerRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          setTimeout(() => setShouldTransition(true), 0);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [isRunning]);

  // Snapshot task at start of focus
  useEffect(() => {
    if (
      currentSession.sessionName === "focus" &&
      selectedTask &&
      !activeTaskSnapshot
    ) {
      setActiveTaskSnapshot(selectedTask);
    }
  }, [currentSession, selectedTask, activeTaskSnapshot]);

  // Handle session transition
  useEffect(() => {
    if (!shouldTransition) return;

    const handleTransition = async () => {
      setShouldTransition(false);
      setIsRunning(false);
      playEndSound();

      if (currentSession.sessionName === "focus") {
        const newLoop = focusLoop + 1;
        setFocusLoop(newLoop);
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 5000);

        if (activeTaskSnapshot) {
          try {
            const updatedCount = (activeTaskSnapshot.pomodorosDone || 0) + 1;
            const { error } = await supabase
              .from("tasks")
              .update({ pomodorosDone: updatedCount })
              .eq("id", activeTaskSnapshot.id);

            if (error) throw error;

            setTasks((prev) =>
              prev.map((task) =>
                task.id === activeTaskSnapshot.id
                  ? { ...task, pomodorosDone: updatedCount }
                  : task
              )
            );
            console.log(
              `✅ Pomodoro logged for "${activeTaskSnapshot.description}"`
            );
          } catch (err) {
            console.error("🧨 Supabase update failed:", err.message);
          }
        }

        const nextSession =
          newLoop % 4 === 0 ? pomodoroSessionArray[2] : pomodoroSessionArray[1];
        setCurrentSession(nextSession);
        setSecondsLeft(nextSession.seconds);
      } else {
        // Break ended, back to focus
        setCurrentSession(pomodoroSessionArray[0]);
        setSecondsLeft(pomodoroSessionArray[0].seconds);
        setActiveTaskSnapshot(null); // Clear snapshot between focus cycles
      }
    };

    handleTransition();
  }, [shouldTransition]);

  const handleStart = () => {
    playClick();
    setIsRunning(true);
  };

  const handlePause = () => {
    playClick();
    setIsRunning(false);
  };

  const handleSkip = () => {
    clearInterval(timerRef.current);
    setShouldTransition(true);
  };

  const percentage =
    ((currentSession.seconds - secondsLeft) / currentSession.seconds) * 100;

  const taskToShow = activeTaskSnapshot || selectedTask;

  return (
    <>
      {showConfetti && (
        <Confetti
          width={width}
          height={height}
          numberOfPieces={150}
          recycle={false}
        />
      )}

      <section className="w-full max-w-2xl mx-auto px-6 pt-0 pb-10 flex flex-col items-center text-center space-y-6">
        <h1 className="text-2xl font-bold text-[#4b2e2e] tracking-wide mb-1">
          Current Task:{" "}
          {taskToShow ? (
            <span>{taskToShow.description}</span>
          ) : (
            <span className="italic text-gray-400">No task selected yet</span>
          )}
        </h1>

        <h2 className="text-lg font-semibold text-[#b33a3a] tracking-widest uppercase">
          {currentSession.sessionName} session
        </h2>

        <div className="w-[200px] md:w-[240px] lg:w-[260px]">
          <CircularProgressbar
            value={percentage}
            text={formatTime(secondsLeft)}
            strokeWidth={10}
            styles={buildStyles({
              textColor: "#4b2e2e",
              pathColor: "#b33a3a",
              trailColor: "#f8d8d8",
              textSize: "1.7rem",
            })}
          />
        </div>

        <blockquote className="mt-4 italic text-[#4b2e2e] text-base opacity-90 font-[cursive] max-w-sm">
          “Your future is created by what you do today, not tomorrow.”
        </blockquote>

        <div className="space-x-4">
          {!isRunning && secondsLeft === currentSession.seconds && (
            <button className="btn-primary px-8 py-3" onClick={handleStart}>
              Start
            </button>
          )}
          {!isRunning && secondsLeft < currentSession.seconds && (
            <button className="btn-primary px-8 py-3" onClick={handleStart}>
              Resume
            </button>
          )}
          {isRunning && (
            <button className="btn-primary px-8 py-3" onClick={handlePause}>
              Pause
            </button>
          )}
        </div>

        <div className="flex flex-col items-center space-y-2">
          <button
            className="text-sm underline text-[#912d2d] hover:text-[#b33a3a] transition-all"
            onClick={handleSkip}
          >
            Skip session?
          </button>
          <p className="text-[#4b2e2e] font-medium text-sm">
            Focus sessions completed: {focusLoop}
          </p>
        </div>
      </section>
    </>
  );
};

export default PomodoroSection;
