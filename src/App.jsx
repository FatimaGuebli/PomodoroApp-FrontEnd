import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Nav from "./components/Nav";
import TopBar from "./components/TopBar";
import { AuthProvider } from "./hooks/useAuth";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import PomodoroPage from "./Pages/PomodoroPage/PomodoroPage";
import GoalPage from "./Pages/GoalPage/GoalPage";
import Quotes from "./Pages/Quotes";
import Settings from "./Pages/Settings";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <TopBar />
          <div className="flex min-h-screen pt-14">
            <Nav /> {/* Sidebar is fixed and above TopBar */}
            {/* main content must be offset by sidebar width on md+ */}
            <div className="flex-1 p-6 m-0 ml-0 md:ml-[200px] lg:ml-[280px]">
              <Routes>
                <Route path="/" element={<PomodoroPage />} />
                <Route path="/goals" element={<GoalPage />} />
                <Route path="/quotes" element={<Quotes />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </div>
          </div>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
