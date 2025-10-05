import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import supabase from "../../utils/supabase";
import { useAuth } from "../../hooks/useAuth";
import SignInModal from "../../components/SignInModal";

const NewGoalSection = () => {
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [loadingMsg, setLoadingMsg] = useState("");
  const [showSignIn, setShowSignIn] = useState(false);
  const qc = useQueryClient();

  const createGoal = useMutation({
    mutationFn: async (newName) => {
      const payload = { name: newName };
      if (user?.id) payload.user_id = user.id;
      const { data, error } = await supabase.from("goals").insert(payload).select().single();
      if (error) throw error;
      return data;
    },
    onMutate: () => setLoadingMsg("Creating..."),
    onSuccess: () => {
      setName("");
      qc.invalidateQueries({ queryKey: ["goals"] });
    },
    onSettled: () => setLoadingMsg(""),
    onError: (err) => {
      console.error("Create goal failed", err);
      setLoadingMsg("");
    },
  });

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!name.trim()) return;
    // require authentication before attempting DB call
    if (!user) {
      setShowSignIn(true);
      return;
    }
    createGoal.mutate(name.trim());
  };

  return (
    <section className="soft-panel animate-fadeIn">
      <h2 className="mb-3">Create new goal</h2>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-[#4b2e2e] mb-1">Goal name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Learn Spanish"
            className="w-full border px-3 py-2 rounded-md text-sm"
          />
        </div>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            className="btn-primary"
            disabled={createGoal.isLoading}
          >
            {createGoal.isLoading ? "Creating…" : "Create goal"}
          </button>
          <span className="text-sm text-gray-600">{loadingMsg}</span>
        </div>
      </form>

      <SignInModal open={showSignIn} onClose={() => setShowSignIn(false)} />
    </section>
  );
};

export default NewGoalSection;