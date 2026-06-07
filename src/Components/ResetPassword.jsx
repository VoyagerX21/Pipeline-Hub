import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const initialStatus = "loading";

function normalizeMessage(value) {
    return String(value || "").toLowerCase();
}

export default function ResetPassword() {
    const { token } = useParams();
    const navigate = useNavigate();

    const [status, setStatus] = useState(initialStatus);
    const [loading, setLoading] = useState(false);
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [info, setInfo] = useState("");

    const passwordChecks = useMemo(() => {
        const lengthOk = password.length >= 8;
        const hasUppercase = /[A-Z]/.test(password);
        const hasLowercase = /[a-z]/.test(password);
        const hasNumber = /\d/.test(password);
        return { lengthOk, hasUppercase, hasLowercase, hasNumber };
    }, [password]);

    useEffect(() => {
        if (!token) {
            setStatus("invalid");
            setInfo("The reset link is missing its token.");
            return;
        }

        const controller = new AbortController();
        let active = true;

        const verifyToken = async () => {
            setStatus("loading");
            setError("");
            setInfo("");

            try {
                const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/verify/forgot/${token}`, {
                    signal: controller.signal,
                });
                const data = await res.json().catch(() => ({}));
                const message = normalizeMessage(data.msg || data.message || data.error);

                if (!active) return;

                if (res.ok && (data.success ?? data.valid ?? true)) {
                    setStatus("ready");
                    return;
                }

                if (res.status === 410 || data.expired || message.includes("expired")) {
                    setStatus("expired");
                    setInfo(data.msg || data.message || "This reset link has expired.");
                    return;
                }

                if (res.status === 401 || res.status === 403 || data.invalid || message.includes("invalid")) {
                    setStatus("invalid");
                    setInfo(data.msg || data.message || "This reset link is invalid.");
                    return;
                }

                setStatus("invalid");
                setInfo(data.msg || data.message || "We could not verify this reset link.");
            } catch (err) {
                if (!active || err.name === "AbortError") return;
                setStatus("invalid");
                setInfo("We could not verify this reset link.");
            }
        };

        verifyToken();

        return () => {
            active = false;
            controller.abort();
        };
    }, [token]);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError("");
        setInfo("");

        if (!password || !confirmPassword) {
            setError("Both password fields are required.");
            return;
        }

        if (!passwordChecks.lengthOk) {
            setError("Password must be at least 8 characters long.");
            return;
        }

        if (!passwordChecks.hasUppercase || !passwordChecks.hasLowercase || !passwordChecks.hasNumber) {
            setError("Password must include uppercase, lowercase, and a number.");
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        setLoading(true);

        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/updatePass`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ password, token }),
            });
            const data = await res.json().catch(() => ({}));

            if (!res.ok || data.success === false) {
                setError(data.msg || data.message || "Unable to update the password.");
                return;
            }

            setInfo(data.msg || "Password updated successfully. Redirecting to login...");
            setPassword("");
            setConfirmPassword("");

            setTimeout(() => {
                navigate("/login", { replace: true });
            }, 1100);
        } catch (err) {
            setError("Unable to update the password.");
        } finally {
            setLoading(false);
        }
    };

    const fieldStyle = {
        width: "100%",
        boxSizing: "border-box",
        padding: "12px 14px",
        background: "#081018",
        border: "1px solid #1d2633",
        borderRadius: 10,
        color: "#e2e8f0",
        fontSize: 14,
        outline: "none",
    };

    const shellStyle = {
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        background: "radial-gradient(circle at top, #12213a 0%, #080b10 40%, #05070b 100%)",
        color: "#cbd5e1",
        position: "relative",
        overflow: "hidden",
    };

    const cardStyle = {
        width: "100%",
        maxWidth: 520,
        position: "relative",
        zIndex: 1,
        background: "linear-gradient(180deg, rgba(11,17,26,0.96), rgba(8,11,16,0.96))",
        border: "1px solid rgba(148,163,184,0.12)",
        borderRadius: 24,
        padding: 32,
        boxShadow: "0 32px 80px rgba(0,0,0,0.55)",
        backdropFilter: "blur(12px)",
    };

    const badgeStyle = {
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: "8px 12px",
        borderRadius: 999,
        background: "rgba(59,130,246,0.12)",
        color: "#93c5fd",
        fontSize: 12,
        fontWeight: 700,
        letterSpacing: "0.08em",
        textTransform: "uppercase",
    };

    const statusTone = status === "expired" || status === "invalid"
        ? "linear-gradient(180deg, rgba(239,68,68,0.14), rgba(239,68,68,0.06))"
        : "linear-gradient(180deg, rgba(59,130,246,0.14), rgba(59,130,246,0.06))";

    return (
        <div style={shellStyle}>
            <style>{`\n+                @keyframes riseIn {\n+                    from { opacity: 0; transform: translateY(14px); }\n+                    to { opacity: 1; transform: translateY(0); }\n+                }\n+                @keyframes drift {\n+                    0%, 100% { transform: translate3d(0, 0, 0); }\n+                    50% { transform: translate3d(16px, -18px, 0); }\n+                }\n+            `}</style>

            <div style={{
                position: "absolute",
                inset: 0,
                backgroundImage: "linear-gradient(rgba(148,163,184,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.05) 1px, transparent 1px)",
                backgroundSize: "40px 40px",
                maskImage: "linear-gradient(to bottom, rgba(0,0,0,0.9), transparent 92%)",
                pointerEvents: "none",
            }} />

            <div style={{
                position: "absolute",
                top: "12%",
                right: "18%",
                width: 180,
                height: 180,
                borderRadius: "50%",
                background: "radial-gradient(circle, rgba(59,130,246,0.18), transparent 68%)",
                animation: "drift 9s ease-in-out infinite",
                pointerEvents: "none",
            }} />

            <div style={{ ...cardStyle, animation: "riseIn 360ms ease-out both" }}>
                <div style={badgeStyle}>Password reset</div>

                <h1 style={{ margin: "16px 0 8px", fontSize: 30, lineHeight: 1.05, color: "#f8fafc" }}>
                    {status === "loading"
                        ? "Verifying your link"
                        : status === "expired"
                            ? "Reset link expired"
                            : status === "invalid"
                                ? "Reset link unavailable"
                                : "Set a new password"}
                </h1>

                <p style={{ margin: 0, color: "#94a3b8", lineHeight: 1.6 }}>
                    {status === "loading"
                        ? "We are checking whether this password reset link is still valid."
                        : status === "expired"
                            ? "Request a fresh reset email and try again."
                            : status === "invalid"
                                ? "The link is not usable anymore or the token cannot be verified."
                                : "Choose a secure password to complete the recovery process."}
                </p>

                <div style={{
                    marginTop: 22,
                    borderRadius: 18,
                    border: "1px solid rgba(148,163,184,0.12)",
                    background: statusTone,
                    padding: 18,
                    minHeight: 160,
                }}>
                    {status === "loading" && (
                        <div style={{ display: "grid", gap: 12 }}>
                            <div style={{ width: "44%", height: 14, borderRadius: 999, background: "rgba(148,163,184,0.12)" }} />
                            <div style={{ width: "72%", height: 14, borderRadius: 999, background: "rgba(148,163,184,0.08)" }} />
                            <div style={{ width: "56%", height: 14, borderRadius: 999, background: "rgba(148,163,184,0.06)" }} />
                            <div style={{ marginTop: 8, color: "#93c5fd", fontSize: 13 }}>Checking token authenticity...</div>
                        </div>
                    )}

                    {status === "expired" && (
                        <div style={{ display: "grid", gap: 12 }}>
                            <div style={{ color: "#fda4af", fontWeight: 800, fontSize: 18 }}>This reset link has expired.</div>
                            <div style={{ color: "#cbd5e1", lineHeight: 1.6 }}>{info || "Please request a new password reset email from the login page."}</div>
                            <button
                                type="button"
                                onClick={() => navigate("/login", { replace: true })}
                                style={{
                                    marginTop: 6,
                                    justifySelf: "start",
                                    padding: "10px 14px",
                                    borderRadius: 10,
                                    border: "none",
                                    background: "#3b82f6",
                                    color: "#fff",
                                    fontWeight: 800,
                                    cursor: "pointer",
                                }}
                            >
                                Go to login
                            </button>
                        </div>
                    )}

                    {status === "invalid" && (
                        <div style={{ display: "grid", gap: 12 }}>
                            <div style={{ color: "#fda4af", fontWeight: 800, fontSize: 18 }}>This reset link cannot be used.</div>
                            <div style={{ color: "#cbd5e1", lineHeight: 1.6 }}>{info || "The token is invalid, corrupted, or no longer recognized."}</div>
                            <button
                                type="button"
                                onClick={() => navigate("/login", { replace: true })}
                                style={{
                                    marginTop: 6,
                                    justifySelf: "start",
                                    padding: "10px 14px",
                                    borderRadius: 10,
                                    border: "none",
                                    background: "#3b82f6",
                                    color: "#fff",
                                    fontWeight: 800,
                                    cursor: "pointer",
                                }}
                            >
                                Return to login
                            </button>
                        </div>
                    )}

                    {status === "ready" && (
                        <form onSubmit={handleSubmit} style={{ display: "grid", gap: 14 }}>
                            <div style={{ display: "grid", gap: 8 }}>
                                <label style={{ fontSize: 12, color: "#94a3b8", fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase" }}>
                                    New password
                                </label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(event) => setPassword(event.target.value)}
                                    placeholder="Enter a new password"
                                    style={fieldStyle}
                                />
                            </div>

                            <div style={{ display: "grid", gap: 8 }}>
                                <label style={{ fontSize: 12, color: "#94a3b8", fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase" }}>
                                    Confirm password
                                </label>
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(event) => setConfirmPassword(event.target.value)}
                                    placeholder="Repeat the password"
                                    style={fieldStyle}
                                />
                            </div>

                            <div style={{ display: "grid", gap: 6, padding: "4px 2px 0", color: "#94a3b8", fontSize: 13 }}>
                                <div style={{ color: passwordChecks.lengthOk ? "#86efac" : "#94a3b8" }}>At least 8 characters</div>
                                <div style={{ color: passwordChecks.hasUppercase ? "#86efac" : "#94a3b8" }}>At least one uppercase letter</div>
                                <div style={{ color: passwordChecks.hasLowercase ? "#86efac" : "#94a3b8" }}>At least one lowercase letter</div>
                                <div style={{ color: passwordChecks.hasNumber ? "#86efac" : "#94a3b8" }}>At least one number</div>
                            </div>

                            {error && (
                                <div style={{
                                    padding: "11px 12px",
                                    borderRadius: 10,
                                    border: "1px solid rgba(239,68,68,0.28)",
                                    background: "rgba(239,68,68,0.08)",
                                    color: "#fca5a5",
                                    fontSize: 13,
                                }}>
                                    {error}
                                </div>
                            )}

                            {info && !error && (
                                <div style={{
                                    padding: "11px 12px",
                                    borderRadius: 10,
                                    border: "1px solid rgba(59,130,246,0.28)",
                                    background: "rgba(59,130,246,0.08)",
                                    color: "#bfdbfe",
                                    fontSize: 13,
                                }}>
                                    {info}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                style={{
                                    marginTop: 4,
                                    width: "100%",
                                    padding: "12px 14px",
                                    borderRadius: 10,
                                    border: "none",
                                    background: loading ? "#2563ebaa" : "linear-gradient(135deg, #2563eb, #3b82f6)",
                                    color: "#fff",
                                    fontWeight: 800,
                                    fontSize: 14,
                                    cursor: loading ? "not-allowed" : "pointer",
                                }}
                            >
                                {loading ? "Updating password..." : "Update password"}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}