const DEFAULTS = {
  focusMinutes: 25,
  shortBreakMinutes: 5,
  longBreakMinutes: 15,
};
const STORAGE_KEY = "pomodoroSettings";

import { useEffect, useState } from "react";

export default function usePomodoroSettings() {
  const [settings, setSettings] = useState(DEFAULTS);

  useEffect(() => {
    const load = () => {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) {
          setSettings(DEFAULTS);
          return;
        }
        const parsed = JSON.parse(raw);
        setSettings({
          focusMinutes: Number(parsed.focusMinutes ?? DEFAULTS.focusMinutes),
          shortBreakMinutes: Number(parsed.shortBreakMinutes ?? DEFAULTS.shortBreakMinutes),
          longBreakMinutes: Number(parsed.longBreakMinutes ?? DEFAULTS.longBreakMinutes),
        });
      } catch {
        setSettings(DEFAULTS);
      }
    };

    load();

    // update if settings changed in another tab
    const onStorage = (e) => {
      if (e.key === STORAGE_KEY) load();
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  return settings;
}