import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import supabase from "../utils/supabase";
import { useAuth } from "../hooks/useAuth";
import { Pencil, Trash2 } from "lucide-react";
import SignInModal from "../components/SignInModal";

const MAX_QUOTE_LENGTH = 240;

const Quotes = () => {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [text, setText] = useState("");

  // editing state for inline edit
  const [editingId, setEditingId] = useState(null);
  const [editingText, setEditingText] = useState("");
  const [showSignIn, setShowSignIn] = useState(false);

  const { data: quotes = [], isLoading } = useQuery({
    queryKey: ["userQuotes", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from("quotes")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const addQuote = useMutation({
    mutationFn: async (newText) => {
      const payload = { content: newText.slice(0, MAX_QUOTE_LENGTH), user_id: user?.id || null };
      const { data, error } = await supabase.from("quotes").insert(payload).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      setText("");
      qc.invalidateQueries({ queryKey: ["userQuotes", user?.id] });
    },
  });

  const updateQuote = useMutation({
    mutationFn: async ({ id, content }) => {
      const { data, error } = await supabase.from("quotes").update({ content }).eq("id", id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["userQuotes", user?.id] });
      setEditingId(null);
      setEditingText("");
    },
  });

  // delete mutation
  const deleteQuote = useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase.from("quotes").delete().eq("id", id);
      if (error) throw error;
      return true;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["userQuotes", user?.id] });
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = (text || "").trim();
    if (!trimmed) return;
    // require authentication before attempting DB insert
    if (!user) {
      setShowSignIn(true);
      return;
    }
    addQuote.mutate(trimmed);
  };

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-4">
      <h2 className="text-xl font-semibold text-[#4b2e2e]">Your Motivational Quotes</h2>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="relative">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Write a short motivating quote..."
            className="w-full border px-3 py-2 pb-10 rounded-md text-sm resize-none"
            rows={3}
            maxLength={MAX_QUOTE_LENGTH}
          />
          <div className="absolute right-2 bottom-2 text-xs text-gray-400 pointer-events-none">
            {text.length}/{MAX_QUOTE_LENGTH}
          </div>
        </div>

        <div className="flex items-center justify-start">
          <button
            type="submit"
            className="btn-primary"
            disabled={addQuote.isLoading || !text.trim()}
          >
            {addQuote.isLoading ? "Adding…" : "Add Quote"}
          </button>
        </div>
      </form>

      {/* Quotes list section styled similar to goals list but simpler */}
      <section className="soft-panel animate-fadeIn">
        <h3 className="mb-3 text-sm font-medium text-[#4b2e2e]">Your saved quotes</h3>

        {isLoading ? (
          <div className="text-sm text-gray-500">Loading…</div>
        ) : quotes.length === 0 ? (
          <div className="text-sm text-gray-600">No quotes yet.</div>
        ) : (
          <ul className="space-y-2">
            {quotes.map((q) => {
              const content = q.content ?? q.quote ?? q.text ?? "(no text)";
              return (
                <li
                  key={q.id}
                  className="border border-[#f4e1e6] rounded-lg px-3 py-3 bg-white flex items-start gap-3"
                >
                  <div className="flex-1">
                    {editingId === q.id ? (
                      <div className="space-y-2">
                        <textarea
                          value={editingText}
                          onChange={(e) => setEditingText(e.target.value)}
                          maxLength={MAX_QUOTE_LENGTH}
                          rows={2}
                          className="w-full border px-2 py-1 rounded-md text-sm resize-none"
                        />
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => {
                              const trimmed = (editingText || "").trim();
                              if (!trimmed) return;
                              updateQuote.mutate({ id: q.id, content: trimmed.slice(0, MAX_QUOTE_LENGTH) });
                            }}
                            className="px-3 py-1 bg-[#b33a3a] text-white rounded-md text-sm"
                            disabled={updateQuote.isLoading}
                          >
                            Save
                          </button>
                          <button
                            onClick={() => {
                              setEditingId(null);
                              setEditingText("");
                            }}
                            className="px-3 py-1 border rounded-md text-sm"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-sm text-[#4b2e2e] leading-snug">
                        <span className="text-2xl leading-none text-gray-400 mr-2">“</span>
                        <span>{content}</span>
                        <span className="text-2xl leading-none text-gray-400 ml-2">”</span>
                      </div>
                    )}
                  </div>

                  {/* right-side controls: pen and trash */}
                  <div className="flex-shrink-0 flex items-start gap-2">
                    <button
                      className="p-2 rounded-md hover:bg-gray-50 text-[#b33a3a]"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingId(q.id);
                        setEditingText(content);
                      }}
                      title="Edit quote"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>

                    <button
                      className="p-2 rounded-md hover:bg-gray-50 text-red-600"
                      onClick={async (e) => {
                        e.stopPropagation();
                        const ok = window.confirm("Delete this quote?");
                        if (!ok) return;
                        try {
                          await deleteQuote.mutateAsync(q.id);
                        } catch (err) {
                          console.error("Delete failed", err);
                        }
                      }}
                      title="Delete quote"
                      disabled={deleteQuote.isLoading}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <SignInModal open={showSignIn} onClose={() => setShowSignIn(false)} />
    </div>
  );
};

export default Quotes;
