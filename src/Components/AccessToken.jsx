import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

function OAuthSuccess() {
  const navigate = useNavigate();

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch(`${window.__ENV__.VITE_API_URL}/auth/me`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        });
        const data = await res.json();
        if (data.success) {
          navigate("/events");
        } else {
          navigate("/login");
        }
      } catch {
        navigate("/login");
      }
    }
    checkAuth();
  }, [navigate]);

  return <div style={{ padding: 24, color: "var(--text-secondary)" }}>Authenticating...</div>;
}

export default OAuthSuccess;