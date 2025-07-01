import React, { useEffect, useRef, useState } from "react";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

const PomodoroSection = () => {
  const pomodoroSessionArray = [
    { sessionName: "focus", seconds: 10 }, // 1500 = 25min
    { sessionName: "short", seconds: 3 }, // 300 = 5min
    { sessionName: "long", seconds: 5 }, // 900 = 15min
  ];

  const [currentSession, setCurrentSession] = useState(pomodoroSessionArray[0]);
  const [focusLoop, setFocusLoop] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(currentSession.seconds);
  const [isRunning, setIsRunning] = useState(false);
  const [shouldTransition, setShouldTransition] = useState(false);
  const timerRef = useRef(null);

  // Format MM:SS
  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const sec = secs % 60;
    return `${mins.toString().padStart(2, "0")}:${sec
      .toString()
      .padStart(2, "0")}`;
  };

  // Countdown
  useEffect(() => {
    if (!isRunning) return;

    timerRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          setShouldTransition(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [isRunning]);

  // Session transition
  useEffect(() => {
    if (!shouldTransition) return;
    setShouldTransition(false);
    setIsRunning(false);

    if (currentSession.sessionName === "focus") {
      const newLoop = focusLoop + 1;
      setFocusLoop(newLoop);
      if (newLoop % 4 === 0) {
        setCurrentSession(pomodoroSessionArray[2]);
        setSecondsLeft(pomodoroSessionArray[2].seconds);
      } else {
        setCurrentSession(pomodoroSessionArray[1]);
        setSecondsLeft(pomodoroSessionArray[1].seconds);
      }
    } else {
      setCurrentSession(pomodoroSessionArray[0]);
      setSecondsLeft(pomodoroSessionArray[0].seconds);
    }
  }, [shouldTransition]);

  useEffect(() => {
    console.log("🔄 Session:", currentSession.sessionName);
  }, [currentSession]);

  const handleStart = () => setIsRunning(true);
  const handlePause = () => setIsRunning(false);

  const handleSkip = () => {
    clearInterval(timerRef.current);
    setShouldTransition(true);
  };

  const percentage =
    ((currentSession.seconds - secondsLeft) / currentSession.seconds) * 100;

  return (
    <section className="w-full max-w-2xl mx-auto px-6 pt-0 pb-10 flex flex-col items-center text-center space-y-6">
      {/* Static task name */}
      <h1 className="text-2xl font-bold text-[#4b2e2e] tracking-wide mb-2">
        Current Task: Build Pomodoro Timer
      </h1>

      {/* Session label */}
      <h2 className="text-lg font-semibold text-[#b33a3a] tracking-widest uppercase">
        {currentSession.sessionName} session
      </h2>

      {/* Circular Timer */}
      <div className="w-[200px] md:w-[240px] lg:w-[260px]">
        <CircularProgressbar
          value={percentage}
          text={formatTime(secondsLeft)}
          strokeWidth={10}
          styles={buildStyles({
            textColor: "#4b2e2e",
            pathColor: "#b33a3a",
            trailColor: "#f8d8d8",
            textSize: "1.7rem", // previously 1.5rem
          })}
        />
      </div>

      {/* Motivational Quote */}
      <blockquote className="mt-4 italic text-[#4b2e2e] text-base opacity-90 font-[cursive] max-w-sm">
        “Your future is created by what you do today, not tomorrow.”
      </blockquote>

      {/* Main Buttons */}
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

      {/* Skip + Completed count */}
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
  );
};

export default PomodoroSection;
