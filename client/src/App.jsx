import { useState, useMemo } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ToastProvider, useToast } from './contexts/ToastContext';
import Navbar from './components/Navbar';
import AuthPage from './components/auth/AuthPage';
import Hero from './components/Hero';
import EventCard from './components/EventCard';
import EventModal from './components/EventModal';
import TicketCard from './components/TicketCard';
import Footer from './components/Footer';
import { events as eventsData } from './data/events';
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

  const filteredEvents = useMemo(() => {
    return eventsData.filter((event) => {
      const matchLocation =
        !search.location ||
        event.location.toLowerCase().includes(search.location.toLowerCase());
      const matchDate = !search.date || event.date === search.date;
      const matchCategory =
        !search.category || event.category === search.category;
      return matchLocation && matchDate && matchCategory;
    });
  }, [search]);

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
          <div className="events-grid" role="list">
            {filteredEvents.map((event) => (
              <div key={event.id} role="listitem">
                <EventCard event={event} onGetTickets={handleGetTickets} />
              </div>
            ))}
          </div>
          {filteredEvents.length === 0 && (
            <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
              No events match your search. Try different filters.
            </p>
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
