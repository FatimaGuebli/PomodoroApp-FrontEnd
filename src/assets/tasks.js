// src/assets/tasks.js

// Utility: get today's date in YYYY-MM-DD format
const todayDate = new Date().toISOString().split("T")[0]; // e.g. "2025-06-21"

const tasks = [
  // 🥇 Japanese learning tasks
  {
    id: "task-1",
    description: "Learn Hiragana",
    pomodoroNumbers: 4,
    pomodorosDone: 2,
    reminder: `${todayDate}T10:00`, // today
  },
  {
    id: "task-2",
    description: "Learn Katakana",
    pomodoroNumbers: 3,
    pomodorosDone: 1,
    reminder: "2025-06-22T10:00", // future
  },
  {
    id: "task-3",
    description: "Memorize 1–1000 Kanji characters",
    pomodoroNumbers: 20,
    pomodorosDone: 7,
    reminder: "2025-06-23T08:00", // future
  },
  {
    id: "task-4",
    description: "Learn present short form",
    pomodoroNumbers: 5,
    pomodorosDone: 2,
    reminder: `${todayDate}T16:00`, // today
  },

  // 💻 React learning tasks
  {
    id: "task-5",
    description: "Learn useState hook",
    pomodoroNumbers: 2,
    pomodorosDone: 1,
    reminder: `${todayDate}T11:00`, // today
  },
  {
    id: "task-6",
    description: "Build a To-Do list app",
    pomodoroNumbers: 4,
    pomodorosDone: 3,
    reminder: "2025-06-22T14:00", // future
  },
  {
    id: "task-7",
    description: "Learn useMemo hook",
    pomodoroNumbers: 3,
    pomodorosDone: 1,
    reminder: "2025-06-22T10:30", // future
  },

  // 🌟 Independent tasks
  {
    id: "task-8",
    description: "Read a chapter of a tech book",
    pomodoroNumbers: 1,
    pomodorosDone: 0,
    reminder: `${todayDate}T20:00`, // today
  },
  {
    id: "task-9",
    description: "Sketch a UI wireframe",
    pomodoroNumbers: 2,
    pomodorosDone: 0,
    reminder: "2025-06-22T09:00", // future
  },
  {
    id: "task-10",
    description: "Organize workspace",
    pomodoroNumbers: 1,
    pomodorosDone: 1,
    reminder: `${todayDate}T17:00`, // today
  },
];

export default tasks;
