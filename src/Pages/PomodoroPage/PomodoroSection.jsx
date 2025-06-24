import React, { useEffect, useRef, useState } from "react";

const PomodoroSection = () => {
  const pomodoroSessionArray = [
    { sessionName: "focus", seconds: 10 },
    { sessionName: "short", seconds: 3 },
    { sessionName: "long", seconds: 5 },
  ];
  const [currentSession, setCurrentSession] = useState(pomodoroSessionArray[0]);
  console.log(currentSession);
  const [focusLoop, setFocusLoop] = useState(0);

  //work on decreasing timer
  const [secondsLeft, setSecondsLeft] = useState(currentSession.seconds);
  const [isRunning, setIsRunning] = useState(false);
  const timeRef = useRef(null);

  useEffect(() => {
    if (!isRunning) return;

    timeRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timeRef.current);
          if (currentSession == pomodoroSessionArray[0]) {
            if (focusLoop == 4) {
              setCurrentSession(pomodoroSessionArray[2]);
              setFocusLoop(0);
            } else {
              setFocusLoop();
              setCurrentSession(pomodoroSessionArray[1]);
            }
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    //cleanup on unmount or when isRunnin changes
    return () => {
      clearInterval(timeRef.current);
    };
  }, [isRunning]);

  //buttons for timer
  const handleStart = () => {
    setIsRunning(true);
  };
  const handlePause = () => {
    setIsRunning(false);
  };
  return (
    <section>
      <h2>Focus Time</h2>
      <h4>{secondsLeft}</h4>
      {!isRunning && <button onClick={handleStart}>start/resume</button>}
      {isRunning && <button onClick={handlePause}>pause</button>}
    </section>
  );
};

export default PomodoroSection;
