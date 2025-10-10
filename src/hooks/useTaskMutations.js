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

      // ask Supabase to return the updated row
      const { data, error } = await supabase
        .from("tasks")
        .update(fields)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        console.error("❌ Update failed:", error);
        throw error;
      }

      console.log("✅ Update successful for ID:", id, data);
      return data;
    },

    onMutate: async (updatedTask) => {
      await queryClient.cancelQueries(["tasks"]);

      const prevAll = queryClient.getQueryData(["tasks"]);
      const prevToday = queryClient.getQueryData(["todaystasks"]);
      const prevUnassigned = queryClient.getQueryData(["tasks", "unassigned"]);
      // optimistic update in place
      queryClient.setQueryData(["tasks"], (old = []) =>
        (old || []).map((t) => (String(t.id) === String(updatedTask.id) ? { ...t, ...updatedTask } : t))
      );
      queryClient.setQueryData(["todaystasks"], (old = []) =>
        (old || []).map((t) => (String(t.id) === String(updatedTask.id) ? { ...t, ...updatedTask } : t))
      );
      if (prevUnassigned) {
        queryClient.setQueryData(["tasks", "unassigned"], (old = []) =>
          (old || []).map((t) => (String(t.id) === String(updatedTask.id) ? { ...t, ...updatedTask } : t))
        );
      }

      return { prevAll, prevToday, prevUnassigned };
    },

    onError: (err, variables, context) => {
      console.error("update task failed:", err);
      if (context?.prevAll) queryClient.setQueryData(["tasks"], context.prevAll);
      if (context?.prevToday) queryClient.setQueryData(["todaystasks"], context.prevToday);
      if (context?.prevUnassigned) queryClient.setQueryData(["tasks", "unassigned"], context.prevUnassigned);
    },

    onSettled: () => {
      // ensure fresh data from server
      queryClient.invalidateQueries(["tasks"]);
      queryClient.invalidateQueries(["todaystasks"]);
      queryClient.invalidateQueries(["tasks", "unassigned"]);
      queryClient.invalidateQueries(["tasks", "byGoal"]);
      queryClient.invalidateQueries(["goals"]);
    },

    onSuccess: (data) => {
      console.log("🔁 Updating local cache after update (server):", data);
      // ensure caches reflect canonical server row
      queryClient.setQueryData(["tasks"], (old = []) =>
        (old || []).map((t) => (String(t.id) === String(data.id) ? { ...t, ...data } : t))
      );
      queryClient.setQueryData(["todaystasks"], (old = []) =>
        (old || []).map((t) => (String(t.id) === String(data.id) ? { ...t, ...data } : t))
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
      // ask server to return deleted row (if allowed) so we know it succeeded
      const { data, error } = await supabase.from("tasks").delete().eq("id", taskId).select().single();

      if (error) {
        console.error("❌ Delete failed:", error);
        throw error;
      }

      console.log("✅ Delete successful for ID:", taskId, data);
      return taskId;
    },

    onMutate: async (taskId) => {
      await queryClient.cancelQueries(["tasks"]);
      const prevAll = queryClient.getQueryData(["tasks"]);
      const prevToday = queryClient.getQueryData(["todaystasks"]);
      const prevUnassigned = queryClient.getQueryData(["tasks", "unassigned"]);

      queryClient.setQueryData(["tasks"], (old = []) => (old || []).filter((t) => String(t.id) !== String(taskId)));
      queryClient.setQueryData(["todaystasks"], (old = []) => (old || []).filter((t) => String(t.id) !== String(taskId)));
      if (prevUnassigned) {
        queryClient.setQueryData(["tasks", "unassigned"], (old = []) => (old || []).filter((t) => String(t.id) !== String(taskId)));
      }

      return { prevAll, prevToday, prevUnassigned };
    },

    onError: (err, taskId, context) => {
      console.error("delete task failed:", err);
      if (context?.prevAll) queryClient.setQueryData(["tasks"], context.prevAll);
      if (context?.prevToday) queryClient.setQueryData(["todaystasks"], context.prevToday);
      if (context?.prevUnassigned) queryClient.setQueryData(["tasks", "unassigned"], context.prevUnassigned);
    },

    onSettled: () => {
      queryClient.invalidateQueries(["tasks"]);
      queryClient.invalidateQueries(["todaystasks"]);
      queryClient.invalidateQueries(["tasks", "unassigned"]);
      queryClient.invalidateQueries(["tasks", "byGoal"]);
    },

    onSuccess: (deletedId) => {
      console.log("🧹 Cleaning up local cache for deleted ID:", deletedId);
      // final cleanup (in case)
      queryClient.setQueryData(["tasks"], (old = []) => (old || []).filter((t) => t.id !== deletedId));
      queryClient.setQueryData(["todaystasks"], (old = []) => (old || []).filter((t) => t.id !== deletedId));
    },
  });
};

// ➕ Add to Today (at top, order = 0)
export const useAddToToday = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (taskId) => {
      console.log("📌 Adding task to today's list at the top:", taskId);

      // 1. Shift all today's tasks down by 1 (RPC)
      const { error: shiftError } = await supabase.rpc("increment_today_orders");
      if (shiftError) {
        console.error("❌ Failed to shift today task orders:", shiftError.message);
        throw shiftError;
      }

      // 2. Mark this task as today & set order to 0 and return updated row
      const { data, error: updateError } = await supabase
        .from("tasks")
        .update({ isToday: true, order: 0 })
        .eq("id", taskId)
        .select()
        .single();

      if (updateError) {
        console.error("❌ Failed to update task:", updateError.message);
        throw updateError;
      }

      console.log("✅ Task added to today's tasks at top:", data);
      return data;
    },

    onSuccess: () => {
      console.log("🔁 Invalidating queries after add-to-today");
      queryClient.invalidateQueries(["tasks"]);
      queryClient.invalidateQueries(["todaystasks"]);
      queryClient.invalidateQueries(["tasks", "unassigned"]);
    },
  });
};
