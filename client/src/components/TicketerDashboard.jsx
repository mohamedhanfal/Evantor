import { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";
import api from "../utils/api";

const formatCurrency = (value) => `LKR ${Number(value || 0).toLocaleString()}`;

export default function TicketerDashboard() {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [globalStats, setGlobalStats] = useState({
    totalTicketsSold: 0,
    totalRevenue: 0,
  });
  const [eventBreakdown, setEventBreakdown] = useState([]);
  const [sortBy, setSortBy] = useState("revenue");
  const [rowsToShow, setRowsToShow] = useState("8");

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get("/ticketer/stats");
        if (data.success) {
          setGlobalStats(data.stats);
          setEventBreakdown(data.eventBreakdown);
        }
      } catch (err) {
        showToast("Failed to load ticketer analytics.", "error");
      } finally {
        setLoading(false);
      }
    };

    if (user && (user.role === "ticketer" || user.role === "admin")) {
      fetchStats();
    } else {
      setLoading(false);
    }
  }, [user, showToast]);

  const sortedBreakdown = useMemo(() => {
    const rows = [...eventBreakdown];
    rows.sort((a, b) => {
      if (sortBy === "tickets") return b.ticketsSold - a.ticketsSold;
      if (sortBy === "title") return a.title.localeCompare(b.title);
      return b.revenue - a.revenue;
    });
    return rows;
  }, [eventBreakdown, sortBy]);

  const visibleBreakdown = useMemo(
    () => sortedBreakdown.slice(0, Number(rowsToShow)),
    [sortedBreakdown, rowsToShow],
  );

  const chartData = useMemo(
    () =>
      visibleBreakdown.map((event, index) => ({
        rank: index + 1,
        shortTitle:
          event.title.length > 18
            ? `${event.title.slice(0, 18)}...`
            : event.title,
        ticketsSold: event.ticketsSold,
        revenue: event.revenue,
      })),
    [visibleBreakdown],
  );

  const averageTicketValue =
    globalStats.totalTicketsSold > 0
      ? globalStats.totalRevenue / globalStats.totalTicketsSold
      : 0;

  const topEvent = sortedBreakdown[0];

  if (!user || (user.role !== "ticketer" && user.role !== "admin")) {
    return (
      <main
        id="main"
        className="section"
        style={{ minHeight: "60vh", textAlign: "center" }}
      >
        <h2>Access Denied</h2>
        <p>Only Ticketers or Admins can access this dashboard.</p>
      </main>
    );
  }

  return (
    <main id="main" className="dashboard-container ticketer-dashboard">
      <header className="dashboard-header">
        <div>
          <h2 className="dashboard-title">Ticketing Analytics</h2>
          <p className="ticketer-dashboard__subtitle">
            Sales intelligence, revenue tracking, and event-level performance.
          </p>
        </div>
      </header>

      {loading ? (
        <p style={{ textAlign: "center" }}>Loading analytics...</p>
      ) : (
        <>
          <section
            className="ticketer-kpi-grid"
            aria-label="Ticketing KPI metrics"
          >
            <article className="glass-panel ticketer-kpi-card">
              <p>Total Tickets Sold</p>
              <strong>{globalStats.totalTicketsSold}</strong>
            </article>

            <article className="glass-panel ticketer-kpi-card">
              <p>Total Revenue</p>
              <strong>{formatCurrency(globalStats.totalRevenue)}</strong>
            </article>

            <article className="glass-panel ticketer-kpi-card">
              <p>Average Ticket Value</p>
              <strong>{formatCurrency(averageTicketValue)}</strong>
            </article>

            <article className="glass-panel ticketer-kpi-card">
              <p>Top Selling Event</p>
              <strong>{topEvent ? topEvent.title : "N/A"}</strong>
            </article>
          </section>

          <section
            className="ticketer-chart-grid"
            aria-label="Ticketing charts"
          >
            <article className="glass-panel ticketer-chart-card">
              <h3>Revenue by Event</h3>
              <div className="ticketer-chart-card__canvas">
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={chartData}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="var(--border)"
                    />
                    <XAxis dataKey="shortTitle" stroke="var(--text-muted)" />
                    <YAxis
                      stroke="var(--text-muted)"
                      tickFormatter={(value) => `${Math.round(value / 1000)}k`}
                    />
                    <Tooltip formatter={(value) => formatCurrency(value)} />
                    <Bar
                      dataKey="revenue"
                      fill="var(--primary)"
                      radius={[8, 8, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </article>

            <article className="glass-panel ticketer-chart-card">
              <h3>Tickets Sold by Event</h3>
              <div className="ticketer-chart-card__canvas">
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={chartData}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="var(--border)"
                    />
                    <XAxis dataKey="shortTitle" stroke="var(--text-muted)" />
                    <YAxis stroke="var(--text-muted)" />
                    <Tooltip formatter={(value) => [value, "Tickets"]} />
                    <Bar
                      dataKey="ticketsSold"
                      fill="#16a34a"
                      radius={[8, 8, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </article>
          </section>

          <section
            className="glass-panel ticketer-breakdown"
            aria-labelledby="ticketer-breakdown-title"
          >
            <div className="ticketer-breakdown__header">
              <h3 id="ticketer-breakdown-title">Sales Breakdown by Event</h3>
              <p>
                Showing {visibleBreakdown.length} of {sortedBreakdown.length}{" "}
                events with ticket sales
              </p>
            </div>

            <div className="ticketer-breakdown__controls">
              <select
                className="form-input"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="revenue">Sort by revenue</option>
                <option value="tickets">Sort by tickets sold</option>
                <option value="title">Sort by event title</option>
              </select>

              <select
                className="form-input"
                value={rowsToShow}
                onChange={(e) => setRowsToShow(e.target.value)}
              >
                <option value="5">Show top 5</option>
                <option value="8">Show top 8</option>
                <option value="12">Show top 12</option>
                <option value="20">Show top 20</option>
              </select>
            </div>

            {sortedBreakdown.length === 0 ? (
              <p className="ticketer-breakdown__empty">No tickets sold yet.</p>
            ) : (
              <div className="ticketer-breakdown__table-wrap">
                <table className="ticketer-breakdown__table">
                  <thead>
                    <tr>
                      <th>Rank</th>
                      <th>Event</th>
                      <th>Tickets Sold</th>
                      <th>Revenue</th>
                      <th>Avg / Ticket</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visibleBreakdown.map((event, index) => (
                      <tr key={`${event.title}-${index}`}>
                        <td>#{index + 1}</td>
                        <td>{event.title}</td>
                        <td>{event.ticketsSold}</td>
                        <td>{formatCurrency(event.revenue)}</td>
                        <td>
                          {formatCurrency(
                            event.ticketsSold > 0
                              ? event.revenue / event.ticketsSold
                              : 0,
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}
    </main>
  );
}
