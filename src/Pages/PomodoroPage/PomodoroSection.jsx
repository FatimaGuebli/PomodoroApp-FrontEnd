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
  const [showConfetti, setShowConfetti] = useState(false);
  const [width, height] = useWindowSize();

  const timerRef = useRef(null);
  const secondsLeftRef = useRef(secondsLeft);
  const endTimeRef = useRef(null);
  const workerRef = useRef(null);
  const endAudioRef = useRef(null);
  const clickSoundRef = useRef(null);

  useEffect(() => {
    secondsLeftRef.current = secondsLeft;
  }, [secondsLeft]);

  useEffect(() => {
    endAudioRef.current = new Audio("/sounds/notification.mp3");
    clickSoundRef.current = new Audio("/sounds/button-click.mp3");
  }, []);

  useEffect(() => {
    try {
      workerRef.current = new Worker(new URL("../../../workers/timerWorker.js", import.meta.url), { type: "module" });
      workerRef.current.onmessage = (ev) => {
        const msg = ev.data;
        if (msg?.type === "tick") {
          setSecondsLeft((prev) => (prev === msg.remainingSec ? prev : msg.remainingSec));
        } else if (msg?.type === "done") {
          setSecondsLeft(0);
          setIsRunning(false);
          try {
            endAudioRef.current?.play().catch(() => {});
          } catch {}
          setTimeout(() => setShouldTransition(true), 0);
        }
      };
    } catch (err) {
      workerRef.current = null;
    }
    return () => {
      if (workerRef.current) {
        try {
          workerRef.current.postMessage({ cmd: "clear" });
          workerRef.current.terminate?.();
        } catch {}
        workerRef.current = null;
      }
    };
  }, []);

  const playClick = () => clickSoundRef.current?.play().catch(() => {});
  const playEndSound = () => endAudioRef.current?.play().catch(() => {});

  useEffect(() => {
    const updatedArray = [
      { sessionName: "focus", seconds: focusSeconds },
      { sessionName: "short", seconds: shortBreakSeconds },
      { sessionName: "long", seconds: longBreakSeconds },
    ];
    setCurrentSession((prev) => {
      const found = updatedArray.find((s) => s.sessionName === prev?.sessionName);
      return found ?? updatedArray[0];
    });
    if (!isRunning) {
      const curName = currentSession?.sessionName ?? "focus";
      const found = updatedArray.find((s) => s.sessionName === curName) ?? updatedArray[0];
      setSecondsLeft(found.seconds);
    }
  }, [focusSeconds, shortBreakSeconds, longBreakSeconds, currentSession?.sessionName]);

  useEffect(() => {
    if (!isRunning || workerRef.current) return;
    const tick = () => {
      const end = endTimeRef.current ?? (Date.now() + secondsLeftRef.current * 1000);
      const remainingMs = Math.max(0, end - Date.now());
      const remainingSec = Math.ceil(remainingMs / 1000);
      setSecondsLeft((prev) => (remainingSec !== prev ? remainingSec : prev));
      if (remainingMs <= 0) {
        endTimeRef.current = null;
        setIsRunning(false);
        setTimeout(() => setShouldTransition(true), 0);
        return;
      }
      timerRef.current = requestAnimationFrame(tick);
    };
    if (!endTimeRef.current) {
      endTimeRef.current = Date.now() + secondsLeftRef.current * 1000;
    }
    timerRef.current = requestAnimationFrame(tick);
    return () => {
      if (timerRef.current) {
        cancelAnimationFrame(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isRunning]);

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
      let res = await supabase.from("tasks").update({ pomodorosDone: updatedCount }).eq("id", task.id).select();
      if ((res.data && res.data.length === 0) || res.error) {
        if (!isNaN(Number(task.id))) {
          res = await supabase.from("tasks").update({ pomodorosDone: updatedCount }).eq("id", Number(task.id)).select();
        }
      }
      if (res.error) {
        console.error("Supabase update error:", res.error);
      }
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
          (tasks || []).find((t) => String(t.id) === String(activeTaskSnapshot?.id)) || activeTaskSnapshot || selectedTask;
        if (taskToUpdate) {
          if (typeof setTasks === "function") {
            setTasks((prev = []) =>
              prev.map((t) =>
                String(t.id) === String(taskToUpdate.id) ? { ...t, pomodorosDone: (t.pomodorosDone || 0) + 1 } : t
              )
            );
          }
          await incrementPomodoroRemote(taskToUpdate);
        }
        if (typeof setSelectedTask === "function") setSelectedTask(null);
        const nextSession = newLoop % 4 === 0 ? pomodoroSessionArray[2] : pomodoroSessionArray[1];
        setCurrentSession(nextSession);
        setSecondsLeft(nextSession.seconds);
      } else {
        setCurrentSession(pomodoroSessionArray[0]);
        setSecondsLeft(pomodoroSessionArray[0].seconds);
        setActiveTaskSnapshot(null);
      }
    };
    handleTransition();
  }, [shouldTransition]);

  const startWorkerTimer = (secs) => {
    const end = Date.now() + secs * 1000;
    endTimeRef.current = end;
    try {
      workerRef.current?.postMessage({ cmd: "start", endTime: end });
    } catch {}
  };

  const stopWorkerTimer = () => {
    try {
      workerRef.current?.postMessage({ cmd: "stop" });
    } catch {}
    endTimeRef.current = null;
  };

  const handleStart = () => {
    playClick();
    if (!user) {
      setShowSignIn(true);
      return;
    }
    if (workerRef.current) {
      startWorkerTimer(secondsLeftRef.current);
      setIsRunning(true);
      return;
    }
    endTimeRef.current = Date.now() + secondsLeftRef.current * 1000;
    setIsRunning(true);
  };

  const handlePause = () => {
    playClick();
    if (endTimeRef.current) {
      const remainingMs = Math.max(0, endTimeRef.current - Date.now());
      setSecondsLeft(Math.ceil(remainingMs / 1000));
      endTimeRef.current = null;
    }
    if (workerRef.current) {
      stopWorkerTimer();
    }
    if (timerRef.current) {
      cancelAnimationFrame(timerRef.current);
      timerRef.current = null;
    }
    setIsRunning(false);
  };

  const handleSkip = () => {
    if (timerRef.current) {
      cancelAnimationFrame(timerRef.current);
      timerRef.current = null;
    }
    if (workerRef.current) {
      stopWorkerTimer();
    }
    setShouldTransition(true);
  };

  const percentage = ((currentSession.seconds - secondsLeft) / currentSession.seconds) * 100;
  const taskToShow = currentSession.sessionName === "focus" ? (activeTaskSnapshot || selectedTask) : null;

  const { data: quotes = [] } = useQuery({
    queryKey: ["userQuotes", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase.from("quotes").select("id, content").eq("user_id", user.id).order("created_at", { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
    staleTime: 60 * 1000,
  });

  useEffect(() => {
    if (!quotes || quotes.length === 0) {
      setCurrentQuoteIndex(0);
      return;
    }
    setCurrentQuoteIndex(Math.floor(Math.random() * quotes.length));
    const interval = setInterval(() => {
      setCurrentQuoteIndex((prevIdx) => {
        if (!quotes || quotes.length === 0) return 0;
        if (quotes.length === 1) return 0;
        let next = prevIdx;
        let attempts = 0;
        while (next === prevIdx && attempts < 10) {
          next = Math.floor(Math.random() * quotes.length);
          attempts++;
        }
        return next;
      });
    }, 300000);
    return () => clearInterval(interval);
  }, [quotes]);

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

  const switchToSession = (sessionKey) => {
    const target = pomodoroSessionArray.find((s) => s.sessionName === sessionKey);
    if (!target) return;
    if (timerRef.current) {
      cancelAnimationFrame(timerRef.current);
      timerRef.current = null;
    }
    if (workerRef.current) {
      stopWorkerTimer();
    }
    setIsRunning(false);
    setCurrentSession(target);
    setSecondsLeft(target.seconds);
    if (sessionKey !== "focus") {
      setActiveTaskSnapshot(null);
    } else if (selectedTask) {
      setActiveTaskSnapshot(selectedTask);
    }
  };

  return (
    <>
      <SignInModal open={showSignIn} onClose={() => setShowSignIn(false)} />
      {showConfetti && <Confetti width={width} height={height} numberOfPieces={150} recycle={false} />}
      <section className="w-full max-w-2xl mx-auto px-6 pt-0 flex flex-col items-center text-center">
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
            {currentSession.sessionName === "focus" ? t("Focus") : currentSession.sessionName === "short" ? t("Short break") : t("Long break")}
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

        {currentSession.sessionName === "focus" ? (
          <h1 className="text-2xl font-bold text-[#4b2e2e] tracking-wide mb-1">
            {t("current_task")} {taskToShow ? <span>{taskToShow.description}</span> : <span className="italic text-gray-400">{t("no_task_selected")}</span>}
          </h1>
        ) : (
          <h1 className="text-2xl font-bold text-[#4b2e2e] tracking-wide mb-1">
            {currentSession.sessionName === "short" ? t("Short break") : currentSession.sessionName === "long" ? t("Long break") : t("Break")}
          </h1>
        )}

        <div className="w-[200px] md:w-[240px] lg:w-[260px]">
          <CircularProgressbar
            value={percentage}
            text={`${String(Math.floor(secondsLeft / 60)).padStart(2, "0")}:${String(secondsLeft % 60).padStart(2, "0")}`}
            strokeWidth={10}
            styles={buildStyles({
              textColor: "#4b2e2e",
              pathColor: "#b33a3a",
              trailColor: "#f8d8d8",
              textSize: "1.7rem",
            })}
          />
        </div>

        <div className="mt-4">
          <blockquote className="mt-4 italic text-[#4b2e2e] text-base opacity-90 font-[cursive] max-w-sm mx-auto">
            {quotes && quotes.length ? `“${quotes[currentQuoteIndex]?.content}”` : `“${t("default_quote")}”`}
          </blockquote>
        </div>

        <div className="space-x-4 mt-4">
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

        <div className="flex flex-col items-center space-y-2 mt-4">
          <button className="text-sm underline text-[#912d2d] hover:text-[#b33a3a] transition-all" onClick={handleSkip}>
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