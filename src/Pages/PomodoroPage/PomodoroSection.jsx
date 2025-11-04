import React, { useEffect, useRef, useState } from "react";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import Confetti from "react-confetti";
import { useWindowSize } from "@react-hook/window-size";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../../hooks/useAuth";
import SignInModal from "../../components/SignInModal";
import usePomodoroSettings from "../../hooks/usePomodoroSettings";
import supabase from "../../utils/supabase";
import { useTranslation } from "react-i18next";

const PomodoroSection = ({ selectedTask, setSelectedTask, tasks, setTasks }) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [showSignIn, setShowSignIn] = useState(false);
  // read saved settings but only apply them for authenticated users
  const savedSettings = usePomodoroSettings();
  const DEFAULT_FOCUS = 25;
  const DEFAULT_SHORT = 5;
  const DEFAULT_LONG = 15;

  const focusMinutes = user ? Number(savedSettings.focusMinutes ?? DEFAULT_FOCUS) : DEFAULT_FOCUS;
  const shortBreakMinutes = user ? Number(savedSettings.shortBreakMinutes ?? DEFAULT_SHORT) : DEFAULT_SHORT;
  const longBreakMinutes = user ? Number(savedSettings.longBreakMinutes ?? DEFAULT_LONG) : DEFAULT_LONG;

  const focusSeconds = Math.max(1, focusMinutes) * 60;
  const shortBreakSeconds = Math.max(1, shortBreakMinutes) * 60;
  const longBreakSeconds = Math.max(1, longBreakMinutes) * 60;

  const pomodoroSessionArray = [
    { sessionName: "focus", seconds: focusSeconds },
    { sessionName: "short", seconds: shortBreakSeconds },
    { sessionName: "long", seconds: longBreakSeconds },
  ];

  const [currentSession, setCurrentSession] = useState(pomodoroSessionArray[0]);
  const [focusLoop, setFocusLoop] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(() => focusSeconds);
  const [isRunning, setIsRunning] = useState(false);
  const [shouldTransition, setShouldTransition] = useState(false);
  const [activeTaskSnapshot, setActiveTaskSnapshot] = useState(null);
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);

  // todays tasks shown in the "today" list
  // (SelectExistingTask removed) — no local todaysTasks/newlyCreatedTaskId in this component now

  // keep currentSession.seconds and secondsLeft in sync when user changes durations in Settings
  useEffect(() => {
    const updatedArray = [
      { sessionName: "focus", seconds: focusSeconds },
      { sessionName: "short", seconds: shortBreakSeconds },
      { sessionName: "long", seconds: longBreakSeconds },
    ];

    // update currentSession object to the new object that matches the same sessionName
    setCurrentSession((prev) => {
      const found = updatedArray.find((s) => s.sessionName === prev?.sessionName);
      return found ?? updatedArray[0];
    });

    // If timer is not running, update the visible remaining seconds to the new duration.
    // If running, we avoid changing secondsLeft mid-session.
    if (!isRunning) {
      setSecondsLeft(() => {
        const curName = currentSession?.sessionName ?? "focus";
        const found = updatedArray.find((s) => s.sessionName === curName) ?? updatedArray[0];
        return found.seconds;
      });
    }
  // include currentSession.sessionName and isRunning so we compute correct target
  }, [focusSeconds, shortBreakSeconds, longBreakSeconds, currentSession?.sessionName, isRunning]);
 
  const workerRef = useRef(null);
  const endTimeRef = useRef(null);
  const audioCtxRef = useRef(null);
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

// create worker once and handle messages
  useEffect(() => {
    try {
      workerRef.current = new Worker(new URL("../../workers/timerWorker.js", import.meta.url), { type: "module" });
      workerRef.current.onmessage = (ev) => {
        const msg = ev.data;
        if (msg.type === "tick") {
          setSecondsLeft((prev) => (prev === msg.remainingSec ? prev : msg.remainingSec));
        } else if (msg.type === "done") {
          setSecondsLeft(0);
          setIsRunning(false);
          // play sound / notify / transition
          playEndSound?.();
          setTimeout(() => setShouldTransition(true), 0);
        }
      };
    } catch (err) {
      console.warn("Timer worker not available, falling back to main-thread timing", err);
      workerRef.current = null;
    }
    return () => {
      if (workerRef.current) {
        workerRef.current.postMessage({ cmd: "clear" });
        workerRef.current.terminate?.();
        workerRef.current = null;
      }
    };
  }, []);

