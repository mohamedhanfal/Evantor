export default function AboutPage() {
  return (
    <main id="main" className="legal-page">
      <section className="legal-page__hero" aria-labelledby="about-title">
        <p className="legal-page__eyebrow">About Evantor</p>
        <h1 id="about-title" className="legal-page__title">
          Discover events. Book faster. Attend with confidence.
        </h1>
        <p className="legal-page__lead">
          Evantor helps people find meaningful experiences and helps organizers
          run successful events in one place.
        </p>
      </section>

      <section className="legal-page__grid" aria-label="About details">
        <article className="legal-card">
          <h2>What we do</h2>
          <p>
            We provide a platform to explore events by category, date, and
            location, then complete checkout and manage tickets online.
          </p>
        </article>

        <article className="legal-card">
          <h2>For attendees</h2>
          <p>
            Browse curated events, reserve seats, and keep your tickets
            organized in your account.
          </p>
        </article>

        <article className="legal-card">
          <h2>For organizers</h2>
          <p>
            Create event listings, monitor registrations, and connect with your
            audience through a reliable workflow.
          </p>
        </article>
      </section>

      <section
        className="legal-page__section"
        aria-labelledby="about-values-title"
      >
        <h2 id="about-values-title">Our values</h2>
        <ul>
          <li>Clear pricing and straightforward ticketing</li>
          <li>Privacy-first product decisions</li>
          <li>Accessible event discovery on mobile and desktop</li>
        </ul>
      </section>
    </main>
  );
}
