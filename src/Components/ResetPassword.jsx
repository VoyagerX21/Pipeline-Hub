import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Lock, CheckCircle2, AlertCircle, Loader2, KeyRound } from "lucide-react";

function normalizeMessage(value) {
  return String(value || "").toLowerCase();
}

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [status, setStatus] = useState("loading");
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
        const res = await fetch(`${window.__ENV__.VITE_API_URL}/auth/verify/forgot/${token}`, {
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
      const res = await fetch(`${window.__ENV__.VITE_API_URL}/auth/updatePass`, {
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
      }, 1200);
    } catch {
      setError("Unable to update the password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--bg-app)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 460,
          background: "var(--bg-card)",
          border: "1px solid var(--border-subtle)",
          borderRadius: 12,
          padding: 32,
          boxShadow: "var(--shadow-lg)",
          animation: "fadeIn 0.3s ease-out forwards",
        }}
      >
        <div style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "var(--primary)", background: "var(--primary-light)", border: "1px solid var(--primary-border)", padding: "4px 10px", borderRadius: 999, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 16 }}>
          <KeyRound size={13} />
          Password Reset
        </div>

        <h1 style={{ fontSize: 22, fontWeight: 800, color: "var(--text-primary)", marginBottom: 8 }}>
          {status === "loading"
            ? "Verifying reset token…"
            : status === "expired"
            ? "Link expired"
            : status === "invalid"
            ? "Link unavailable"
            : "Choose new password"}
        </h1>

        <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.5, marginBottom: 20 }}>
          {status === "loading"
            ? "Checking authenticity of your secure link."
            : status === "expired"
            ? "This recovery link has expired. Please request a fresh reset link."
            : status === "invalid"
            ? "This recovery link is invalid or has already been used."
            : "Enter a strong password to secure your PipelineHub account."}
        </p>

        {status === "loading" && (
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "20px 0", color: "var(--text-muted)", fontSize: 13 }}>
            <Loader2 size={18} style={{ animation: "spin 0.8s linear infinite" }} />
            <span>Validating token credentials…</span>
          </div>
        )}

        {(status === "expired" || status === "invalid") && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ padding: "12px 14px", borderRadius: 10, background: "var(--danger-light)", border: "1px solid var(--danger-border)", color: "var(--danger)", fontSize: 13 }}>
              {info}
            </div>
            <button
              type="button"
              onClick={() => navigate("/login", { replace: true })}
              style={{
                padding: "11px 16px",
                borderRadius: 10,
                border: "none",
                background: "var(--primary)",
                color: "#ffffff",
                fontWeight: 700,
                fontSize: 13,
                cursor: "pointer",
              }}
            >
              Return to Sign In
            </button>
          </div>
        )}

        {status === "ready" && (
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6 }}>
                New Password
              </label>
              <div style={{ position: "relative" }}>
                <Lock size={16} color="var(--text-muted)" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter new password"
                  style={{
                    width: "100%",
                    padding: "11px 12px 11px 38px",
                    borderRadius: 10,
                    border: "1px solid var(--border-subtle)",
                    background: "var(--bg-input)",
                    color: "var(--text-primary)",
                    fontSize: 13,
                    fontFamily: "'JetBrains Mono', monospace",
                    outline: "none",
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6 }}>
                Confirm New Password
              </label>
              <div style={{ position: "relative" }}>
                <Lock size={16} color="var(--text-muted)" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat new password"
                  style={{
                    width: "100%",
                    padding: "11px 12px 11px 38px",
                    borderRadius: 10,
                    border: "1px solid var(--border-subtle)",
                    background: "var(--bg-input)",
                    color: "var(--text-primary)",
                    fontSize: 13,
                    fontFamily: "'JetBrains Mono', monospace",
                    outline: "none",
                  }}
                />
              </div>
            </div>

            {/* Checklist */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, fontSize: 11, fontFamily: "'JetBrains Mono', monospace" }}>
              <div style={{ color: passwordChecks.lengthOk ? "var(--success)" : "var(--text-muted)", display: "flex", alignItems: "center", gap: 4 }}>
                <CheckCircle2 size={12} /> ≥ 8 characters
              </div>
              <div style={{ color: passwordChecks.hasUppercase ? "var(--success)" : "var(--text-muted)", display: "flex", alignItems: "center", gap: 4 }}>
                <CheckCircle2 size={12} /> 1 Uppercase
              </div>
              <div style={{ color: passwordChecks.hasLowercase ? "var(--success)" : "var(--text-muted)", display: "flex", alignItems: "center", gap: 4 }}>
                <CheckCircle2 size={12} /> 1 Lowercase
              </div>
              <div style={{ color: passwordChecks.hasNumber ? "var(--success)" : "var(--text-muted)", display: "flex", alignItems: "center", gap: 4 }}>
                <CheckCircle2 size={12} /> 1 Number
              </div>
            </div>

            {error && (
              <div style={{ padding: "10px 12px", borderRadius: 8, background: "var(--danger-light)", border: "1px solid var(--danger-border)", color: "var(--danger)", fontSize: 12, display: "flex", alignItems: "center", gap: 6 }}>
                <AlertCircle size={15} />
                <span>{error}</span>
              </div>
            )}

            {info && (
              <div style={{ padding: "10px 12px", borderRadius: 8, background: "var(--success-light)", border: "1px solid var(--success-border)", color: "var(--success)", fontSize: 12, display: "flex", alignItems: "center", gap: 6 }}>
                <CheckCircle2 size={15} />
                <span>{info}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                marginTop: 6,
                width: "100%",
                padding: "12px",
                borderRadius: 10,
                border: "none",
                background: "var(--primary)",
                color: "#ffffff",
                fontWeight: 700,
                fontSize: 13,
                cursor: loading ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
              }}
            >
              {loading && <Loader2 size={15} style={{ animation: "spin 0.8s linear infinite" }} />}
              <span>{loading ? "Updating password…" : "Save New Password"}</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
}