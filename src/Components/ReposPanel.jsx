import Badge from "./Badge.jsx";
import { useContext, useEffect, useState } from "react";
import { EVENT_COLORS, PLATFORM_COLORS, timeAgo } from "../constants.jsx";
import { UserContext } from "../context/UserContext.jsx";

export default function ReposPanel() {
  const [repos, setRepos] = useState([]);
  const { user } = useContext(UserContext);

  useEffect(() => {
    const fetchRepos = async () => {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/repo/list/${user._id}`, {
        credentials: 'include'
      });
      const data = await res.json();
      if (data.success) {
        setRepos(data.repos);
      }
    };
    fetchRepos();
  }, []);

  return (
    <div style={{ flex: 1, overflowY: "auto", padding: 24, height: "100%" }}>
      <div style={{ fontSize: 16, fontWeight: 800, color: "#f1f5f9", marginBottom: 6, letterSpacing: "-0.3px" }}>
        Repositories
      </div>
      <div style={{ fontSize: 12, color: "#475569", marginBottom: 24 }}>
        {repos.length} repositories tracked
      </div>

      {repos.map((repo) => (
        <div
          key={repo._id}
          style={{
            background: "#0a0d12", border: "1px solid #1e2330",
            borderRadius: 10, padding: 18, marginBottom: 12,
            transition: "border-color 0.15s",
          }}
          onMouseEnter={e => e.currentTarget.style.borderColor = "#334155"}
          onMouseLeave={e => e.currentTarget.style.borderColor = "#1e2330"}
        >
          {/* Header row */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#e2e8f0", fontFamily: "monospace", marginBottom: 4 }}>
                {repo.fullName}
              </div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
                <span style={{
                  fontSize: 10, color: PLATFORM_COLORS[repo.provider],
                  background: `${PLATFORM_COLORS[repo.provider]}18`,
                  border: `1px solid ${PLATFORM_COLORS[repo.provider]}30`,
                  borderRadius: 3, padding: "1px 6px", fontWeight: 600,
                  textTransform: "uppercase", letterSpacing: "0.5px"
                }}>
                  {repo.provider}
                </span>
                <span style={{
                  fontSize: 10, color: "#64748b",
                  background: "#64748b18", border: "1px solid #64748b30",
                  borderRadius: 3, padding: "1px 6px", fontWeight: 600,
                  fontFamily: "monospace"
                }}>
                  {repo.defaultBranch}
                </span>
                {repo.isPrivate && (
                  <span style={{
                    fontSize: 10, color: "#f59e0b",
                    background: "#f59e0b18", border: "1px solid #f59e0b30",
                    borderRadius: 3, padding: "1px 6px", fontWeight: 600,
                    textTransform: "uppercase", letterSpacing: "0.5px"
                  }}>
                    Private
                  </span>
                )}
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 11, color: "#475569", fontFamily: "monospace" }}>
                ID: {repo.externalRepoId}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 10, borderTop: "1px solid #1e2330" }}>
            <div style={{ fontSize: 11, color: "#475569", fontFamily: "monospace" }}>
              Updated: <span style={{ color: "#64748b" }}>{timeAgo(repo.updatedAt)}</span>
            </div>
            <div style={{ fontSize: 11, color: "#334155", fontFamily: "monospace" }}>
              Created: {timeAgo(repo.createdAt)}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}