// helpers to start/stop worker
  const startWorkerTimer = (secs) => {
    const end = Date.now() + secs * 1000;
    endTimeRef.current = end;
    try { workerRef.current?.postMessage({ cmd: "start", endTime: end }); } catch (e) {}
  };
  const stopWorkerTimer = () => {
    try { workerRef.current?.postMessage({ cmd: "stop" }); } catch (e) {}
    endTimeRef.current = null;
  };

  // Accurate timer: compute remaining seconds from an absolute end timestamp.
  // This avoids interval drift and browser timer throttling issues.
  useEffect(() => {
    if (!isRunning) return;

    const tick = () => {
      const end = endTimeRef.current ?? (Date.now() + secondsLeft * 1000);
      const remainingMs = Math.max(0, end - Date.now());
      const remainingSec = Math.ceil(remainingMs / 1000);

      setSecondsLeft((prev) => {
        // update only when value changes to avoid extra re-renders
        return remainingSec !== prev ? remainingSec : prev;
      });

      if (remainingMs <= 0) {
        // finished
        endTimeRef.current = null;
        setIsRunning(false);
        setTimeout(() => setShouldTransition(true), 0);
        return;
      }

      // schedule next frame (smooth, keeps accurate time)
      timerRef.current = requestAnimationFrame(tick);
    };

    // ensure endTimeRef is set when starting
    if (!endTimeRef.current) {
      endTimeRef.current = Date.now() + secondsLeft * 1000;
    }

    timerRef.current = requestAnimationFrame(tick);
    return () => {
      if (timerRef.current) cancelAnimationFrame(timerRef.current);
    };
  }, [isRunning, secondsLeft]);

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
    if (!user) {
      setShowSignIn(true);
      return;
    }
    // set absolute end timestamp and start (makes resume accurate)
    endTimeRef.current = Date.now() + secondsLeft * 1000;
    setIsRunning(true);
    startWorkerTimer(secondsLeft);
  };

  const handlePause = () => {
    playClick();
    // compute remaining seconds from endTimeRef and clear it
    if (endTimeRef.current) {
      const remainingMs = Math.max(0, endTimeRef.current - Date.now());
      setSecondsLeft(Math.ceil(remainingMs / 1000));
      endTimeRef.current = null;
    }
    setIsRunning(false);
    stopWorkerTimer();
  };

  const handleSkip = () => {
    if (timerRef.current) {
      cancelAnimationFrame(timerRef.current);
      timerRef.current = null;
    }
    setShouldTransition(true);
  };
 
  const percentage = ((currentSession.seconds - secondsLeft) / currentSession.seconds) * 100;

  // Show task only during focus sessions; hide during breaks
  const taskToShow = currentSession.sessionName === "focus" ? (activeTaskSnapshot || selectedTask) : null;
  const noTasks = !tasks || tasks.length === 0;
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
     if (timerRef.current) {
      cancelAnimationFrame(timerRef.current);
      timerRef.current = null;
    }
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
 
  const { data: quotes = [] } = useQuery({
    queryKey: ["userQuotes", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from("quotes")
        .select("id, content")
        .eq("user_id", user.id)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
    staleTime: 60 * 1000,
  });

  // rotate every 5 minutes (now random, avoid immediate repeat)
  useEffect(() => {
    if (!quotes || quotes.length === 0) {
      setCurrentQuoteIndex(0);
      return;
    }

    // pick an initial random quote
    setCurrentQuoteIndex(Math.floor(Math.random() * quotes.length));

    const interval = setInterval(() => {
      setCurrentQuoteIndex((prevIdx) => {
        if (!quotes || quotes.length === 0) return 0;
        if (quotes.length === 1) return 0;
        // pick a random index different from current (avoid repeating same quote)
        let next = prevIdx;
        let attempts = 0;
        while (next === prevIdx && attempts < 10) {
          next = Math.floor(Math.random() * quotes.length);
          attempts++;
        }
        return next;
      });
    }, 10_000); // changed from 300_000 (5 min) to 10_000 (10 sec) for testing

    return () => clearInterval(interval);
  }, [quotes]);

  const currentQuote = quotes && quotes.length ? quotes[currentQuoteIndex]?.content : "";

  return (
    <>
      <SignInModal open={showSignIn} onClose={() => setShowSignIn(false)} />
      {showConfetti && <Confetti width={width} height={height} numberOfPieces={150} recycle={false} />}

      <section className="w-full max-w-2xl mx-auto px-6 pt-0  flex flex-col items-center text-center ">
        {/* Sandwich: buttons on both sides of the current session title (clickable to switch session) */}
        <div className="relative w-full max-w-md flex items-center justify-center pb-0 mb-0 h-12">
          <button
            type="button"
            className="absolute left-0 ml-2 text-sm underline text-[#912d2d] opacity-90 min-w-[88px] text-left truncate"
            onClick={() => switchToSession(leftMeta.session)}
            aria-label={`${t("switch_to")} ${t(leftMeta.label)}`}
          >
            {t(leftMeta.label)}
          </button>

          <h2 className="text-lg font-semibold text-[#b33a3a] tracking-widest uppercase text-center px-4">
            {currentSession.sessionName === "focus"
              ? t("Focus")
              : currentSession.sessionName === "short"
              ? t("Short break")
              : t("Long break")}
          </h2>

          <button
            type="button"
            className="absolute right-0 mr-2 text-sm underline text-[#912d2d] opacity-90 min-w-[88px] text-right truncate"
            onClick={() => switchToSession(rightMeta.session)}
            aria-label={`${t("switch_to")} ${t(rightMeta.label)}`}
          >
            {t(rightMeta.label)}
          </button>
        </div>

        {/* Header: show current task only on focus; otherwise show break label */}
        {currentSession.sessionName === "focus" ? (
          <h1 className="text-2xl font-bold text-[#4b2e2e] tracking-wide mb-1">
            {t("current_task")}{" "}
            {taskToShow ? (
              <span>{taskToShow.description}</span>
            ) : (
              <span className="italic text-gray-400">{t("no_task_selected")}</span>
            )}
          </h1>
        ) : (
          <h1 className="text-2xl font-bold text-[#4b2e2e] tracking-wide mb-1">
            {currentSession.sessionName === "short"
              ? t("Short break")
              : currentSession.sessionName === "long"
              ? t("Long break")
              : t("Break")}
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

        {/* old/simple quote UI restored — use user quote if available, otherwise fallback text */}
        <div className="mt-4">
          <blockquote className="mt-4 italic text-[#4b2e2e] text-base opacity-90 font-[cursive] max-w-sm mx-auto">
            {currentQuote ? `“${currentQuote}”` : `“${t("default_quote")}”`}
          </blockquote>
        </div>

        <div className="space-x-4">
          {!isRunning && secondsLeft === currentSession.seconds && (
            <button className="btn-primary px-8 py-3" onClick={handleStart}>
              {t("start")}
            </button>
          )}

          {!isRunning && secondsLeft < currentSession.seconds && (
            <button className="btn-primary px-8 py-3" onClick={handleStart}>
              {t("resume")}
            </button>
          )}

          {isRunning && (
            <button className="btn-primary px-8 py-3" onClick={handlePause}>
              {t("pause")}
            </button>
          )}
        </div>

        <div className="flex flex-col items-center space-y-2">
          <button
            className="text-sm underline text-[#912d2d] hover:text-[#b33a3a] transition-all"
            onClick={handleSkip}
          >
            {t("skip_session")}
          </button>
          <p className="text-[#4b2e2e] font-medium text-sm">
            {t("focus_sessions_completed")} {focusLoop}
          </p>
        </div>
      </section>

      
    </>
  );
};

export default PomodoroSection;