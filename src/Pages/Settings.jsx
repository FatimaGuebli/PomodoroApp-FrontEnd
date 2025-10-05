import React, { useEffect, useState, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../hooks/useAuth";
import supabase from "../utils/supabase";

const DEFAULTS = {
  focusMinutes: 25,
  shortBreakMinutes: 5,
  longBreakMinutes: 15,
};

const STORAGE_KEY = "pomodoroSettings";

const Settings = () => {
  const qc = useQueryClient();
  const { user } = useAuth();

  const [focusMinutes, setFocusMinutes] = useState(DEFAULTS.focusMinutes);
  const [shortBreakMinutes, setShortBreakMinutes] = useState(DEFAULTS.shortBreakMinutes);
  const [longBreakMinutes, setLongBreakMinutes] = useState(DEFAULTS.longBreakMinutes);
  const [status, setStatus] = useState("");

  // keep the last-saved values so we can detect changes
  const [originalSettings, setOriginalSettings] = useState({ ...DEFAULTS });

  // Profile states (avatar removed)
  const [profileName, setProfileName] = useState("");
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileStatus, setProfileStatus] = useState("");
  const [originalProfile, setOriginalProfile] = useState({ name: "" });

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        const f = parsed.focusMinutes ?? DEFAULTS.focusMinutes;
        const s = parsed.shortBreakMinutes ?? DEFAULTS.shortBreakMinutes;
        const l = parsed.longBreakMinutes ?? DEFAULTS.longBreakMinutes;
        setFocusMinutes(f);
        setShortBreakMinutes(s);
        setLongBreakMinutes(l);
        setOriginalSettings({
          focusMinutes: Number(f),
          shortBreakMinutes: Number(s),
          longBreakMinutes: Number(l),
        });
      } else {
        setOriginalSettings({ ...DEFAULTS });
      }
    } catch {
      // ignore parse errors
      setOriginalSettings({ ...DEFAULTS });
    }
  }, []);

  // load profile name when user available (avatar omitted)
  useEffect(() => {
    let mounted = true;
    const loadProfile = async () => {
      if (!user?.id) {
        setProfileName("");
        setOriginalProfile({ name: "" });
        return;
      }
      setProfileLoading(true);
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", user.id)
          .single();
        if (!error && data) {
          if (!mounted) return;
          setProfileName(data.full_name ?? "");
          setOriginalProfile({ name: data.full_name ?? "" });
        } else {
          const { data: userData } = await supabase.auth.getUser();
          const usr = userData?.user;
          if (usr) {
            const metaName = usr.user_metadata?.full_name ?? "";
            if (!mounted) return;
            setProfileName(metaName);
            setOriginalProfile({ name: metaName });
          }
        }
      } catch (err) {
        console.error("Failed to load profile", err);
      } finally {
        if (mounted) setProfileLoading(false);
      }
    };
    loadProfile();
    return () => {
      mounted = false;
    };
  }, [user]);

  const payloadFromState = () => ({
    focusMinutes: Number(focusMinutes) || DEFAULTS.focusMinutes,
    shortBreakMinutes: Number(shortBreakMinutes) || DEFAULTS.shortBreakMinutes,
    longBreakMinutes: Number(longBreakMinutes) || DEFAULTS.longBreakMinutes,
  });

  const hasChanges = useMemo(() => {
    const p = payloadFromState();
    return (
      p.focusMinutes !== originalSettings.focusMinutes ||
      p.shortBreakMinutes !== originalSettings.shortBreakMinutes ||
      p.longBreakMinutes !== originalSettings.longBreakMinutes
    );
  }, [focusMinutes, shortBreakMinutes, longBreakMinutes, originalSettings]);

  const save = () => {
    const payload = payloadFromState();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    setOriginalSettings(payload);
    setStatus("Saved");
    setTimeout(() => setStatus(""), 1500);
    qc.invalidateQueries({ queryKey: ["pomodoroSettings"] });
  };

  const reset = () => {
    setFocusMinutes(DEFAULTS.focusMinutes);
    setShortBreakMinutes(DEFAULTS.shortBreakMinutes);
    setLongBreakMinutes(DEFAULTS.longBreakMinutes);
    localStorage.removeItem(STORAGE_KEY);
    setOriginalSettings({ ...DEFAULTS });
    setStatus("Reset to defaults");
    setTimeout(() => setStatus(""), 1500);
    qc.invalidateQueries({ queryKey: ["pomodoroSettings"] });
  };

  // PROFILE: detect changes (only name)
  const profileHasChanges = useMemo(() => {
    return (profileName ?? "") !== (originalProfile.name ?? "");
  }, [profileName, originalProfile]);

  const saveProfile = async () => {
    // verify client auth state matches Supabase server state before proceeding
    const { data: userData } = await supabase.auth.getUser();
    console.debug("auth.getUser ->", userData?.user?.id, "app user ->", user?.id);
    if (!user?.id || user?.id !== userData?.user?.id) {
      setProfileStatus("Authentication mismatch — please sign out and sign in again.");
      setTimeout(() => setProfileStatus(""), 3000);
      return;
    }
    if (!user?.id) {
      setProfileStatus("Sign in to update profile");
      setTimeout(() => setProfileStatus(""), 2000);
      return;
    }

    setProfileLoading(true);
    try {
      // update auth user metadata (name only)
      const { error: authErr } = await supabase.auth.updateUser({
        data: {
          full_name: profileName ?? "",
        },
      });
      if (authErr) throw authErr;

      // upsert profile row (name only)
      const upsertPayload = {
        id: user.id,
        full_name: profileName ?? "",
      };
      const { data, error } = await supabase.from("profiles").upsert(upsertPayload).select().single();
      if (error) throw error;

      setOriginalProfile({ name: data.full_name ?? "" });
      setProfileStatus("Profile updated");
      setTimeout(() => setProfileStatus(""), 1500);
      qc.invalidateQueries({ queryKey: ["profiles", user.id] });
    } catch (err) {
      console.error("Failed to save profile (final):", err);
      const msg = err?.message || JSON.stringify(err) || "Failed to update profile";
      setProfileStatus(`Profile error: ${msg}`);
      setTimeout(() => setProfileStatus(""), 6000);
    } finally {
      setProfileLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <h2 className="text-xl font-semibold text-[#4b2e2e]">Timer settings</h2>

      <div className="soft-panel space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="text-sm text-gray-600">Focus period</div>
            <div className="text-lg font-semibold text-[#4b2e2e]">{focusMinutes} minutes</div>
          </div>
          <div>
            <input
              type="number"
              min={1}
              max={180}
              step={1}
              value={focusMinutes}
              onChange={(e) => setFocusMinutes(e.target.value)}
              className="w-24 px-3 py-1 border rounded-md text-sm"
            />
          </div>
        </div>

        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="text-sm text-gray-600">Short break</div>
            <div className="text-lg font-semibold text-[#4b2e2e]">{shortBreakMinutes} minutes</div>
          </div>
          <div>
            <input
              type="number"
              min={1}
              max={60}
              step={1}
              value={shortBreakMinutes}
              onChange={(e) => setShortBreakMinutes(e.target.value)}
              className="w-24 px-3 py-1 border rounded-md text-sm"
            />
          </div>
        </div>

        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="text-sm text-gray-600">Long break</div>
            <div className="text-lg font-semibold text-[#4b2e2e]">{longBreakMinutes} minutes</div>
          </div>
          <div>
            <input
              type="number"
              min={1}
              max={180}
              step={1}
              value={longBreakMinutes}
              onChange={(e) => setLongBreakMinutes(e.target.value)}
              className="w-24 px-3 py-1 border rounded-md text-sm"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={save}
            className={`px-4 py-2 rounded-md text-white font-semibold transition ${
              hasChanges ? "bg-[#b33a3a] hover:bg-[#912d2d]" : "bg-gray-400 cursor-not-allowed opacity-75"
            }`}
            disabled={!hasChanges}
          >
            Save
          </button>
          <button onClick={reset} className="px-3 py-1 border rounded-md">
            Reset
          </button>
          <div className="text-sm text-gray-500">{status}</div>
        </div>

        <div className="text-xs text-gray-400">
          Values are stored locally. Update your Pomodoro timer component to read from localStorage key "{STORAGE_KEY}".
        </div>
      </div>

      {/* Profile section (avatar removed) */}
      <h2 className="text-xl font-semibold text-[#4b2e2e]">Profile settings</h2>

      <div className="soft-panel">
        <div className="flex items-center gap-6">
          <div className="flex-1">
            <div className="w-full mr-4">
              <label className="block text-sm text-gray-600">Display name</label>
              <input
                type="text"
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                className="w-full border px-3 py-2 rounded-md text-sm"
                disabled={!user || profileLoading}
                placeholder={user ? "Your name" : "Sign in to edit"}
              />
            </div>

            <div className="mt-4 flex items-center justify-end gap-3">
              <button
                onClick={saveProfile}
                disabled={!user || !profileHasChanges || profileLoading}
                className={`px-4 py-2 rounded-md text-white font-semibold transition ${
                  profileHasChanges ? "bg-[#b33a3a] hover:bg-[#912d2d]" : "bg-gray-400 cursor-not-allowed opacity-75"
                }`}
              >
                {profileLoading ? "Saving…" : "Save profile"}
              </button>

              <button
                onClick={() => {
                  // revert profile edits
                  setProfileName(originalProfile.name ?? "");
                }}
                className="px-3 py-1 border rounded-md"
                disabled={profileLoading}
              >
                Cancel
              </button>
            </div>

            <div className="text-sm text-gray-500 mt-3">{profileStatus}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
