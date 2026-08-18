import { useState, useEffect } from "react";
import { Mail, Lock, User, Eye, EyeOff, CheckCircle2, AlertCircle, Loader2, ArrowRight, Sun, Moon } from "lucide-react";
import { PLATFORM_ICONS } from "../constants";
import { useTheme } from "../context/ThemeContext";

export default function Login({ onLogin }) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ email: "", password: "", name: "" });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState("");
  const [feedbackType, setFeedbackType] = useState(null);
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState("");
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch(`${window.__ENV__.VITE_API_URL}/auth/me`, {
          credentials: "include",
        });
        const data = await res.json();
        if (data.authenticated) {
          onLogin(data.user);
        }
      } catch {
        // Not authenticated yet
      }
    };
    checkAuth();
  }, [onLogin]);

  const handleChange = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!form.email || !form.password) {
      setError("Please fill in all required fields.");
      return;
    }
    if (mode === "register" && !form.name) {
      setError("Please enter your full name.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const endpoint = mode === "register" ? "/auth/register" : "/auth/login";
      const res = await fetch(`${window.__ENV__.VITE_API_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (!data.success) {
        setLoading(false);
        setForm({ email: "", password: "", name: "" });
        setFeedbackType("error");
        setFeedback(data.msg || "Authentication failed.");
        setTimeout(() => {
          setFeedback("");
          setFeedbackType(null);
        }, 4000);
        return;
      }

      setLoading(false);
      onLogin?.(data.user);
    } catch {
      setLoading(false);
      setError("Network error. Please try again.");
    }
  };

  const handleForgotSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!forgotEmail) {
      setForgotError("Email is required.");
      return;
    }
    setForgotLoading(true);
    setForgotError("");

    try {
      const res = await fetch(`${window.__ENV__.VITE_API_URL}/auth/forgot`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail }),
      });
      const data = await res.json();

      if (!data.success) {
        setForgotError(data.msg || "Unable to send reset email.");
      } else {
        setFeedbackType("success");
        setFeedback(data.msg || "Password reset instructions sent.");
        setShowForgot(false);
        setForgotEmail("");
        setTimeout(() => {
          setFeedback("");
          setFeedbackType(null);
        }, 4500);
      }
    } catch {
      setForgotError("Unable to process request.");
    } finally {
      setForgotLoading(false);
    }
  };

  const handleOAuth = (platform) => {
    window.location.href = `${window.__ENV__.VITE_API_URL}/auth/${platform}`;
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--bg-app)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px 16px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Floating Theme Switcher */}
      <button
        onClick={toggleTheme}
        title={theme === "light" ? "Switch to Dark Mode" : "Switch to Light Mode"}
        style={{
          position: "absolute",
          top: 20,
          right: 20,
          width: 40,
          height: 40,
          borderRadius: "50%",
          border: "1px solid var(--border-base)",
          background: "var(--bg-card)",
          color: "var(--text-secondary)",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "var(--shadow-sm)",
          zIndex: 10,
        }}
      >
        {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
      </button>

      {/* Ambient background decoration */}
      <div
        style={{
          position: "absolute",
          top: "10%",
          left: "50%",
          transform: "translateX(-50%)",
          width: 600,
          height: 400,
          background: "radial-gradient(ellipse, rgba(37,99,235,0.07) 0%, transparent 70%)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      {/* Main Container */}
      <div
        style={{
          width: "100%",
          maxWidth: 440,
          position: "relative",
          zIndex: 1,
          animation: "fadeIn 0.3s ease-out forwards",
        }}
      >
        {/* Brand Header */}
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 14,
              background: "linear-gradient(135deg, var(--primary), #6366f1)",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#ffffff",
              fontWeight: 900,
              fontSize: 22,
              marginBottom: 16,
              boxShadow: "0 8px 20px rgba(37,99,235,0.25)",
            }}
          >
            P
          </div>
          <h1
            style={{
              fontSize: 24,
              fontWeight: 800,
              color: "var(--text-primary)",
              letterSpacing: "-0.5px",
              marginBottom: 6,
            }}
          >
            {mode === "login" ? "Welcome to PipelineHub" : "Create Developer Account"}
          </h1>
          <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.5 }}>
            {mode === "login"
              ? "Unified VCS webhooks, automation & event intelligence"
              : "Start streaming events across GitHub, GitLab, and Bitbucket"}
          </p>
        </div>

        {/* Card Surface */}
        <div
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border-base)",
            borderRadius: 16,
            padding: "32px 28px",
            boxShadow: "var(--shadow-lg)",
          }}
        >
          {/* Feedback alert */}
          {feedback && (
            <div
              style={{
                marginBottom: 20,
                padding: "12px 14px",
                borderRadius: 10,
                background: feedbackType === "success" ? "var(--success-light)" : "var(--danger-light)",
                border: `1px solid ${feedbackType === "success" ? "var(--success-border)" : "var(--danger-border)"}`,
                display: "flex",
                alignItems: "flex-start",
                gap: 10,
              }}
            >
              {feedbackType === "success" ? (
                <CheckCircle2 size={18} color="var(--success)" style={{ marginTop: 2, flexShrink: 0 }} />
              ) : (
                <AlertCircle size={18} color="var(--danger)" style={{ marginTop: 2, flexShrink: 0 }} />
              )}
              <div style={{ fontSize: 13, color: feedbackType === "success" ? "var(--success)" : "var(--danger)", lineHeight: 1.4, fontWeight: 500 }}>
                {feedback}
              </div>
            </div>
          )}

          {/* OAuth Buttons */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 22 }}>
            {[
              { key: "github", label: "GitHub" },
              { key: "gitlab", label: "GitLab" },
              { key: "bitbucket", label: "Bitbucket" },
            ].map(({ key, label }) => (
              <button
                key={key}
                type="button"
                onClick={() => handleOAuth(key)}
                title={`Continue with ${label}`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  padding: "10px 0",
                  background: "var(--bg-card-subtle)",
                  border: "1px solid var(--border-base)",
                  borderRadius: 10,
                  color: "var(--text-primary)",
                  cursor: "pointer",
                  fontSize: 13,
                  fontWeight: 600,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "var(--bg-hover)";
                  e.currentTarget.style.borderColor = "var(--border-strong)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "var(--bg-card-subtle)";
                  e.currentTarget.style.borderColor = "var(--border-base)";
                }}
              >
                {PLATFORM_ICONS[key]}
                <span>{label}</span>
              </button>
            ))}
          </div>

          {/* Divider */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 22 }}>
            <div style={{ flex: 1, height: 1, background: "var(--border-base)" }} />
            <span style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", letterSpacing: "0.5px" }}>
              OR WITH EMAIL
            </span>
            <div style={{ flex: 1, height: 1, background: "var(--border-base)" }} />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {mode === "register" && (
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6 }}>
                  Full Name
                </label>
                <div style={{ position: "relative" }}>
                  <User size={16} color="var(--text-muted)" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
                  <input
                    type="text"
                    placeholder="Alex Morgan"
                    value={form.name}
                    onChange={handleChange("name")}
                    style={{
                      width: "100%",
                      padding: "11px 12px 11px 38px",
                      borderRadius: 10,
                      border: "1px solid var(--border-base)",
                      background: "var(--bg-input)",
                      color: "var(--text-primary)",
                      fontSize: 13,
                      outline: "none",
                    }}
                  />
                </div>
              </div>
            )}

            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6 }}>
                Work Email
              </label>
              <div style={{ position: "relative" }}>
                <Mail size={16} color="var(--text-muted)" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
                <input
                  type="email"
                  placeholder="alex@company.com"
                  value={form.email}
                  onChange={handleChange("email")}
                  style={{
                    width: "100%",
                    padding: "11px 12px 11px 38px",
                    borderRadius: 10,
                    border: "1px solid var(--border-base)",
                    background: "var(--bg-input)",
                    color: "var(--text-primary)",
                    fontSize: 13,
                    outline: "none",
                  }}
                />
              </div>
            </div>

            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)" }}>
                  Password
                </label>
                {mode === "login" && (
                  <button
                    type="button"
                    onClick={() => {
                      setShowForgot(true);
                      setForgotError("");
                      setForgotEmail(form.email || "");
                    }}
                    style={{
                      background: "none",
                      border: "none",
                      color: "var(--primary)",
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: "pointer",
                      padding: 0,
                    }}
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div style={{ position: "relative" }}>
                <Lock size={16} color="var(--text-muted)" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
                <input
                  type={showPass ? "text" : "password"}
                  placeholder="••••••••••••"
                  value={form.password}
                  onChange={handleChange("password")}
                  style={{
                    width: "100%",
                    padding: "11px 40px 11px 38px",
                    borderRadius: 10,
                    border: "1px solid var(--border-base)",
                    background: "var(--bg-input)",
                    color: "var(--text-primary)",
                    fontSize: 13,
                    fontFamily: "'JetBrains Mono', monospace",
                    outline: "none",
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  style={{
                    position: "absolute",
                    right: 12,
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    color: "var(--text-muted)",
                    cursor: "pointer",
                    padding: 0,
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <div
                style={{
                  padding: "10px 12px",
                  borderRadius: 8,
                  background: "var(--danger-light)",
                  border: "1px solid var(--danger-border)",
                  color: "var(--danger)",
                  fontSize: 12,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <AlertCircle size={15} style={{ flexShrink: 0 }} />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                marginTop: 4,
                width: "100%",
                padding: "12px",
                borderRadius: 10,
                border: "none",
                background: "var(--primary)",
                color: "#ffffff",
                fontSize: 14,
                fontWeight: 700,
                cursor: loading ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                boxShadow: "0 4px 14px rgba(37,99,235,0.3)",
              }}
            >
              {loading ? (
                <>
                  <Loader2 size={16} style={{ animation: "spin 0.8s linear infinite" }} />
                  <span>{mode === "login" ? "Authenticating…" : "Creating account…"}</span>
                </>
              ) : (
                <>
                  <span>{mode === "login" ? "Sign In" : "Get Started"}</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Toggle Login/Register */}
          <div style={{ marginTop: 22, textAlign: "center", fontSize: 13, color: "var(--text-secondary)" }}>
            {mode === "login" ? (
              <>
                Don't have an account?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setMode("register");
                    setError("");
                  }}
                  style={{
                    background: "none",
                    border: "none",
                    color: "var(--primary)",
                    fontWeight: 700,
                    cursor: "pointer",
                    padding: 0,
                  }}
                >
                  Create one now
                </button>
              </>
            ) : (
              <>
                Already registered?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setMode("login");
                    setError("");
                  }}
                  style={{
                    background: "none",
                    border: "none",
                    color: "var(--primary)",
                    fontWeight: 700,
                    cursor: "pointer",
                    padding: 0,
                  }}
                >
                  Sign in
                </button>
              </>
            )}
          </div>
        </div>

        {/* System operational badge */}
        <div style={{ marginTop: 20, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
          <div
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: "var(--success)",
              boxShadow: "0 0 6px rgba(16, 185, 129, 0.5)",
            }}
          />
          <span style={{ fontSize: 12, color: "var(--text-muted)", fontFamily: "'JetBrains Mono', monospace" }}>
            All webhook endpoints active & verified
          </span>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgot && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.5)",
            backdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100,
            padding: 20,
          }}
          onClick={() => setShowForgot(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: 420,
              background: "var(--bg-card)",
              border: "1px solid var(--border-base)",
              borderRadius: 16,
              padding: 28,
              boxShadow: "var(--shadow-xl)",
              animation: "fadeIn 0.25s ease-out forwards",
            }}
          >
            <h2 style={{ fontSize: 18, fontWeight: 800, color: "var(--text-primary)", marginBottom: 6 }}>
              Reset your password
            </h2>
            <p style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 18, lineHeight: 1.5 }}>
              Enter your registered account email and we'll send you secure recovery instructions.
            </p>

            <form onSubmit={handleForgotSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <input
                type="email"
                placeholder="alex@company.com"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                style={{
                  width: "100%",
                  padding: "11px 14px",
                  borderRadius: 10,
                  border: "1px solid var(--border-base)",
                  background: "var(--bg-input)",
                  color: "var(--text-primary)",
                  fontSize: 13,
                  outline: "none",
                }}
              />

              {forgotError && (
                <div
                  style={{
                    padding: "9px 12px",
                    borderRadius: 8,
                    background: "var(--danger-light)",
                    border: "1px solid var(--danger-border)",
                    color: "var(--danger)",
                    fontSize: 12,
                  }}
                >
                  {forgotError}
                </div>
              )}

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 6 }}>
                <button
                  type="button"
                  onClick={() => setShowForgot(false)}
                  style={{
                    padding: "9px 14px",
                    borderRadius: 8,
                    border: "1px solid var(--border-base)",
                    background: "transparent",
                    color: "var(--text-secondary)",
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={forgotLoading}
                  style={{
                    padding: "9px 16px",
                    borderRadius: 8,
                    border: "none",
                    background: "var(--primary)",
                    color: "#ffffff",
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: forgotLoading ? "not-allowed" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  {forgotLoading && <Loader2 size={14} style={{ animation: "spin 0.8s linear infinite" }} />}
                  <span>{forgotLoading ? "Sending…" : "Send Reset Link"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}