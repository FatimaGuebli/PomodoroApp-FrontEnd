import React, { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { NavLink } from "react-router-dom";
import { RiTimerLine } from "react-icons/ri";
import { GoGoal } from "react-icons/go";
import { BsChatRightQuote } from "react-icons/bs";
import { IoSettingsOutline } from "react-icons/io5";
import { HiOutlineMenu } from "react-icons/hi";
import { HiXMark } from "react-icons/hi2";

const Nav = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();
  const name = user?.user_metadata?.full_name || user?.email || "Demo User";

  // listen for TopBar toggle event (toggle open/close)
  useEffect(() => {
    const onToggle = (e) => {
      // debug: confirm event fired
      // remove this console.log when verified
      console.log("Nav: toggle-sidebar event received", e);
      setSidebarOpen((s) => !s);
    };
    window.addEventListener("toggle-sidebar", onToggle);
    document.addEventListener("toggle-sidebar", onToggle); // fallback
    return () => {
      window.removeEventListener("toggle-sidebar", onToggle);
      document.removeEventListener("toggle-sidebar", onToggle);
    };
  }, []);

  const linkStyle = ({ isActive }) =>
    `block px-4 py-2 rounded-lg font-semibold tracking-wide transition duration-200 ${
      isActive
        ? "bg-[#b33a3a] text-white shadow-md"
        : "text-[#4b2e2e] hover:bg-[#fbe9e7] hover:text-[#b33a3a]"
    }`;

  return (
    <>
      {/* === Topbar on medium & smaller screens === */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-30 flex items-center justify-between px-4 py-3 bg-[#fef6f4] border-b border-[#efd0ca] shadow">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen((s) => !s)}
            aria-label="Toggle menu"
            className="text-[#b33a3a] text-2xl"
          >
            <HiOutlineMenu />
          </button>

          {/* welcome text next to hamburger on md and smaller */}
          <div className="flex flex-col">
            <span className="text-sm text-[#4b2e2e]">Welcome to the app</span>
            <span className="text-base font-bold text-[#b33a3a] truncate max-w-[180px]">
              {name}
            </span>
          </div>
        </div>
      </div>

      {/* Spacer for mobile topbar */}
      <div className="lg:hidden h-[60px]" />

      {/* === Sidebar Overlay === */}
      {/* === Animated Sidebar + Overlay === */}
      <div
        className={`fixed inset-0 z-30 transition-opacity duration-300 ${
          sidebarOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      >
        {/* Overlay */}
        <div
          className="absolute inset-0 bg-[#0000001a] backdrop-blur-[2px] transition-opacity duration-300"
          onClick={() => setSidebarOpen(false)}
        />

        {/* Sidebar */}
        <div
          className={`absolute top-0 left-0 h-full w-1/2 bg-[#fef6f4] shadow-2xl p-6 transform transition-transform duration-300 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-[#b33a3a]">Menu</h2>
            <button
              onClick={() => setSidebarOpen(false)}
              className="text-2xl text-[#b33a3a]"
            >
              <HiXMark />
            </button>
          </div>

          {/* Navigation Links */}
          <NavLink
            to="/"
            className={linkStyle}
            onClick={() => setSidebarOpen(false)}
          >
            <div className="flex items-center space-x-2">
              <RiTimerLine className="w-5 h-5" />
              <span>Pomodoro</span>
            </div>
          </NavLink>

          <NavLink
            to="/goals"
            className={linkStyle}
            onClick={() => setSidebarOpen(false)}
          >
            <div className="flex items-center space-x-2">
              <GoGoal className="w-5 h-5" />
              <span>Goals</span>
            </div>
          </NavLink>

          <NavLink
            to="/quotes"
            className={linkStyle}
            onClick={() => setSidebarOpen(false)}
          >
            <div className="flex items-center space-x-2">
              <BsChatRightQuote className="w-5 h-5" />
              <span>Quotes</span>
            </div>
          </NavLink>

          {user && (
            <NavLink
              to="/settings"
              className={linkStyle}
              onClick={() => setSidebarOpen(false)}
            >
              <div className="flex items-center space-x-2">
                <IoSettingsOutline className="w-5 h-5" />
                <span>Settings</span>
              </div>
            </NavLink>
          )}
        </div>
      </div>

      {/* === Desktop Sidebar (fixed above everything) === */}
      <nav
        className="hidden md:flex fixed left-0 top-0 z-50 flex-col h-screen p-6 shadow-xl border-r border-[#efd0ca] bg-[#fef6f4] text-[#4b2e2e]
        md:w-[200px] lg:w-[280px] transition-all duration-300"
      >
        <div className="flex flex-col flex-grow">
          <h1 className="text-2xl font-bold text-[#b33a3a] mb-10 text-center tracking-wide">
            Pomodoro App
          </h1>

          <div className="space-y-3">
            <NavLink to="/" className={linkStyle}>
              <div className="flex items-center space-x-2">
                <RiTimerLine className="w-5 h-5" />
                <span>Pomodoro</span>
              </div>
            </NavLink>

            <NavLink to="/goals" className={linkStyle}>
              <div className="flex items-center space-x-2">
                <GoGoal className="w-5 h-5" />
                <span>Goals</span>
              </div>
            </NavLink>

            <NavLink to="/quotes" className={linkStyle}>
              <div className="flex items-center space-x-2">
                <BsChatRightQuote className="w-5 h-5" />
                <span>Quotes</span>
              </div>
            </NavLink>

            {user && (
              <div className="pt-6 border-t border-[#efd0ca]">
                <NavLink to="/settings" className={linkStyle}>
                  <div className="flex items-center space-x-2">
                    <IoSettingsOutline className="w-5 h-5" />
                    <span>Settings</span>
                  </div>
                </NavLink>
              </div>
            )}
          </div>
        </div>
      </nav>
    </>
  );
};

export default Nav;
