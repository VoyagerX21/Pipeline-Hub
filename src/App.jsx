import { useContext, useEffect, useState, useRef, useCallback } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Sidebar from "./Components/Sidebar";
import Header from "./Components/Header";
import ProfilePanel from "./Components/ProfilePanel";
import EventsPanel from "./Components/EventsPanel";
import EventDetail from "./Components/EventDetail";
import AnalyticsPanel from "./Components/AnalyticsPanel";
import ReposPanel from "./Components/ReposPanel";
import WebhooksPanel from "./Components/WebhooksPanel";
import Login from "./Components/Login";
import { UserContext } from "./context/UserContext";

/* ─── Constants ──────────────────────────────────────────────── */
const MIN_PX      = 220;   // minimum width for either pane
const MAX_PCT     = 0.78;  // left pane can't exceed 78%
const DEFAULT_PCT = 0.55;  // initial split (55% events list, 45% detail)
const STORAGE_KEY = "events-split-pct";

/* ─── ResizableSplitPane (inline, no extra file needed) ─────── */
function ResizableSplitPane({ left, right }) {
  const containerRef = useRef(null);
  const dragging     = useRef(false);
  const startX       = useRef(0);
  const startPct     = useRef(0);
  const [isDragging, setIsDragging] = useState(false);

  const [pct, setPct] = useState(() => {
    const saved = parseFloat(localStorage.getItem(STORAGE_KEY));
    return !isNaN(saved) && saved > 0.1 && saved < 0.9 ? saved : DEFAULT_PCT;
  });

  const clamp = useCallback((raw) => {
    if (!containerRef.current) return raw;
    const w = containerRef.current.offsetWidth;
    const minPct = MIN_PX / w;
    return Math.min(Math.max(raw, minPct), MAX_PCT);
  }, []);

  const onPointerDown = useCallback((e) => {
    e.preventDefault();
    dragging.current  = true;
    startX.current    = e.clientX;
    startPct.current  = pct;
    setIsDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
  }, [pct]);

  const onPointerMove = useCallback((e) => {
    if (!dragging.current || !containerRef.current) return;
    const w   = containerRef.current.offsetWidth;
    const dx  = e.clientX - startX.current;
    setPct(clamp(startPct.current + dx / w));
  }, [clamp]);

  const onPointerUp = useCallback((e) => {
    if (!dragging.current) return;
    dragging.current = false;
    setIsDragging(false);
    localStorage.setItem(STORAGE_KEY, pct);
  }, [pct]);

  const onDoubleClick = useCallback(() => {
    setPct(DEFAULT_PCT);
    localStorage.setItem(STORAGE_KEY, DEFAULT_PCT);
  }, []);

  /* prevent text selection / cursor flicker during drag */
  useEffect(() => {
    document.body.style.userSelect = isDragging ? "none" : "";
    document.body.style.cursor     = isDragging ? "col-resize" : "";
    return () => {
      document.body.style.userSelect = "";
      document.body.style.cursor     = "";
    };
  }, [isDragging]);

  return (
    <div ref={containerRef} style={{ flex: 1, display: "flex", minHeight: 0, overflow: "hidden" }}>

      {/* Left pane */}
      <div style={{ width: `${pct * 100}%`, display: "flex", flexDirection: "column", overflow: "hidden", flexShrink: 0 }}>
        {left}
      </div>

      {/* Drag handle */}
      <div
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onDoubleClick={onDoubleClick}
        title="Drag to resize · Double-click to reset"
        style={{
          width: 5,
          flexShrink: 0,
          position: "relative",
          cursor: "col-resize",
          background: isDragging ? "#3b82f6" : "transparent",
          borderLeft: "1px solid #1e2330",
          transition: "background 0.15s",
          zIndex: 10,
        }}
      >
        {/* Wider invisible hit zone + grip dots */}
        <div style={{
          position: "absolute",
          inset: "0 -5px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 4,
        }}>
          {[0, 1, 2, 3, 4].map(i => (
            <div key={i} style={{
              width: 3, height: 3, borderRadius: "50%",
              background: isDragging ? "#3b82f6" : "#2d3a4a",
              transition: "background 0.15s",
            }} />
          ))}
        </div>
      </div>

      {/* Right pane */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: MIN_PX, background: "#0a0d12" }}>
        {right}
      </div>
    </div>
  );
}

/* ─── Dashboard Layout ───────────────────────────────────────── */
function DashboardLayout() {
  const [sidePanel, setSidePanel]       = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [events, setEvents]             = useState([]);

  const { user } = useContext(UserContext);

  const fetchEvents = async () => {
    try {
      const res  = await fetch(`${import.meta.env.VITE_API_URL}/events/list/${user._id}`, { credentials: "include" });
      const data = await res.json();
      if (data.success) setEvents(data.events);
      else console.error("Failed to fetch events");
    } catch (err) {
      console.error("Fetch error:", err);
    }
  };

  useEffect(() => {
    if (user) fetchEvents();
  }, [user]);

  return (
    <div style={{ display: "flex", height: "100%", background: "#080b10", color: "#94a3b8" }}>
      <Sidebar sidePanel={sidePanel} setSidePanel={setSidePanel} />

      {sidePanel === "profile" && (
        <ProfilePanel onClose={() => setSidePanel(null)} />
      )}

      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <Header filteredCount={events.length} />

        <Routes>
          <Route path="/" element={<Navigate to="/events" />} />

          <Route
            path="/events"
            element={
              <ResizableSplitPane
                left={
                  <EventsPanel
                    events={events}
                    selectedEvent={selectedEvent}
                    setSelectedEvent={setSelectedEvent}
                  />
                }
                right={
                  <EventDetail
                    event={selectedEvent}
                    onClose={() => setSelectedEvent(null)}
                  />
                }
              />
            }
          />

          <Route path="/analytics" element={<AnalyticsPanel />} />
          <Route path="/repos"     element={<ReposPanel />} />
          <Route path="/webhooks"  element={<WebhooksPanel />} />
        </Routes>
      </div>
    </div>
  );
}

/* ─── App Root ───────────────────────────────────────────────── */
export default function App() {
  const [user, setUser]     = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res  = await fetch(`${import.meta.env.VITE_API_URL}/auth/me`, { credentials: "include" });
        const data = await res.json();
        if (data.success) setUser(data.user);
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    })();
  }, []);

  if (loading) return null;

  return (
    <UserContext.Provider value={{ user, setUser }}>
      <BrowserRouter>
        <Routes>
          <Route
            path="/login"
            element={user ? <Navigate to="/events" /> : <Login onLogin={setUser} />}
          />
          <Route
            path="/*"
            element={user ? <DashboardLayout /> : <Navigate to="/login" />}
          />
        </Routes>
      </BrowserRouter>
    </UserContext.Provider>
  );
}