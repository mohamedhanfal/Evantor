export default function TicketCard({ ticket }) {
  const formattedDate = new Date(ticket.eventDate).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
  const isScanned = ticket.scanStatus === 'scanned';

  return (
    <article className="ticket-card">
      <div className="ticket-card__body">
        <h3 className="ticket-card__title">{ticket.eventTitle}</h3>
        <p className="ticket-card__meta">
          {formattedDate} · {ticket.eventTime}
          <br />
          {ticket.eventLocation}
        </p>
        <p className="ticket-card__meta">
          {ticket.tier} × {ticket.quantity} · Order {ticket.orderId}
        </p>
        <div className="ticket-card__qr" aria-hidden>
          {ticket.qrCode}
        </div>
        <div
          className={`ticket-card__status ${isScanned ? 'ticket-card__status--scanned' : 'ticket-card__status--valid'}`}
          role="status"
        >
          {isScanned ? '✓ Scanned' : 'Valid — Not scanned'}
        </div>
      </div>
    </article>
  );
}
