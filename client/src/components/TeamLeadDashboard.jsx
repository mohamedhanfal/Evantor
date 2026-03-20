import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";
import api from "../utils/api";

export default function TeamLeadDashboard() {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState([]);
  const [invoices, setInvoices] = useState([]);

  // States for Modals/Forms
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);
  const [activeRequest, setActiveRequest] = useState(null);

  const [meetingDate, setMeetingDate] = useState("");
  const [invoiceData, setInvoiceData] = useState({
    amount: "",
    description: "",
  });

  const fetchTeamLeadData = async () => {
    try {
      const { data } = await api.get("/team-lead/requests");
      if (data.success) {
        setRequests(data.requests);
        setInvoices(data.invoices);
      }
    } catch (err) {
      showToast("Failed to load team lead data.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && (user.role === "team_lead" || user.role === "admin")) {
      fetchTeamLeadData();
    } else {
      setLoading(false);
    }
  }, [user, showToast]);

  const handleScheduleMeeting = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.put(
        `/team-lead/requests/${activeRequest._id}/schedule`,
        { meetingDate },
      );
      if (data.success) {
        showToast("Meeting scheduled successfully!", "success");
        setScheduleModalOpen(false);
        setActiveRequest(null);
        setMeetingDate("");
        fetchTeamLeadData();
      }
    } catch (err) {
      showToast(
        err.response?.data?.error || "Failed to schedule meeting.",
        "error",
      );
    }
  };

  const handleIssueInvoice = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        serviceRequestId: activeRequest._id,
        amount: Number(invoiceData.amount),
        description: invoiceData.description,
      };
      const { data } = await api.post("/team-lead/invoices", payload);
      if (data.success) {
        showToast("Invoice issued successfully!", "success");
        setInvoiceModalOpen(false);
        setActiveRequest(null);
        setInvoiceData({ amount: "", description: "" });
        fetchTeamLeadData();
      }
    } catch (err) {
      showToast(
        err.response?.data?.error || "Failed to issue invoice.",
        "error",
      );
    }
  };

  if (!user || user.role !== "team_lead") {
    return (
      <main
        id="main"
        className="section"
        style={{ minHeight: "60vh", textAlign: "center" }}
      >
        <h2>Access Denied</h2>
        <p>Only Team Leads can access this dashboard.</p>
      </main>
    );
  }

  return (
    <main id="main" className="dashboard-container teamlead-dashboard">
      <div className="dashboard-header">
        <div>
          <h2 className="dashboard-title">Team Lead Dashboard</h2>
          <p className="teamlead-dashboard__subtitle">
            Managing {user.serviceSector} sector
          </p>
        </div>
      </div>

      {loading ? (
        <p style={{ textAlign: "center" }}>Loading dashboard...</p>
      ) : (
        <div className="teamlead-dashboard__layout">
          {/* Active Requests */}
          <section className="glass-panel teamlead-dashboard__panel">
            <h3>Pending Requests</h3>
            {requests.length === 0 ? (
              <p className="teamlead-dashboard__empty">
                No active service requests in your sector.
              </p>
            ) : (
              <div className="teamlead-dashboard__request-list">
                {requests.map((req) => (
                  <article
                    key={req._id}
                    className="dashboard-card teamlead-request-card"
                  >
                    <div className="card-header">
                      <h4 className="card-title">{req.event.title}</h4>
                      <span
                        className={`badge ${req.status === "Completed" ? "success" : ""}`}
                      >
                        {req.status}
                      </span>
                    </div>

                    <div className="teamlead-request-card__meta">
                      <div>Host: {req.host.name}</div>
                      <div>
                        Event Date:{" "}
                        {new Date(req.event.date).toLocaleDateString()}
                      </div>
                    </div>

                    {req.meetingDate && (
                      <p className="teamlead-request-card__meeting">
                        <strong>Scheduled Meeting:</strong>{" "}
                        {new Date(req.meetingDate).toLocaleString()}
                      </p>
                    )}

                    <div className="teamlead-request-card__actions">
                      {req.status === "Requested" && (
                        <button
                          className="btn btn-primary"
                          onClick={() => {
                            setActiveRequest(req);
                            setScheduleModalOpen(true);
                          }}
                        >
                          Schedule Meeting
                        </button>
                      )}
                      {req.status === "Meeting Scheduled" && (
                        <button
                          className="btn btn-primary"
                          onClick={() => {
                            setActiveRequest(req);
                            setInvoiceModalOpen(true);
                          }}
                        >
                          Issue Invoice & Quote
                        </button>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>

          {/* Issued Invoices */}
          <aside className="glass-panel teamlead-dashboard__panel">
            <h3>Issued Invoices</h3>
            {invoices.length === 0 ? (
              <p className="teamlead-dashboard__empty">
                No invoices issued yet.
              </p>
            ) : (
              <div className="teamlead-dashboard__invoice-list">
                {invoices.map((inv) => (
                  <article
                    key={inv._id}
                    className="dashboard-card teamlead-invoice-card"
                  >
                    <div className="card-header">
                      <h4 className="card-title">{inv.event.title}</h4>
                      <span
                        className={`badge ${inv.status === "Paid" ? "success" : ""}`}
                      >
                        {inv.status}
                      </span>
                    </div>
                    <p className="teamlead-invoice-card__description">
                      {inv.description}
                    </p>
                    <div className="teamlead-invoice-card__amount">
                      LKR {inv.amount.toLocaleString()}
                    </div>
                  </article>
                ))}
              </div>
            )}
          </aside>
        </div>
      )}

      {/* Schedule Modals */}
      {scheduleModalOpen && activeRequest && (
        <div
          className="modal-overlay"
          onClick={() => setScheduleModalOpen(false)}
        >
          <div
            className="modal teamlead-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal__header">
              <h3 className="modal__title">Schedule Meeting</h3>
              <button
                className="modal__close"
                onClick={() => setScheduleModalOpen(false)}
              >
                ×
              </button>
            </div>
            <form
              onSubmit={handleScheduleMeeting}
              className="modal__body teamlead-modal__body"
            >
              <p className="teamlead-modal__hint">
                Host: {activeRequest.host.name}
              </p>
              <div className="trendy-input-group">
                <input
                  id="meeting-date"
                  type="datetime-local"
                  className="trendy-input"
                  placeholder=" "
                  required
                  value={meetingDate}
                  onChange={(e) => setMeetingDate(e.target.value)}
                />
                <label htmlFor="meeting-date" className="trendy-label">
                  Meeting Date and Time
                </label>
              </div>
              <button
                type="submit"
                className="profile-btn teamlead-modal__submit"
              >
                Confirm Schedule
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Invoice Modal */}
      {invoiceModalOpen && activeRequest && (
        <div
          className="modal-overlay"
          onClick={() => setInvoiceModalOpen(false)}
        >
          <div
            className="modal teamlead-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal__header">
              <h3 className="modal__title">Issue Invoice / Quote</h3>
              <button
                className="modal__close"
                onClick={() => setInvoiceModalOpen(false)}
              >
                ×
              </button>
            </div>
            <form
              onSubmit={handleIssueInvoice}
              className="modal__body teamlead-modal__body"
            >
              <div className="trendy-input-group">
                <input
                  id="quoted-amount"
                  type="number"
                  min="0"
                  className="trendy-input"
                  placeholder=" "
                  required
                  value={invoiceData.amount}
                  onChange={(e) =>
                    setInvoiceData({ ...invoiceData, amount: e.target.value })
                  }
                />
                <label htmlFor="quoted-amount" className="trendy-label">
                  Quoted Amount (LKR)
                </label>
              </div>

              <div className="trendy-input-group">
                <textarea
                  id="invoice-description"
                  className="trendy-input"
                  rows="4"
                  placeholder=" "
                  required
                  value={invoiceData.description}
                  onChange={(e) =>
                    setInvoiceData({
                      ...invoiceData,
                      description: e.target.value,
                    })
                  }
                />
                <label htmlFor="invoice-description" className="trendy-label">
                  Description / Breakdown
                </label>
              </div>

              <button
                type="submit"
                className="profile-btn teamlead-modal__submit"
              >
                Send Invoice
              </button>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
