import { useContext, useEffect, useState } from "react";
import { PLATFORM_COLORS, timeAgo } from "../constants.jsx";
import { UserContext } from "../context/UserContext.jsx";
import { FolderGit2, GitBranch, Lock, Globe, Search, Loader2, Calendar } from "lucide-react";

export default function ReposPanel() {
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const { user } = useContext(UserContext);

  useEffect(() => {
    const fetchRepos = async () => {
      try {
        const res = await fetch(`${window.__ENV__.VITE_API_URL}/repo/list/${user._id}`, {
          credentials: "include",
        });
        const data = await res.json();
        if (data.success) {
          setRepos(data.repos || []);
        }
      } catch (err) {
        console.error("Failed to fetch repos", err);
      } finally {
        setLoading(false);
      }
    };
    if (user?._id) fetchRepos();
  }, [user]);

  const filtered = repos.filter((r) =>
    r.fullName?.toLowerCase().includes(search.toLowerCase()) ||
    r.provider?.toLowerCase().includes(search.toLowerCase()) ||
    r.defaultBranch?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div
      style={{
        flex: 1,
        overflowY: "auto",
        padding: "24px 28px",
        background: "var(--bg-app)",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        gap: 20,
      }}
    >
      {/* Header & Filter */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.4px", margin: 0 }}>
            Connected Repositories
          </h2>
          <p style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 4, fontFamily: "'JetBrains Mono', monospace" }}>
            {repos.length} total repositories connected & monitored
          </p>
        </div>

        <div style={{ position: "relative", width: 240 }}>
          <Search size={14} color="var(--text-muted)" style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)" }} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search repositories..."
            style={{
              width: "100%",
              padding: "7px 12px 7px 32px",
              borderRadius: 8,
              border: "1px solid var(--border-base)",
              background: "var(--bg-input)",
              color: "var(--text-primary)",
              fontSize: 12,
              fontFamily: "'JetBrains Mono', monospace",
              outline: "none",
            }}
          />
        </div>
      </div>

      {loading ? (
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 10, color: "var(--text-muted)" }}>
          <Loader2 size={24} color="var(--primary)" style={{ animation: "spin 0.8s linear infinite" }} />
          <span style={{ fontSize: 13, fontFamily: "'JetBrains Mono', monospace" }}>Loading repositories…</span>
        </div>
      ) : filtered.length === 0 ? (
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: 40,
            color: "var(--text-muted)",
            fontSize: 13,
            gap: 12,
          }}
        >
          <FolderGit2 size={36} color="var(--text-muted)" />
          <div>No repositories match your query.</div>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 14 }}>
          {filtered.map((repo) => {
            const providerColor = PLATFORM_COLORS[repo.provider] || "var(--text-secondary)";
            return (
              <div
                key={repo._id}
                style={{
                  background: "var(--bg-card)",
                  border: "1px solid var(--border-base)",
                  borderRadius: 12,
                  padding: "18px 20px",
                  boxShadow: "var(--shadow-sm)",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  gap: 14,
                  transition: "border-color 0.15s, box-shadow 0.15s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "var(--border-strong)";
                  e.currentTarget.style.boxShadow = "var(--shadow-md)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "var(--border-base)";
                  e.currentTarget.style.boxShadow = "var(--shadow-sm)";
                }}
              >
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8, marginBottom: 8 }}>
                    <h3
                      style={{
                        fontSize: 14,
                        fontWeight: 700,
                        color: "var(--text-primary)",
                        fontFamily: "'JetBrains Mono', monospace",
                        margin: 0,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {repo.fullName}
                    </h3>

                    {repo.isPrivate ? (
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 4,
                          fontSize: 10,
                          fontWeight: 600,
                          color: "var(--warning)",
                          background: "var(--warning-light)",
                          border: "1px solid var(--warning-border)",
                          borderRadius: 4,
                          padding: "1px 6px",
                          textTransform: "uppercase",
                        }}
                      >
                        <Lock size={10} />
                        Private
                      </span>
                    ) : (
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 4,
                          fontSize: 10,
                          fontWeight: 600,
                          color: "var(--success)",
                          background: "var(--success-light)",
                          border: "1px solid var(--success-border)",
                          borderRadius: 4,
                          padding: "1px 6px",
                          textTransform: "uppercase",
                        }}
                      >
                        <Globe size={10} />
                        Public
                      </span>
                    )}
                  </div>

                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
                    <span
                      style={{
                        fontSize: 10,
                        color: providerColor,
                        background: "var(--bg-card-subtle)",
                        border: "1px solid var(--border-base)",
                        borderRadius: 4,
                        padding: "2px 7px",
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                      }}
                    >
                      {repo.provider}
                    </span>

                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 3,
                        fontSize: 10,
                        color: "var(--text-secondary)",
                        background: "var(--bg-card-subtle)",
                        border: "1px solid var(--border-base)",
                        borderRadius: 4,
                        padding: "2px 7px",
                        fontWeight: 600,
                        fontFamily: "'JetBrains Mono', monospace",
                      }}
                    >
                      <GitBranch size={10} />
                      {repo.defaultBranch || "main"}
                    </span>
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    paddingTop: 10,
                    borderTop: "1px solid var(--border-subtle)",
                    fontSize: 11,
                    color: "var(--text-muted)",
                    fontFamily: "'JetBrains Mono', monospace",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <Calendar size={11} />
                    <span>Updated {timeAgo(repo.updatedAt)}</span>
                  </div>
                  <div>ID: {repo.externalRepoId || "—"}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}