// src/hooks/useTaskMutations.js
import { useMutation, useQueryClient } from "@tanstack/react-query";
import supabase from "../utils/supabase";

// 🔧 Update Task Mutation
export const useUpdateTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updatedTask) => {
      const { id, ...fields } = updatedTask;
      console.log("🔄 Updating task with ID:", id, "Fields:", fields);

      const { error } = await supabase
        .from("tasks")
        .update(fields)
        .eq("id", id);

      if (error) {
        console.error("❌ Update failed:", error.message);
        throw new Error(error.message);
      }

      console.log("✅ Update successful for ID:", id);
      return updatedTask;
    },

    onSuccess: (updatedTask) => {
      console.log("🔁 Updating local cache after update:", updatedTask);

      queryClient.setQueryData(["tasks"], (old = []) =>
        old.map((t) => (t.id === updatedTask.id ? { ...t, ...updatedTask } : t))
      );

      queryClient.setQueryData(["todaystasks"], (old = []) =>
        old.map((t) => (t.id === updatedTask.id ? { ...t, ...updatedTask } : t))
      );
    },
  });
};

// ❌ Delete Task Mutation
export const useDeleteTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (taskId) => {
      console.log("🗑️ Attempting to delete task with ID:", taskId);
      const { error } = await supabase.from("tasks").delete().eq("id", taskId);

      if (error) {
        console.error("❌ Delete failed:", error.message);
        throw new Error(error.message);
      }

      console.log("✅ Delete successful for ID:", taskId);
      return taskId;
    },

    onSuccess: (deletedId) => {
      console.log("🧹 Cleaning up local cache for deleted ID:", deletedId);

      queryClient.setQueryData(["tasks"], (old = []) =>
        old.filter((t) => t.id !== deletedId)
      );

      queryClient.setQueryData(["todaystasks"], (old = []) =>
        old.filter((t) => t.id !== deletedId)
      );
    },
  });
};

// ➕ Add to Today (at top, order = 0)
export const useAddToToday = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (taskId) => {
      console.log("📌 Adding task to today's list at the top:", taskId);

      // 1. Shift all today's tasks down by 1
      const { error: shiftError } = await supabase.rpc(
        "increment_today_orders"
      );
      if (shiftError) {
        console.error(
          "❌ Failed to shift today task orders:",
          shiftError.message
        );
        throw new Error(shiftError.message);
      }

      // 2. Mark this task as today & set order to 0
      const { error: updateError } = await supabase
        .from("tasks")
        .update({ isToday: true, order: 0 })
        .eq("id", taskId);

      if (updateError) {
        console.error("❌ Failed to update task:", updateError.message);
        throw new Error(updateError.message);
      }

      console.log("✅ Task added to today's tasks at top:", taskId);
      return taskId;
    },

    onSuccess: () => {
      console.log("🔁 Invalidating queries after add-to-today");
      queryClient.invalidateQueries(["tasks"]);
      queryClient.invalidateQueries(["todaystasks"]);
    },
  });
};
