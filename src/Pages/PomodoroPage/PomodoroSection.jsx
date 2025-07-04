import React, { useEffect, useRef, useState } from "react";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import Confetti from "react-confetti";
import { useWindowSize } from "@react-hook/window-size";

const PomodoroSection = ({ selectedTask }) => {
  const pomodoroSessionArray = [
    { sessionName: "focus", seconds: 10 },
    { sessionName: "short", seconds: 3 },
    { sessionName: "long", seconds: 5 },
  ];

  useEffect(() => {
    window.onerror = function (message, source, lineno, colno, error) {
      console.log("💥 Global error caught:", message, error);
    };
  }, []);

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

  useEffect(() => {
    endAudioRef.current = new Audio("/sounds/notification.mp3");
    clickSoundRef.current = new Audio("/sounds/button-click.mp3");
  }, []);

  const playClick = () => {
    clickSoundRef.current?.play().catch(() => {});
  };

  const playEndSound = () => {
    endAudioRef.current?.play().catch(() => {});
  };

  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const sec = secs % 60;
    return `${String(mins).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  };

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

  // 🧠 Snapshot task when focus session starts
  useEffect(() => {
    if (
      currentSession.sessionName === "focus" &&
      selectedTask &&
      !activeTaskSnapshot
    ) {
      console.log("📸 Snapshotting selected task:", selectedTask.description);
      setActiveTaskSnapshot(selectedTask);
    }
  }, [currentSession, selectedTask, activeTaskSnapshot]);

  useEffect(() => {
    if (!shouldTransition) return;

    const handleTransition = async () => {
      setShouldTransition(false);
      setIsRunning(false);
      playEndSound();
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 5000);

      console.log("🎯 Transitioning session:", currentSession.sessionName);

      if (currentSession.sessionName === "focus") {
        const newLoop = focusLoop + 1;
        setFocusLoop(newLoop);

        if (activeTaskSnapshot) {
          try {
            const updatedCount = (activeTaskSnapshot.pomodorosDone || 0) + 1;

            const response = await fetch(
              `http://localhost:3001/tasks/${activeTaskSnapshot.id}`,
              {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ pomodorosDone: updatedCount }),
              }
            );

            if (!response.ok) throw new Error("❌ Failed to update task");

            console.log(
              `✅ Pomodoro updated for task "${activeTaskSnapshot.description}"`
            );
          } catch (err) {
            console.error("🧨 Update error:", err.message);
          }
        }

        const next =
          newLoop % 4 === 0 ? pomodoroSessionArray[2] : pomodoroSessionArray[1];
        console.log("➡️ Switching to next session:", next.sessionName);
        setCurrentSession(next);
        setSecondsLeft(next.seconds);
      } else {
        const next = pomodoroSessionArray[0];
        console.log("🌀 Break ended. Switching to focus.");
        setCurrentSession(next);
        setSecondsLeft(next.seconds);
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
