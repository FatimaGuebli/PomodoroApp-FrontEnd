import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Nav from "./components/Nav";

import PomodoroPage from "./Pages/PomodoroPage/PomodoroPage";
import GoalsPage from "./Pages/GoalsPage";
import GoalDetailPage from "./Pages/GoalDetailPage";
import Quotes from "./Pages/Quotes";
import Settings from "./Pages/Settings";

const App = () => {
  return (
    <Router>
      <div className="flex min-h-screen ">
        <Nav /> {/* Sidebar stays fixed */}
        <div className="flex-1 p-6">
          <Routes>
            <Route path="/" element={<PomodoroPage />} />
            <Route path="/goals" element={<GoalsPage />} />
            <Route path="/goals/:id" element={<GoalDetailPage />} />
            <Route path="/quotes" element={<Quotes />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
};

export default App;
