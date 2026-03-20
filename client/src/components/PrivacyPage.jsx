export default function PrivacyPage() {
  return (
    <main id="main" className="legal-page">
      <section className="legal-page__hero" aria-labelledby="privacy-title">
        <p className="legal-page__eyebrow">Privacy Policy</p>
        <h1 id="privacy-title" className="legal-page__title">
          Your data belongs to you.
        </h1>
        <p className="legal-page__lead">Last updated: March 20, 2026</p>
      </section>

      <section
        className="legal-page__section"
        aria-labelledby="privacy-collect-title"
      >
        <h2 id="privacy-collect-title">Information we collect</h2>
        <ul>
          <li>Account details such as name, email, and login credentials</li>
          <li>Ticket and checkout information related to event purchases</li>
          <li>Device and usage data to improve performance and reliability</li>
        </ul>
      </section>

      <section
        className="legal-page__section"
        aria-labelledby="privacy-use-title"
      >
        <h2 id="privacy-use-title">How we use your information</h2>
        <ul>
          <li>
            To provide ticketing, account access, and event discovery features
          </li>
          <li>
            To process payments and send confirmations or service messages
          </li>
          <li>
            To detect abuse, prevent fraud, and maintain platform security
          </li>
        </ul>
      </section>

      <section
        className="legal-page__section"
        aria-labelledby="privacy-share-title"
      >
        <h2 id="privacy-share-title">When we share data</h2>
        <p>
          We only share limited data with trusted providers, such as payment,
          analytics, and infrastructure services, to operate Evantor. We do not
          sell your personal information.
        </p>
      </section>

      <section
        className="legal-page__section"
        aria-labelledby="privacy-rights-title"
      >
        <h2 id="privacy-rights-title">Your choices and rights</h2>
        <p>
          You may request updates to your account information, ask us to delete
          your account, or contact us for privacy support at
          privacy@evantor.com.
        </p>
      </section>
    </main>
  );
}
