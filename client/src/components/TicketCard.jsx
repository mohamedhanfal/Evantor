import { QRCodeSVG } from "qrcode.react";

export default function TicketCard({ ticket }) {
  const formattedDate = new Date(ticket.eventDate).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  const isScanned = ticket.scanStatus === "scanned";
  const qrValue = ticket.qrCode || `EVANTOR|${ticket.orderId}|${ticket.id}`;

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
        <div
          className="ticket-card__qr"
          role="img"
          aria-label={`QR code for order ${ticket.orderId}`}
        >
          <QRCodeSVG
            value={qrValue}
            size={112}
            includeMargin
            level="M"
            title={`Order ${ticket.orderId}`}
          />
        </div>
        <div
          className={`ticket-card__status ${isScanned ? "ticket-card__status--scanned" : "ticket-card__status--valid"}`}
          role="status"
        >
          {isScanned ? "✓ Scanned" : "Valid — Not scanned"}
        </div>
      </div>
    </article>
  );
}
