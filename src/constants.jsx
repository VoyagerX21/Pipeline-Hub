export const MOCK_EVENTS = [
  { id: 1, platform: "github", type: "push", repo: "org/backend-api", branch: "main", actor: "ali.hassan", avatar: "AH", message: "fix: resolve memory leak in worker thread", ts: new Date(Date.now() - 2 * 60000), status: "notified" },
  { id: 2, platform: "gitlab", type: "pull_request", repo: "team/frontend", branch: "feat/dashboard", actor: "sara.malik", avatar: "SM", message: "feat: add VCS dashboard UI", ts: new Date(Date.now() - 11 * 60000), status: "notified" },
  { id: 3, platform: "bitbucket", type: "merge", repo: "infra/devops-scripts", branch: "release/v2.1", actor: "john.dev", avatar: "JD", message: "chore: merge release branch into main", ts: new Date(Date.now() - 34 * 60000), status: "notified" },
  { id: 4, platform: "github", type: "pull", repo: "org/backend-api", branch: "fix/auth-bug", actor: "priya.nair", avatar: "PN", message: "pull: sync upstream changes", ts: new Date(Date.now() - 58 * 60000), status: "notified" },
  { id: 5, platform: "gitlab", type: "push", repo: "team/ml-pipeline", branch: "dev", actor: "carlos.ruiz", avatar: "CR", message: "refactor: update training loop parameters", ts: new Date(Date.now() - 2 * 3600000), status: "notified" },
  { id: 6, platform: "github", type: "merge", repo: "org/mobile-app", branch: "main", actor: "ali.hassan", avatar: "AH", message: "merge: PR #214 – dark mode implementation", ts: new Date(Date.now() - 3.5 * 3600000), status: "notified" },
  { id: 7, platform: "bitbucket", type: "pull_request", repo: "infra/k8s-configs", branch: "feat/autoscaling", actor: "nina.patel", avatar: "NP", message: "feat: add HPA config for worker pods", ts: new Date(Date.now() - 5 * 3600000), status: "notified" },
  { id: 8, platform: "github", type: "push", repo: "org/data-service", branch: "staging", actor: "john.dev", avatar: "JD", message: "ci: update pipeline to Node 20", ts: new Date(Date.now() - 7 * 3600000), status: "notified" },
  { id: 9, platform: "gitlab", type: "merge", repo: "team/frontend", branch: "main", actor: "sara.malik", avatar: "SM", message: "merge: hotfix/login-redirect into main", ts: new Date(Date.now() - 10 * 3600000), status: "notified" },
  { id: 10, platform: "bitbucket", type: "push", repo: "infra/terraform", branch: "dev", actor: "carlos.ruiz", avatar: "CR", message: "feat: add GCP storage bucket module", ts: new Date(Date.now() - 14 * 3600000), status: "notified" },
];

export const EVENT_COLORS = {
  push: "#3b82f6",
  pull_request: "#a855f7",
  pull: "#f59e0b",
  merge: "#10b981",
};

export const PLATFORM_COLORS = {
  github: "#e2e8f0",
  gitlab: "#fc6d26",
  bitbucket: "#0052cc",
};

export const PLATFORM_ICONS = {
  github: (
    <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
    </svg>
  ),
  gitlab: (
    <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
      <path d="M22.65 14.39L12 22.13 1.35 14.39a.84.84 0 0 1-.3-.94l1.22-3.78 2.44-7.51A.42.42 0 0 1 4.82 2a.43.43 0 0 1 .58 0 .42.42 0 0 1 .11.18l2.44 7.49h8.1l2.44-7.51A.42.42 0 0 1 18.6 2a.43.43 0 0 1 .58 0 .42.42 0 0 1 .11.18l2.44 7.51L23 13.45a.84.84 0 0 1-.35.94z"/>
    </svg>
  ),
  bitbucket: (
    <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
      <path d="M.778 1.213a.768.768 0 0 0-.768.892l3.263 19.81c.084.5.515.868 1.022.873H19.95a.772.772 0 0 0 .77-.646l3.27-20.03a.768.768 0 0 0-.768-.891zM14.52 15.53H9.522L8.17 8.466h7.704z"/>
    </svg>
  ),
};

export function timeAgo(date, now = Date.now()) {
  const d = new Date(date);
  const secs = Math.floor((now - d.getTime()) / 1000);

  if (secs < 60) return `${secs}s ago`;
  if (secs < 3600) return `${Math.floor(secs / 60)}m ago`;
  if (secs < 86400) return `${Math.floor(secs / 3600)}h ago`;
  return `${Math.floor(secs / 86400)}d ago`;
}