import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";
import TicketCard from "./TicketCard";
import api from "../utils/api";

const buildQrValue = (order, tier, index) => {
  return [
    "EVANTOR",
    order.orderId,
    order._id,
    tier.name,
    index + 1,
    order.eventTitle,
    order.eventDate,
    order.eventTime,
  ].join("|");
};

export default function MyTicketsPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchTickets = async () => {
      try {
        const { data } = await api.get("/tickets/my-tickets");
        if (data.success) {
          setTickets(data.tickets);
        }
      } catch (err) {
        showToast("Failed to load tickets.", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, [user, showToast]);

  if (!user) {
    return (
      <main
        id="main"
        className="section"
        style={{ minHeight: "60vh", textAlign: "center" }}
      >
        <h2>Please log in to view your tickets.</h2>
      </main>
    );
  }

  return (
    <main id="main" className="section" style={{ minHeight: "60vh" }}>
      <h2 className="section__title">My Tickets</h2>

      {loading ? (
        <p style={{ textAlign: "center", color: "var(--text-muted)" }}>
          Loading tickets...
        </p>
      ) : tickets.length > 0 ? (
        <div className="tickets-grid" role="list">
          {tickets.map((order) =>
            order.tiers.map((tier, index) => (
              <div key={`${order._id}-${index}`} role="listitem">
                <TicketCard
                  ticket={{
                    id: `${order._id}-${index}`,
                    eventTitle: order.eventTitle,
                    eventDate: order.eventDate,
                    eventTime: order.eventTime,
                    eventLocation: order.eventLocation,
                    orderId: order.orderId,
                    tier: tier.name,
                    quantity: tier.quantity,
                    scanStatus: order.status,
                    qrCode: buildQrValue(order, tier, index),
                  }}
                />
              </div>
            )),
          )}
        </div>
      ) : (
        <p style={{ textAlign: "center", color: "var(--text-muted)" }}>
          You haven't purchased any tickets yet.
        </p>
      )}
    </main>
  );
}
