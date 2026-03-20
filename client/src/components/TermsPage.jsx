export default function TermsPage() {
  return (
    <main id="main" className="legal-page">
      <section className="legal-page__hero" aria-labelledby="terms-title">
        <p className="legal-page__eyebrow">Terms of Service</p>
        <h1 id="terms-title" className="legal-page__title">
          Rules for using Evantor.
        </h1>
        <p className="legal-page__lead">Last updated: March 20, 2026</p>
      </section>

      <section
        className="legal-page__section"
        aria-labelledby="terms-use-title"
      >
        <h2 id="terms-use-title">Use of the platform</h2>
        <p>
          By using Evantor, you agree to use the service legally and
          responsibly. You must provide accurate information when creating an
          account or purchasing tickets.
        </p>
      </section>

      <section
        className="legal-page__section"
        aria-labelledby="terms-ticket-title"
      >
        <h2 id="terms-ticket-title">Ticket purchases</h2>
        <ul>
          <li>All purchases are subject to event availability.</li>
          <li>
            Refund and cancellation eligibility depends on organizer policy.
          </li>
          <li>
            You are responsible for reviewing event details before checkout.
          </li>
        </ul>
      </section>

      <section
        className="legal-page__section"
        aria-labelledby="terms-account-title"
      >
        <h2 id="terms-account-title">Account responsibilities</h2>
        <p>
          Keep your credentials secure and notify us if you suspect unauthorized
          access. Activity under your account may be treated as your
          responsibility.
        </p>
      </section>

      <section
        className="legal-page__section"
        aria-labelledby="terms-liability-title"
      >
        <h2 id="terms-liability-title">Liability</h2>
        <p>
          Evantor provides the platform as is. To the fullest extent permitted
          by law, Evantor is not liable for indirect or consequential damages
          resulting from event cancellations, organizer actions, or service
          interruptions.
        </p>
      </section>

      <section
        className="legal-page__section"
        aria-labelledby="terms-updates-title"
      >
        <h2 id="terms-updates-title">Policy updates</h2>
        <p>
          We may update these terms from time to time. Continued use of the
          platform after updates means you accept the revised terms.
        </p>
      </section>
    </main>
  );
}
