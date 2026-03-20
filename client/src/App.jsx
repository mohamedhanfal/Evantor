import { useState, useEffect, useCallback } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ToastProvider, useToast } from './contexts/ToastContext';
import Navbar from './components/Navbar';
import AuthPage from './components/auth/AuthPage';
import Hero from './components/Hero';
import EventCard from './components/EventCard';
import EventModal from './components/EventModal';
import TicketCard from './components/TicketCard';
import Footer from './components/Footer';
import api from './utils/api';
import { tickets as ticketsData } from './data/tickets';

function AppContent() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [search, setSearch] = useState({
    location: '',
    date: '',
    category: '',
  });
  const [modalEvent, setModalEvent] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [authPageOpen, setAuthPageOpen] = useState(false);
  const [events, setEvents] = useState([]);
  const [eventsLoading, setEventsLoading] = useState(true);

  const fetchEvents = useCallback(async () => {
    try {
      setEventsLoading(true);
      const params = {};
      if (search.location) params.location = search.location;
      if (search.date) params.date = search.date;
      if (search.category) params.category = search.category;
      const { data } = await api.get('/events', { params });
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
    document.getElementById('featured-events')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleCreateEventClick = () => {
    document.getElementById('organizer')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleCreateEventRequiresLogin = () => {
    showToast('Please log in to create events.', 'warning');
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
            <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
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
                <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                  No events match your search. Try different filters.
                </p>
              )}
            </>
          )}
        </section>

        <section id="my-tickets" className="section" aria-labelledby="tickets-title">
          <h2 id="tickets-title" className="section__title">
            My Tickets
          </h2>
          {user ? (
            <div className="tickets-grid" role="list">
              {ticketsData.map((ticket) => (
                <div key={ticket.id} role="listitem">
                  <TicketCard ticket={ticket} />
                </div>
              ))}
            </div>
          ) : (
            <div className="tickets-login-cta">
              <p className="tickets-login-cta__text">Log in to view your tickets.</p>
              <div className="tickets-login-cta__buttons">
                <button type="button" className="btn btn-primary" onClick={() => setAuthPageOpen(true)}>
                  Login
                </button>
              </div>
            </div>
          )}
        </section>

        <section id="organizer" className="section" aria-labelledby="organizer-title">
          <h2 id="organizer-title" className="section__title">
            Organizer
          </h2>
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', maxWidth: 480, margin: '0 auto' }}>
            Create and manage your events from one place. Use the &quot;Create Event&quot; button above to get started.
          </p>
        </section>
      </main>

      <Footer />

      {modalOpen && modalEvent && (
        <EventModal
          event={modalEvent}
          onClose={handleCloseModal}
          isOpen={modalOpen}
        />
      )}

      <AuthPage isOpen={authPageOpen} onClose={() => setAuthPageOpen(false)} />
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
