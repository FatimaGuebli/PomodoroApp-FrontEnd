import React, { useState, useRef, useEffect } from "react";
import SignInModal from "./SignInModal";
import { useAuth } from "../hooks/useAuth";

const TopBar = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, loading, signOut } = useAuth();

  const name = user?.user_metadata?.full_name || user?.email || "Demo User";
  const avatarUrl = user?.user_metadata?.avatar_url || null;

  const menuRef = useRef(null);
  useEffect(() => {
    const onDocClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, []);

  const toggleSidebar = () => {
    // dispatch a plain event so the Nav listener always receives it
    document.dispatchEvent(new Event("toggle-sidebar"));
  };

  return (
    <>
      <div className="fixed top-0 left-0 right-0 h-14 bg-[#fcebea] border-b border-[#f8d8d8] z-40 flex items-center justify-between px-4 shadow-sm">
        <div className="flex items-center space-x-3">
          {/* hamburger visible on medium and smaller screens (hidden on large+) */}
          <button
            type="button"
            onClick={toggleSidebar}
            aria-label="Open menu"
            className="lg:hidden p-2 rounded-md hover:bg-[#fff2f1] transition"
          >
            {/* simple sandwich icon */}
            <svg className="w-6 h-6 text-[#4b2e2e]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M3 6h18M3 12h18M3 18h18" />
            </svg>
          </button>

          <div className="ml-3 text-sm text-[#4b2e2e] md:hidden">Welcome to the app, {name}</div>

          {/* welcome text */}
          <div className="hidden md:flex flex-col">
            <span className="text-sm text-[#4b2e2e]">Welcome to the app</span>
            <span className="text-xs font-semibold text-[#4b2e2e] truncate max-w-[160px]">{name}</span>
          </div>
        </div>

        <div className="flex items-center space-x-3 text-[#4b2e2e]">
          <button
            className="text-sm px-3 py-1 border border-[#f8d8d8] rounded-md hover:bg-[#fff2f1]"
            aria-label="Change language"
          >
            EN
          </button>

          {!user ? (
            <button
              className="text-sm px-3 py-1 bg-[#b33a3a] text-white rounded-md hover:bg-[#912d2d]"
              aria-label="Sign in"
              onClick={() => setModalOpen(true)}
            >
              Sign in
            </button>
          ) : (
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                className="flex items-center space-x-3 px-2 py-1 rounded-md hover:bg-[#fff2f1] focus:outline-none"
                onClick={() => setMenuOpen((s) => !s)}
                aria-haspopup="true"
                aria-expanded={menuOpen}
                title={name}
              >
                <div className="w-9 h-9 rounded-full bg-[#f3e6e6] overflow-hidden flex items-center justify-center">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="avatar" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-sm font-medium text-[#4b2e2e]">
                      {String(name).charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <span className="hidden sm:inline-block text-sm font-medium text-[#4b2e2e]">
                  {name}
                </span>
              </button>

              {menuOpen && (
                <div className="absolute right-0 mt-2 w-44 bg-white rounded-md shadow-lg border border-[#f0dcdc] z-50 overflow-hidden">
                  <div className="px-3 py-2 text-sm text-[#4b2e2e]">Signed in as</div>
                  <div className="px-3 pb-2 text-sm font-semibold text-[#4b2e2e] truncate">{name}</div>
                  <div className="border-t border-[#f0dcdc] px-2 py-2">
                    <button
                      className="w-full text-left px-3 py-2 text-sm text-[#b33a3a] hover:bg-[#fff2f1] rounded-md"
                      onClick={() => { signOut().catch(() => {}); setMenuOpen(false); }}
                    >
                      Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <SignInModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
};

export default TopBar;