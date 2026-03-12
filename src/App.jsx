import { useContext, useEffect, useState } from "react";
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
import { MOCK_EVENTS } from "./constants";

function DashboardLayout() {
  const [sidePanel, setSidePanel] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [events, setEvents] = useState([]);

  const { user } = useContext(UserContext);

  const fetchEvents = async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/events/list/${user._id}`,
        { credentials: "include" }
      );

      const data = await res.json();
      // console.log(data);

      if (data.success) {
        setEvents(data.events);
      } else {
        console.error("Failed to fetch events");
      }
    } catch (err) {
      console.error("Fetch error:", err);
    }
  };

  useEffect(() => {
    if (user) fetchEvents();
  }, [user]);

  return (
    <div style={{ display: "flex", height: "100vh", background: "#080b10", color: "#94a3b8" }}>
      <Sidebar sidePanel={sidePanel} setSidePanel={setSidePanel} />

      {sidePanel === "profile" && (
        <ProfilePanel onClose={() => setSidePanel(null)} />
      )}

      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <Header filteredCount={events.length} />

        <Routes>
          <Route path="/" element={<Navigate to="/events" />} />

          <Route
            path="/events"
            element={
              <div style={{ flex: 1, minHeight: 0, display: "flex" }}>
                <EventsPanel
                  events={events}
                  selectedEvent={selectedEvent}
                  setSelectedEvent={setSelectedEvent}
                />

                <div style={{ width: "min(42vw, 460px)", borderLeft: "1px solid #1e2330", background: "#0a0d12" }}>
                  <EventDetail
                    event={selectedEvent}
                    onClose={() => setSelectedEvent(null)}
                  />
                </div>
              </div>
            }
          />

          <Route path="/analytics" element={<AnalyticsPanel />} />
          <Route path="/repos" element={<ReposPanel />} />
          <Route path="/webhooks" element={<WebhooksPanel />} />
        </Routes>
      </div>
    </div>
  );
}


// ─── App Root ─────────────────────────
export default function App() {

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/auth/me`,
          { credentials: "include" }
        );

        const data = await res.json();

        if (data.success) {
          setUser(data.user);
        }
      } catch (err) {
        console.error(err);
      }

      setLoading(false);
    };

    fetchUser();
  }, []);

  if (loading) return null;

  return (
    <UserContext.Provider value={{ user, setUser }}>
      <BrowserRouter>
        <Routes>

          <Route
            path="/login"
            element={
              user
                ? <Navigate to="/events" />
                : <Login onLogin={setUser} />
            }
          />

          <Route
            path="/*"
            element={
              user
                ? <DashboardLayout />
                : <Navigate to="/login" />
            }
          />

        </Routes>
      </BrowserRouter>
    </UserContext.Provider>
  );
}