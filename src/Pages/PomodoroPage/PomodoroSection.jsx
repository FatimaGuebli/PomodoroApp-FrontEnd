import React, { useEffect, useRef, useState } from "react";

const PomodoroSection = () => {
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
  const timerRef = useRef(null);

  // Handle countdown
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

  // Handle session transition (with manual start)
  useEffect(() => {
    if (!shouldTransition) return;
    setShouldTransition(false);
    setIsRunning(false); // 👈 this ensures the timer stops and Start button shows

    if (currentSession.sessionName === "focus") {
      const newFocusLoop = focusLoop + 1;
      setFocusLoop(newFocusLoop);

      if (newFocusLoop % 4 === 0) {
        setCurrentSession(pomodoroSessionArray[2]); // long break
        setSecondsLeft(pomodoroSessionArray[2].seconds);
      } else {
        setCurrentSession(pomodoroSessionArray[1]); // short break
        setSecondsLeft(pomodoroSessionArray[1].seconds);
      }
    } else {
      setCurrentSession(pomodoroSessionArray[0]); // back to focus
      setSecondsLeft(pomodoroSessionArray[0].seconds);
    }
  }, [shouldTransition]);

  // Log session change
  useEffect(() => {
    console.log("🔄 Session:", currentSession.sessionName);
  }, [currentSession]);

  // Control buttons
  const handleStart = () => setIsRunning(true);
  const handlePause = () => setIsRunning(false);

  return (
    <section>
      <h2>{currentSession.sessionName.toUpperCase()} Session</h2>
      <h4>{secondsLeft} seconds left</h4>

      {!isRunning && secondsLeft === currentSession.seconds && (
        <button onClick={handleStart}>Start</button>
      )}
      {!isRunning && secondsLeft < currentSession.seconds && (
        <button onClick={handleStart}>Resume</button>
      )}
      {isRunning && <button onClick={handlePause}>Pause</button>}

      <p>Focus Sessions Completed: {focusLoop}</p>
    </section>
  );
};

export default PomodoroSection;
