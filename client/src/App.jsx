import { useState, useEffect, useCallback } from "react";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { ToastProvider, useToast } from "./contexts/ToastContext";
import Navbar from "./components/Navbar";
import AuthPage from "./components/auth/AuthPage";
import Hero from "./components/Hero";
import EventCard from "./components/EventCard";
import EventModal from "./components/EventModal";
import Footer from "./components/Footer";
import CheckoutPage from "./components/CheckoutPage";
import ProfilePage from "./components/ProfilePage";
import MyTicketsPage from "./components/MyTicketsPage";
import api from "./utils/api";

function Home({ authPageOpen, setAuthPageOpen }) {
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [search, setSearch] = useState({
    location: "",
    date: "",
    category: "",
  });
  const [modalEvent, setModalEvent] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [events, setEvents] = useState([]);
  const [eventsLoading, setEventsLoading] = useState(true);

  const fetchEvents = useCallback(async () => {
    try {
      setEventsLoading(true);
      const params = {};
      if (search.location) params.location = search.location;
      if (search.date) params.date = search.date;
      if (search.category) params.category = search.category;
      const { data } = await api.get("/events", { params });
      if (data.success) {
        setEvents(data.events);
      }
    } catch {
      setEvents([]);
    } finally {
      setEventsLoading(false);
    }
  }, [search]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleGetTickets = (event) => {
    setModalEvent(event);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setModalEvent(null);
  };

  const handleFindEvents = () => {
    document
      .getElementById("featured-events")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <main id="main">
      <Hero
        search={search}
        onSearchChange={setSearch}
        onFindEvents={handleFindEvents}
      />

      <section
        id="featured-events"
        className="section"
        aria-labelledby="featured-title"
      >
        <h2 id="featured-title" className="section__title">
          Featured Events
        </h2>
        {eventsLoading ? (
          <p style={{ textAlign: "center", color: "var(--text-muted)" }}>
            Loading events…
          </p>
        ) : (
          <>
            <div className="events-grid" role="list">
              {events.map((event) => (
                <div key={event._id} role="listitem">
                  <EventCard event={event} onGetTickets={handleGetTickets} />
                </div>
              ))}
            </div>
            {events.length === 0 && (
              <p style={{ textAlign: "center", color: "var(--text-muted)" }}>
                No events match your search. Try different filters.
              </p>
            )}
          </>
        )}
      </section>

      {modalOpen && modalEvent && (
        <EventModal
          event={modalEvent}
          onClose={handleCloseModal}
          isOpen={modalOpen}
          onAuthRequest={() => setAuthPageOpen(true)}
        />
      )}
    </main>
  );
}

function AppContent() {
  const { showToast } = useToast();
  const [authPageOpen, setAuthPageOpen] = useState(false);

  const handleCreateEventClick = () => {
    const el = document.getElementById("organizer");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  const handleCreateEventRequiresLogin = () => {
    showToast("Please log in to create events.", "warning");
  };

  return (
    <>
      <a href="#main" className="skip-link">
        Skip to main content
      </a>
      <Navbar
        authPageOpen={authPageOpen}
        onOpenAuthPage={() => setAuthPageOpen(true)}
        onCloseAuthPage={() => setAuthPageOpen(false)}
        onCreateEventClick={handleCreateEventClick}
        onCreateEventRequiresLogin={handleCreateEventRequiresLogin}
      />

      <Routes>
        <Route
          path="/"
          element={
            <Home
              authPageOpen={authPageOpen}
              setAuthPageOpen={setAuthPageOpen}
            />
          }
        />
        <Route
          path="/events"
          element={
            <Home
              authPageOpen={authPageOpen}
              setAuthPageOpen={setAuthPageOpen}
            />
          }
        />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/my-tickets" element={<MyTicketsPage />} />
      </Routes>

      <Footer />

      <AuthPage isOpen={authPageOpen} onClose={() => setAuthPageOpen(false)} />
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <AppContent />
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
