import React, { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import supabase from "../utils/supabase";
import { useAuth } from "../hooks/useAuth";
import SignInModal from "./SignInModal";

const AddNewTask = ({ goalId = "", onClose = () => {}, onCreated = () => {}, createdInPomodoro = false }) => {
  const qc = useQueryClient();
  const { user } = useAuth();
  const [showSignIn, setShowSignIn] = useState(false);

  const { data: goalsData = [], isLoading: goalsLoading } = useQuery({
    queryKey: ["goals"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("goals")
        .select("id, name")
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data;
    },
    staleTime: 60 * 1000,
    retry: false,
    refetchOnWindowFocus: false,
  });

  const [taskDescription, setTaskDescription] = useState("");
  const [pomodoroNumber, setPomodoroNumber] = useState(1);
  const [selectedGoal, setSelectedGoal] = useState(goalId || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // if parent opens this panel for a specific goal, preselect it
    setSelectedGoal(goalId || "");
  }, [goalId]);

  const handleIncrease = () => setPomodoroNumber((prev) => prev + 1);
  const handleDecrease = () => setPomodoroNumber((prev) => (prev > 1 ? prev - 1 : prev));

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!taskDescription.trim()) {
      alert("Please enter a task description.");
      return;
    }

    // If user not authenticated, show SignInModal and don't call supabase
    if (!user) {
      setShowSignIn(true);
      return;
    }

    setIsSubmitting(true);

    try {
      // shift existing today's tasks order (best-effort; if raw isn't supported this may fail)
      try {
        await supabase.from("tasks").update({ order: supabase.raw("order + 1") }).eq("isToday", true);
      } catch (reorderErr) {
        // ignore reorder failure — not fatal for creating the task
        // console.warn("Reorder failed", reorderErr);
      }

      const payload = {
        description: taskDescription,
        pomodorosNumber: pomodoroNumber,
        pomodorosDone: 0,
        // set isToday depending on where the task was created
        isToday: Boolean(createdInPomodoro),
        isFinished: false,
        goal_id: selectedGoal || null,
        order: 0,
      };

      const { data, error } = await supabase.from("tasks").insert([payload]).select().single();

      if (error) {
        alert("Insert failed: " + (error.message || JSON.stringify(error)));
        return;
      }

      // refresh queries and notify parent
      qc.invalidateQueries({ queryKey: ["tasks"] });
      qc.invalidateQueries({ queryKey: ["goals"] });
      onCreated(data);
      onClose();

      // reset fields (if component remains mounted)
      setTaskDescription("");
      setPomodoroNumber(1);
      setSelectedGoal("");
    } catch (err) {
      alert("Unexpected error: " + (err.message || String(err)));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="bg-[#fff4f4] p-6 rounded-xl shadow-md border border-[#f4e1e6] space-y-5">
        <div>
          <label className="block text-[#4b2e2e] font-medium mb-1">📝 Task Description</label>
          <input
            required
            value={taskDescription}
            onChange={(e) => setTaskDescription(e.target.value)}
            className="w-full px-4 py-2 border border-[#f4e1e6] rounded-md text-[#4b2e2e] shadow-sm focus:outline-none focus:ring-2 focus:ring-[#b33a3a]"
            placeholder="e.g. Study Genki Lesson 5"
          />
        </div>

        <div>
          <label className="block text-[#4b2e2e] font-medium mb-1">🍅 Pomodoro Count</label>
          <div className="flex items-center space-x-4">
            <button type="button" onClick={handleDecrease} className="bg-[#f4e1e6] text-[#b33a3a] px-3 py-1 rounded-md font-bold hover:bg-[#f2cfd7]">
              -
            </button>
            <span className="text-lg font-semibold text-[#4b2e2e]">{pomodoroNumber}</span>
            <button type="button" onClick={handleIncrease} className="bg-[#f4e1e6] text-[#b33a3a] px-3 py-1 rounded-md font-bold hover:bg-[#f2cfd7]">
              +
            </button>
          </div>
        </div>

        <div>
          <label className="block text-[#4b2e2e] font-medium mb-1">🎯 Assign to Goal</label>
          {goalsLoading ? (
            <div className="text-sm text-gray-500">Loading goals…</div>
          ) : (
            <select
              value={selectedGoal}
              onChange={(e) => setSelectedGoal(e.target.value)}
              className="w-full px-4 py-2 border border-[#f4e1e6] rounded-md text-[#4b2e2e] shadow-sm focus:outline-none focus:ring-2 focus:ring-[#b33a3a]"
            >
              <option value="">No goal selected</option>
              {(goalsData || []).map((goal) => (
                <option key={goal.id} value={goal.id}>
                  {goal.name}
                </option>
              ))}
            </select>
          )}
        </div>

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`flex-1 py-2 px-4 rounded-md shadow-md transition text-white ${
              isSubmitting ? "bg-gray-400 cursor-not-allowed" : "bg-[#b33a3a] hover:bg-[#912d2d]"
            }`}
          >
            {isSubmitting ? "Creating..." : "Create Task"}
          </button>
          <button type="button" onClick={() => onClose()} className="py-2 px-4 rounded-md border">
            Cancel
          </button>
        </div>
      </form>

      <SignInModal open={showSignIn} onClose={() => setShowSignIn(false)} />
    </div>
  );
};

export default AddNewTask;
