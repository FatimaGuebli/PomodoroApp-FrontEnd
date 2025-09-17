import React, { useEffect, useRef, useState } from "react";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import Confetti from "react-confetti";
import { useWindowSize } from "@react-hook/window-size";
import supabase from "../../utils/supabase";

const PomodoroSection = ({ selectedTask, setSelectedTask, tasks, setTasks }) => {
  const pomodoroSessionArray = [
    { sessionName: "focus", seconds: 10 }, // use test values; replace with real durations
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

  // always snapshot at start of each focus session (refreshes for subsequent focuses)
  useEffect(() => {
    if (currentSession.sessionName === "focus" && selectedTask) {
      setActiveTaskSnapshot(selectedTask);
    }
  }, [currentSession.sessionName, selectedTask]);

  const incrementPomodoroRemote = async (task) => {
    if (!task) return;
    try {
      const before = task.pomodorosDone || 0;
      const updatedCount = before + 1;
      // try update; coerce id type if needed
      let res = await supabase
        .from("tasks")
        .update({ pomodorosDone: updatedCount })
        .eq("id", task.id)
        .select();
      if ((res.data && res.data.length === 0) || res.error) {
        if (!isNaN(Number(task.id))) {
          res = await supabase
            .from("tasks")
            .update({ pomodorosDone: updatedCount })
            .eq("id", Number(task.id))
            .select();
        }
      }
      if (res.error) {
        console.error("Supabase update error:", res.error);
      }
      // refresh local tasks list if parent provided setter
      if (typeof setTasks === "function") {
        const { data: refreshed, error: fetchErr } = await supabase.from("tasks").select("*");
        if (!fetchErr && refreshed) setTasks(refreshed);
      }
    } catch (err) {
      console.error("incrementPomodoroRemote error:", err);
    }
  };

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

        const taskToUpdate =
          (tasks || []).find((t) => String(t.id) === String(activeTaskSnapshot?.id)) ||
          activeTaskSnapshot ||
          selectedTask;

        if (taskToUpdate) {
          // optimistic local update (if setter exists)
          if (typeof setTasks === "function") {
            setTasks((prev = []) =>
              prev.map((t) =>
                String(t.id) === String(taskToUpdate.id)
                  ? { ...t, pomodorosDone: (t.pomodorosDone || 0) + 1 }
                  : t
              )
            );
          }
          await incrementPomodoroRemote(taskToUpdate);
          console.log(`✅ Pomodoro logged for "${taskToUpdate.description}"`);
        } else {
          // no task selected: we still count the completed pomodoro via focusLoop (already done)
          console.log("No task selected — completed pomodoro counted locally.");
        }

        // require user to re-select next focus task
        if (typeof setSelectedTask === "function") setSelectedTask(null);

        const nextSession = newLoop % 4 === 0 ? pomodoroSessionArray[2] : pomodoroSessionArray[1];
        setCurrentSession(nextSession);
        setSecondsLeft(nextSession.seconds);
      } else {
        // break ended: go back to focus but do NOT auto-select or auto-start
        setCurrentSession(pomodoroSessionArray[0]);
        setSecondsLeft(pomodoroSessionArray[0].seconds);
        setActiveTaskSnapshot(null); // clear snapshot on break end
      }
    };

    handleTransition();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shouldTransition]);

  const handleStart = () => {
    playClick();
    // Allow starting focus even if no task selected
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

  const percentage = ((currentSession.seconds - secondsLeft) / currentSession.seconds) * 100;

  // Show task only during focus sessions; hide during breaks
  const taskToShow = currentSession.sessionName === "focus" ? (activeTaskSnapshot || selectedTask) : null;

  // helper that returns left/right labels and target session keys for sandwich buttons
  const getSandwichLabels = (sessionName) => {
    switch (sessionName) {
      case "focus":
        return { left: { label: "Short break", session: "short" }, right: { label: "Long break", session: "long" } };
      case "short":
        return { left: { label: "Focus", session: "focus" }, right: { label: "Long break", session: "long" } };
      case "long":
        return { left: { label: "Short break", session: "short" }, right: { label: "Focus", session: "focus" } };
      default:
        return { left: { label: "Short break", session: "short" }, right: { label: "Long break", session: "long" } };
    }
  };

  const { left: leftMeta, right: rightMeta } = getSandwichLabels(currentSession.sessionName);

  // switch immediately to the given session (no extra side-effects beyond stopping timer and snapshot handling)
  const switchToSession = (sessionKey) => {
    const target = pomodoroSessionArray.find((s) => s.sessionName === sessionKey);
    if (!target) return;
    // stop running timer
    clearInterval(timerRef.current);
    setIsRunning(false);
    setCurrentSession(target);
    setSecondsLeft(target.seconds);
    // clear snapshot on non-focus; set snapshot if switching to focus and a task is selected
    if (sessionKey !== "focus") {
      setActiveTaskSnapshot(null);
    } else if (selectedTask) {
      setActiveTaskSnapshot(selectedTask);
    }
  };

  return (
    <>
      {showConfetti && <Confetti width={width} height={height} numberOfPieces={150} recycle={false} />}

      <section className="w-full max-w-2xl mx-auto px-6 pt-0 pb-10 flex flex-col items-center text-center space-y-6">
        {/* Sandwich: buttons on both sides of the current session title (clickable to switch session) */}
        <div className="relative w-full max-w-md flex items-center justify-center">
          <button
            type="button"
            className="absolute left-0 ml-2 text-sm underline text-[#912d2d] opacity-90 min-w-[88px] text-left truncate"
            onClick={() => switchToSession(leftMeta.session)}
            aria-label={`Switch to ${leftMeta.label}`}
          >
            {leftMeta.label}
          </button>

          <h2 className="text-lg font-semibold text-[#b33a3a] tracking-widest uppercase text-center px-4">
            {currentSession.sessionName} session
          </h2>

          <button
            type="button"
            className="absolute right-0 mr-2 text-sm underline text-[#912d2d] opacity-90 min-w-[88px] text-right truncate"
            onClick={() => switchToSession(rightMeta.session)}
            aria-label={`Switch to ${rightMeta.label}`}
          >
            {rightMeta.label}
          </button>
        </div>

        {/* Header: show current task only on focus; otherwise show break label */}
        {currentSession.sessionName === "focus" ? (
          <h1 className="text-2xl font-bold text-[#4b2e2e] tracking-wide mb-1">
            Current Task:{" "}
            {taskToShow ? (
              <span>{taskToShow.description}</span>
            ) : (
              <span className="italic text-gray-400">No task selected</span>
            )}
          </h1>
        ) : (
          <h1 className="text-2xl font-bold text-[#4b2e2e] tracking-wide mb-1">
            {currentSession.sessionName === "short"
              ? "Short break"
              : currentSession.sessionName === "long"
              ? "Long break"
              : "Break"}
          </h1>
        )}

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
            <button className="btn-primary px-8 py-3" onClick={handleStart}>Start</button>
          )}

          {!isRunning && secondsLeft < currentSession.seconds && (
            <button className="btn-primary px-8 py-3" onClick={handleStart}>Resume</button>
          )}

          {isRunning && <button className="btn-primary px-8 py-3" onClick={handlePause}>Pause</button>}
        </div>

        <div className="flex flex-col items-center space-y-2">
          <button className="text-sm underline text-[#912d2d] hover:text-[#b33a3a] transition-all" onClick={handleSkip}>Skip session?</button>
          <p className="text-[#4b2e2e] font-medium text-sm">Focus sessions completed: {focusLoop}</p>
        </div>
      </section>
    </>
  );
};

export default PomodoroSection;