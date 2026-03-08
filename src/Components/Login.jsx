import { useState, useEffect } from "react";
import { PLATFORM_ICONS } from "../constants";

export default function Login({ onLogin }) {
    const [mode, setMode] = useState("login");
    const [form, setForm] = useState({ username: "", password: "", name: "" });
    const [showPass, setShowPass] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [mounted, setMounted] = useState(false);
    const [feedback, setFeedback] = useState("");

    useEffect(() => {
        const t = setTimeout(() => setMounted(true), 50);
        return () => clearTimeout(t);
    }, []);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/me`, {
                    credentials: "include"
                });
                const data = await res.json();
                if (data.authenticated) {
                    // console.log(data.user);
                    onLogin(data.user);
                }
            } catch (err) {
                console.error("Auth check failed");
            }
        };
        checkAuth();
    }, []);

    const handleChange = (field) => (e) => {
        setForm((f) => ({ ...f, [field]: e.target.value }));
        if (error) setError("");
    };

    const handleSubmit = async () => {
        if (!form.username || !form.password) { setError("All fields are required."); return; }
        if (mode === "register" && !form.name) { setError("Name is required."); return; }

        setLoading(true);
        setError("");
        // Simulate async auth — replace with your actual API call
        const url = `${import.meta.env.VITE_API_URL}/auth${(mode === "register") ? "/register" : "/login"}`;
        // console.log(url);
        const res = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(form)
        });
        const data = await res.json();
        if (!data.success) {
            setLoading(false);
            setForm({ username: "", password: "", name: "" });
            setTimeout(() => {
                setFeedback(data.msg);
                setTimeout(() => setFeedback(""), 3000);
            }, 500);
            return;
        }
        setLoading(false);

        // Call parent with user data
        onLogin?.({ name: form.name || form.username, username: form.username });
    };

    const handleOAuth = (platform) => {
        window.location.href = `${import.meta.env.VITE_API_URL}/auth/${platform}`;
    };

    const inputStyle = (focused) => ({
        width: "100%",
        boxSizing: "border-box",
        padding: "11px 14px",
        background: "#080b10",
        border: `1px solid ${focused ? "#3b82f6" : "#1e2330"}`,
        borderRadius: 8,
        color: "#e2e8f0",
        fontSize: 13,
        fontFamily: "'JetBrains Mono', monospace",
        outline: "none",
        transition: "border-color 0.2s, box-shadow 0.2s",
        boxShadow: focused ? "0 0 0 3px #3b82f610" : "none",
    });

    const [focused, setFocused] = useState({});
    const onFocus = (f) => setFocused((p) => ({ ...p, [f]: true }));
    const onBlur = (f) => setFocused((p) => ({ ...p, [f]: false }));

    // Grid nodes for background
    const nodes = Array.from({ length: 18 }, (_, i) => ({
        top: `${Math.floor(Math.random() * 90) + 5}%`,
        left: `${Math.floor(Math.random() * 90) + 5}%`,
        animationDelay: `${i * 0.3}s`,
    }));

    return (
        <div style={{
            minHeight: "100vh",
            background: "#080b10",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "'Inter', 'Segoe UI', sans-serif",
            color: "#94a3b8",
            position: "relative",
            overflow: "hidden",
        }}>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        input::placeholder { color: #334155; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.15; transform: scale(1); }
          50%       { opacity: 0.4;  transform: scale(1.6); }
        }
        @keyframes gridLine {
          0%   { opacity: 0; }
          50%  { opacity: 1; }
          100% { opacity: 0; }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .login-card {
          opacity: 0;
          animation: fadeUp 0.5s ease forwards;
          animation-delay: 0.1s;
        }
        .login-field {
          opacity: 0;
          animation: fadeUp 0.4s ease forwards;
        }
        .login-field:nth-child(1) { animation-delay: 0.2s; }
        .login-field:nth-child(2) { animation-delay: 0.3s; }
        .login-field:nth-child(3) { animation-delay: 0.4s; }
        .login-field:nth-child(4) { animation-delay: 0.5s; }

        .node-dot {
          animation: pulse 4s ease-in-out infinite;
        }
        .oauth-btn:hover {
          background: #1a2035 !important;
          border-color: #334155 !important;
          color: #e2e8f0 !important;
        }
        .toggle-mode:hover { color: #60a5fa !important; }
        .submit-btn:hover:not(:disabled) { background: #2563eb !important; }
        .submit-btn:active:not(:disabled) { transform: scale(0.98); }
      `}</style>

            {/* ── Background: subtle grid + floating nodes ── */}
            <div style={{
                position: "absolute", inset: 0, zIndex: 0,
                backgroundImage: `
          linear-gradient(#1e233008 1px, transparent 1px),
          linear-gradient(90deg, #1e233008 1px, transparent 1px)
        `,
                backgroundSize: "40px 40px",
            }} />

            {/* Glow orb */}
            <div style={{
                position: "absolute", top: "20%", left: "50%",
                transform: "translateX(-50%)",
                width: 500, height: 300,
                background: "radial-gradient(ellipse, #3b82f608 0%, transparent 70%)",
                pointerEvents: "none", zIndex: 0,
            }} />

            {/* Floating nodes */}
            {nodes.map((n, i) => (
                <div key={i} className="node-dot" style={{
                    position: "absolute", width: 3, height: 3,
                    borderRadius: "50%", background: "#3b82f6",
                    top: n.top, left: n.left,
                    animationDelay: n.animationDelay,
                    zIndex: 0,
                }} />
            ))}

            {/* ── Card ── */}
            <div className="login-card" style={{
                position: "relative", zIndex: 1,
                width: "100%", maxWidth: 420,
                margin: "0 16px",
                background: "#0a0d12",
                border: "1px solid #1e2330",
                borderRadius: 14,
                padding: "36px 32px",
                boxShadow: "0 0 0 1px #ffffff04, 0 32px 64px #00000060",
            }}>

                {/* error card */}
                {(feedback) ?
                    <div style={{
                        padding: "10px 14px",
                        background: "#ef444410",
                        border: "1px solid #ef444430",
                        borderLeft: "3px solid #ef4444",
                        borderRadius: 8,
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 10,
                    }}>
                        <span style={{ color: "#ef4444", fontSize: 15, lineHeight: 1.4 }}>⚠</span>
                        <div>
                            <div style={{ fontSize: 13, fontWeight: 600, color: "#f87171", marginBottom: 2 }}>
                                Authentication failed
                            </div>
                            <div style={{ fontSize: 12, color: "#94a3b8" }}>
                                {feedback}
                            </div>
                        </div>
                    </div>
                    : null}
                {/* Logo + title */}
                <div style={{ textAlign: "center", marginBottom: 32 }}>
                    <img
                        src="./logo.png"
                        alt="Logo"
                        style={{ width: 40, height: 50, objectFit: "contain", borderRadius: "10px" }}
                    />
                    <div style={{ fontSize: 20, fontWeight: 800, color: "#f1f5f9", letterSpacing: "-0.5px", marginBottom: 4 }}>
                        {mode === "login" ? "Welcome back" : "Create account"}
                    </div>
                    <div style={{ fontSize: 12, color: "#475569" }}>
                        {mode === "login"
                            ? "Sign in to PipelineHub"
                            : "Start monitoring your repositories"}
                    </div>
                </div>

                {/* OAuth buttons */}
                <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
                    {[
                        { key: "github", color: "#e2e8f0" },
                        { key: "gitlab", color: "#fc6d26" },
                        { key: "bitbucket", color: "#0052cc" },
                    ].map(({ key, color }, i) => (
                        <button
                            key={key}
                            className="oauth-btn"
                            onClick={() => handleOAuth(key)}
                            title={`Continue with ${key.charAt(0).toUpperCase() + key.slice(1)}`}
                            style={{
                                flex: 1,
                                display: "flex", alignItems: "center", justifyContent: "center",
                                padding: "11px",
                                background: "#0f1117",
                                border: "1px solid #1e2330",
                                borderRadius: 8, cursor: "pointer",
                                color,
                                transition: "all 0.15s",
                                opacity: 0,
                                animation: `fadeUp 0.4s ease forwards ${0.15 + i * 0.08}s`,
                            }}
                        >
                            {PLATFORM_ICONS[key]}
                        </button>
                    ))}
                </div>

                {/* Divider */}
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24, opacity: 0, animation: "fadeUp 0.4s ease forwards 0.4s" }}>
                    <div style={{ flex: 1, height: 1, background: "#1e2330" }} />
                    <span style={{ fontSize: 11, color: "#334155", fontFamily: "monospace", letterSpacing: "0.5px" }}>OR</span>
                    <div style={{ flex: 1, height: 1, background: "#1e2330" }} />
                </div>

                {/* Form fields */}
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

                    {mode === "register" && (
                        <div className="login-field">
                            <label style={{ fontSize: 11, color: "#475569", display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.8px", fontWeight: 600 }}>
                                Full Name
                            </label>
                            <input
                                type="text"
                                placeholder="Ali Hassan"
                                value={form.name}
                                onChange={handleChange("name")}
                                onFocus={() => onFocus("name")}
                                onBlur={() => onBlur("name")}
                                style={inputStyle(focused.name)}
                            />
                        </div>
                    )}

                    <div className="login-field">
                        <label style={{ fontSize: 11, color: "#475569", display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.8px", fontWeight: 600 }}>
                            Username
                        </label>
                        <input
                            type="text"
                            placeholder="John Doe"
                            value={form.username}
                            onChange={handleChange("username")}
                            onFocus={() => onFocus("username")}
                            onBlur={() => onBlur("username")}
                            style={inputStyle(focused.username)}
                        />
                    </div>

                    <div className="login-field">
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                            <label style={{ fontSize: 11, color: "#475569", textTransform: "uppercase", letterSpacing: "0.8px", fontWeight: 600 }}>
                                Password
                            </label>
                            {mode === "login" && (
                                <button style={{ background: "none", border: "none", fontSize: 11, color: "#3b82f6", cursor: "pointer", padding: 0 }}>
                                    Forgot password?
                                </button>
                            )}
                        </div>
                        <div style={{ position: "relative" }}>
                            <input
                                type={showPass ? "text" : "password"}
                                placeholder="••••••••••••"
                                value={form.password}
                                onChange={handleChange("password")}
                                onFocus={() => onFocus("password")}
                                onBlur={() => onBlur("password")}
                                style={{ ...inputStyle(focused.password), paddingRight: 42 }}
                            />
                            <button
                                onClick={() => setShowPass(!showPass)}
                                style={{
                                    position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
                                    background: "none", border: "none", color: "#334155",
                                    cursor: "pointer", padding: 0, fontSize: 13, lineHeight: 1,
                                    transition: "color 0.15s",
                                }}
                                onMouseEnter={e => e.currentTarget.style.color = "#64748b"}
                                onMouseLeave={e => e.currentTarget.style.color = "#334155"}
                            >
                                {showPass ? "⊙" : "⊗"}
                            </button>
                        </div>
                    </div>

                    {/* Error */}
                    {error && (
                        <div style={{
                            padding: "9px 12px", borderRadius: 7,
                            background: "#ef444412", border: "1px solid #ef444430",
                            fontSize: 12, color: "#f87171",
                            display: "flex", alignItems: "center", gap: 8,
                        }}>
                            <span>⚠</span> {error}
                        </div>
                    )}

                    {/* Submit */}
                    <div className="login-field">
                        <button
                            className="submit-btn"
                            onClick={handleSubmit}
                            disabled={loading}
                            style={{
                                width: "100%", padding: "12px",
                                background: "#3b82f6",
                                border: "none", borderRadius: 8,
                                color: "#fff", fontWeight: 700, fontSize: 13,
                                cursor: loading ? "not-allowed" : "pointer",
                                transition: "background 0.15s, transform 0.1s",
                                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                                letterSpacing: "0.3px",
                                opacity: loading ? 0.8 : 1,
                            }}
                        >
                            {loading ? (
                                <>
                                    <div style={{
                                        width: 14, height: 14,
                                        border: "2px solid #ffffff40",
                                        borderTop: "2px solid #fff",
                                        borderRadius: "50%",
                                        animation: "spin 0.7s linear infinite",
                                    }} />
                                    {mode === "login" ? "Signing in…" : "Creating account…"}
                                </>
                            ) : (
                                mode === "login" ? "Sign in" : "Create account"
                            )}
                        </button>
                    </div>
                </div>

                {/* Toggle mode */}
                <div style={{ textAlign: "center", marginTop: 24, fontSize: 12, color: "#475569" }}>
                    {mode === "login" ? "Don't have an account? " : "Already have an account? "}
                    <button
                        className="toggle-mode"
                        onClick={() => { setMode(m => m === "login" ? "register" : "login"); setError(""); setForm({ username: "", password: "", name: "" }); }}
                        style={{
                            background: "none", border: "none",
                            color: "#3b82f6", cursor: "pointer",
                            fontSize: 12, fontWeight: 600, padding: 0,
                            transition: "color 0.15s",
                        }}
                    >
                        {mode === "login" ? "Create one" : "Sign in"}
                    </button>
                </div>

                {/* Footer note */}
                <div style={{
                    marginTop: 28, paddingTop: 20,
                    borderTop: "1px solid #1e2330",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                }}>
                    <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#10b981", boxShadow: "0 0 5px #10b98180" }} />
                    <span style={{ fontSize: 11, color: "#334155", fontFamily: "monospace" }}>
                        All systems operational
                    </span>
                </div>
            </div>
        </div>
    );
}