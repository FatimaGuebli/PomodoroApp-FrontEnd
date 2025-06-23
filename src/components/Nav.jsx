import React from "react";
import { NavLink } from "react-router-dom";

const Nav = () => {
  const linkStyle = ({ isActive }) =>
    `block px-4 py-2 rounded-md font-medium transition duration-150 ${
      isActive ? "bg-yellow-400 text-gray-900" : "text-white hover:bg-gray-800"
    }`;

  return (
    <nav className="w-64 bg-gray-900 text-white flex flex-col min-h-screen p-6 shadow-lg">
      {/* Top + Links */}
      <div className="flex flex-col flex-grow">
        {/* Logo */}
        <h1 className="text-2xl font-extrabold text-yellow-400 mb-8 text-center tracking-wide">
          🍅 Pomodoro App
        </h1>

        {/* Navigation Links */}
        <div className="space-y-3">
          <NavLink to="/" className={linkStyle}>
            Pomodoro
          </NavLink>
          <NavLink to="/goals" className={linkStyle}>
            Goals
          </NavLink>
          <NavLink to="/quotes" className={linkStyle}>
            Quotes
          </NavLink>
        </div>

        {/* Push settings down */}
        <div className="flex-grow"></div>
      </div>

      {/* Settings pinned to bottom */}
      <div className="pt-4 border-t border-gray-700">
        <NavLink to="/settings" className={linkStyle}>
          Settings
        </NavLink>
      </div>
    </nav>
  );
};

export default Nav;
