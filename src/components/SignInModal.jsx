import React, { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import supabase from "../utils/supabase";

const GoogleIcon = () => (
  <svg className="w-5 h-5 mr-2" viewBox="0 0 533.5 544.3" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M533.5 278.4c0-17.4-1.6-34-4.7-50.1H272v95.0h147.4c-6.3 33.7-26.3 62.3-56.0 81.4v67.7h90.5c53.0-48.8 83.6-120.8 83.6-194.0z" fill="#4285F4"/>
    <path d="M272 544.3c75.6 0 139.1-24.9 185.5-67.7l-90.5-67.7c-25 17-57 27-95 27-73 0-135-49.3-157-115.6H22.4v72.5C68.8 485.2 162.7 544.3 272 544.3z" fill="#34A853"/>
    <path d="M115 333.9c-11.6-34.4-11.6-71.6 0-106l-92.6-72.5C2.5 196.6 0 233.7 0 272s2.5 75.4 22.4 116.6l92.6-54.7z" fill="#FBBC05"/>
    <path d="M272 106.1c39 0 74 13.4 102 39.8l76.2-76.2C411.3 24 347 0 272 0 162.7 0 68.8 59.1 22.4 144.3l92.6 72.5C137 155.4 199 106.1 272 106.1z" fill="#EA4335"/>
  </svg>
);

const EyeIcon = ({ open }) => (
  <svg className="w-5 h-5 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    {open ? (
      <path d="M17.94 17.94C16.08 19.2 14.07 20 12 20 7 20 3.11 16.11 3.11 11.11 3.11 9.04 3.91 7.03 5.17 5.17M21 21L3 3" strokeLinecap="round" strokeLinejoin="round"/>
    ) : (
      <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" strokeLinecap="round" strokeLinejoin="round"/>
    )}
  </svg>
);

const SignInModal = ({ open, onClose }) => {
  const { signInWithGoogle } = useAuth();
  const [isSignup, setIsSignup] = useState(false);

  // login fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // signup fields
  const [username, setUsername] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // toggles & loading
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const handleGoogle = async () => {
    try {
      await signInWithGoogle();
    } catch (err) {
      console.error("Google sign-in error:", err);
      alert(err?.message || "Google sign-in failed.");
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (error) throw error;
      onClose();
    } catch (err) {
      console.error("Login error:", err);
      alert(err?.message || "Failed to sign in with email/password.");
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    if (!username.trim()) return alert("Enter a username.");
    if (signupPassword !== confirmPassword) return alert("Passwords do not match.");
    if (signupPassword.length < 6) return alert("Password must be at least 6 characters.");
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: signupEmail.trim(),
        password: signupPassword,
        options: {
          data: { full_name: username.trim() },
        },
      });
      if (error) throw error;
      alert("Account created — check your email for confirmation (if required).");
      // switch to login view and prefill email
      setIsSignup(false);
      setEmail(signupEmail);
      setPassword("");
      // optionally close modal: onClose();
    } catch (err) {
      console.error("Sign up error:", err);
      alert(err?.message || "Failed to create account.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center">
      {/* backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* modal */}
      <div
        role="dialog"
        aria-modal="true"
        className="relative z-70 w-full max-w-md bg-white rounded-xl shadow-xl p-6 mx-4"
      >
        <header className="mb-4">
          <h3 className="text-2xl font-semibold text-[#4b2e2e]">{isSignup ? "Create account" : "Log in"}</h3>
          <p className="text-sm text-gray-600">
            {isSignup
              ? "Create an account with email, password and username."
              : "Enter your email and password to continue."}
          </p>
        </header>

        {isSignup ? (
          <form onSubmit={handleSignUp} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#4b2e2e]">Username</label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Your display name"
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#f8d8d8]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#4b2e2e]">Email (Gmail)</label>
              <input
                type="email"
                required
                value={signupEmail}
                onChange={(e) => setSignupEmail(e.target.value)}
                placeholder="you@gmail.com"
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#f8d8d8]"
              />
            </div>

            <div className="relative">
              <label className="block text-sm font-medium text-[#4b2e2e]">Password</label>
              <input
                type={showPassword ? "text" : "password"}
                required
                value={signupPassword}
                onChange={(e) => setSignupPassword(e.target.value)}
                placeholder="Create a password"
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#f8d8d8]"
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute right-2 top-9 p-1"
                aria-label="Toggle password visibility"
              >
                <EyeIcon open={showPassword} />
              </button>
            </div>

            <div className="relative">
              <label className="block text-sm font-medium text-[#4b2e2e]">Confirm password</label>
              <input
                type={showConfirm ? "text" : "password"}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm password"
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#f8d8d8]"
              />
              <button
                type="button"
                onClick={() => setShowConfirm((s) => !s)}
                className="absolute right-2 top-9 p-1"
                aria-label="Toggle confirm password visibility"
              >
                <EyeIcon open={showConfirm} />
              </button>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full px-4 py-2 bg-[#b33a3a] text-white rounded-md text-sm"
              >
                {loading ? "Creating..." : "Create account"}
              </button>
            </div>

            <div className="flex justify-center">
              <button type="button" onClick={() => setIsSignup(false)} className="text-sm mt-2 text-[#4b2e2e] underline">
                Already have an account? Log in
              </button>
            </div>
          </form>
        ) : (
          <>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#4b2e2e]">Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#f8d8d8]"
                />
              </div>

              <div className="relative">
                <label className="block text-sm font-medium text-[#4b2e2e]">Password</label>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#f8d8d8]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-2 top-9 p-1"
                  aria-label="Toggle password visibility"
                >
                  <EyeIcon open={showPassword} />
                </button>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full px-4 py-2 bg-[#b33a3a] text-white rounded-md text-sm"
                >
                  {loading ? "Signing in..." : "Log in"}
                </button>
              </div>

              <div className="flex justify-center">
                <button type="button" onClick={() => setIsSignup(true)} className="text-sm mt-2 text-[#4b2e2e] underline">
                  Don't have an account? Sign up
                </button>
              </div>
            </form>

            <div className="flex items-center my-4">
              <span className="flex-1 h-px bg-gray-200" />
              <span className="px-3 text-xs text-gray-500">or</span>
              <span className="flex-1 h-px bg-gray-200" />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#4b2e2e] mb-2">Continue with Google</label>
              <button
                type="button"
                onClick={handleGoogle}
                className="w-full flex items-center justify-center px-4 py-2 border rounded-md bg-white hover:bg-gray-50"
              >
                <GoogleIcon />
                <span className="text-sm font-medium text-[#222]">Continue with Google</span>
              </button>
            </div>
          </>
        )}

        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={onClose}
            className="text-sm px-3 py-1 rounded-md text-[#4b2e2e] border border-transparent hover:bg-gray-100"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default SignInModal;