import React, { useState, useRef, useEffect } from "react";
import SignInModal from "./SignInModal";
import { useAuth } from "../hooks/useAuth";
import { useTranslation } from "react-i18next";

const TopBar = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, loading, signOut } = useAuth();
  const { i18n, t } = useTranslation();
  
  const name = user?.user_metadata?.full_name || user?.email || "Demo User";
  const avatarUrl = user?.user_metadata?.avatar_url || null;
  const currentLang = (i18n?.resolvedLanguage || i18n?.language || "en").startsWith("fr") ? "fr" : "en";
  
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

          {/* small/medium welcome text removed (silly on small screens) */}

          {/* welcome text for larger screens */}
          
        </div>

        <div className="flex items-center space-x-3 text-[#4b2e2e]">
          <div className="flex items-center space-x-2">
            <button
              title={t("topbar_switch_to_english")}
              className={`text-sm px-3 py-1 border border-[#f8d8d8] rounded-md hover:bg-[#fff2f1] ${currentLang === "en" ? "font-semibold bg-white" : "bg-transparent"}`}
              aria-label={t("topbar_switch_to_english")}
              onClick={() => i18n.changeLanguage("en")}
            >
              EN
            </button>

            <button
              title={t("topbar_switch_to_french")}
              className={`text-sm px-3 py-1 border border-[#f8d8d8] rounded-md hover:bg-[#fff2f1] ${currentLang === "fr" ? "font-semibold bg-white" : "bg-transparent"}`}
              aria-label={t("topbar_switch_to_french")}
              onClick={() => i18n.changeLanguage("fr")}
            >
              FR
            </button>
          </div>

          {!user ? (
            <button
              className="text-sm px-3 py-1 bg-[#b33a3a] text-white rounded-md hover:bg-[#912d2d]"
              aria-label="Sign in"
              onClick={() => setModalOpen(true)}
            >
              {t("sign_in")}
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
                  <div className="px-3 py-2 text-sm text-[#4b2e2e]">{t("topbar_signed_in_as")}</div>
                  <div className="px-3 pb-2 text-sm font-semibold text-[#4b2e2e] truncate">{name}</div>
                  <div className="border-t border-[#f0dcdc] px-2 py-2">
                    <button
                      className="w-full text-left px-3 py-2 text-sm text-[#b33a3a] hover:bg-[#fff2f1] rounded-md"
                      onClick={() => { signOut().catch(() => {}); setMenuOpen(false); }}
                      aria-label={t("topbar_sign_out")}
                    >
                      {t("topbar_sign_out")}
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