import { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";
import api from "../utils/api";

const SERVICES = ["Decoration", "DJ", "Food", "Photographers", "Travels"];
const ROLES = ["host", "ticketer", "team_lead", "admin"];

const ROLE_COLORS = {
  host: "#2563eb",
  ticketer: "#0ea5e9",
  team_lead: "#16a34a",
  admin: "#d97706",
};

const formatRole = (role) => role.replace("_", " ");
const formatCurrency = (value) => `LKR ${Number(value || 0).toLocaleString()}`;

export default function AdminDashboard() {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);

  const [editUser, setEditUser] = useState(null);
  const [removeUser, setRemoveUser] = useState(null);
  const [selectedRole, setSelectedRole] = useState("host");
  const [selectedSector, setSelectedSector] = useState(SERVICES[0]);

  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [sectorFilter, setSectorFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [rowsToShow, setRowsToShow] = useState("12");
  const [verifiedOnly, setVerifiedOnly] = useState(false);

  const fetchAdminData = async ({ silent = false } = {}) => {
    try {
      if (!silent) setLoading(true);

      const [statsRes, usersRes] = await Promise.all([
        api.get("/admin/stats"),
        api.get("/admin/users"),
      ]);

      if (statsRes.data.success) setStats(statsRes.data.stats);
      if (usersRes.data.success) setUsers(usersRes.data.users);
    } catch (err) {
      showToast("Failed to load admin data.", "error");
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.role === "admin") {
      fetchAdminData();
    } else {
      setLoading(false);
    }
  }, [user, showToast]);

  const filteredUsers = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    const filtered = users.filter((u) => {
      if (roleFilter !== "all" && u.role !== roleFilter) return false;
      if (
        sectorFilter !== "all" &&
        (u.serviceSector || "none") !== sectorFilter
      )
        return false;
      if (verifiedOnly && !u.isEmailVerified) return false;

      if (!search) return true;
      return (
        u.name.toLowerCase().includes(search) ||
        u.email.toLowerCase().includes(search)
      );
    });

    filtered.sort((a, b) => {
      if (sortBy === "name_asc") return a.name.localeCompare(b.name);
      if (sortBy === "name_desc") return b.name.localeCompare(a.name);
      if (sortBy === "role_asc") return a.role.localeCompare(b.role);
      if (sortBy === "role_desc") return b.role.localeCompare(a.role);
      if (sortBy === "oldest") {
        return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
      }
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    });

    return filtered;
  }, [users, searchTerm, roleFilter, sectorFilter, sortBy, verifiedOnly]);

  const visibleUsers = useMemo(
    () => filteredUsers.slice(0, Number(rowsToShow)),
    [filteredUsers, rowsToShow],
  );

  const roleChartData = useMemo(
    () =>
      ROLES.map((role) => ({
        role,
        name: formatRole(role),
        value: users.filter((u) => u.role === role).length,
        color: ROLE_COLORS[role],
      })),
    [users],
  );

  const turnoverChartData = useMemo(() => {
    if (!stats) return [];
    return [
      { name: "Service", value: stats.serviceTurnover || 0 },
      { name: "Tickets", value: stats.ticketTurnover || 0 },
      { name: "Profit", value: stats.platformProfit || 0 },
    ];
  }, [stats]);

  const openEditModal = (targetUser) => {
    setEditUser(targetUser);
    setSelectedRole(targetUser.role);
    setSelectedSector(targetUser.serviceSector || SERVICES[0]);
  };

  const handleUpdateRole = async (e) => {
    e.preventDefault();
    if (!editUser) return;

    try {
      const payload = {
        role: selectedRole,
        serviceSector: selectedRole === "team_lead" ? selectedSector : null,
      };

      const { data } = await api.put(
        `/admin/users/${editUser._id}/role`,
        payload,
      );

      if (data.success) {
        showToast("User role updated.", "success");
        setEditUser(null);
        await fetchAdminData({ silent: true });
      }
    } catch (err) {
      showToast(
        err.response?.data?.error || "Failed to update user role.",
        "error",
      );
    }
  };

  const handleRemoveUser = async () => {
    if (!removeUser) return;

    try {
      const { data } = await api.delete(`/admin/users/${removeUser._id}`);
      if (data.success) {
        showToast("User removed successfully.", "success");
        setUsers((prev) => prev.filter((u) => u._id !== removeUser._id));
        setRemoveUser(null);
      }
    } catch (err) {
      showToast(err.response?.data?.error || "Failed to remove user.", "error");
    }
  };

  if (!user || user.role !== "admin") {
    return (
      <main
        id="main"
        className="section"
        style={{ minHeight: "60vh", textAlign: "center" }}
      >
        <h2>Access Denied</h2>
        <p>Only Administrators can access this dashboard.</p>
      </main>
    );
  }

  return (
    <main id="main" className="dashboard-container admin-dashboard">
      <header className="dashboard-header">
        <div>
          <h2 className="dashboard-title">Admin Dashboard</h2>
          <p className="admin-dashboard__subtitle">
            Professional analytics, role governance, and user operations.
          </p>
        </div>
      </header>

      {loading ? (
        <p style={{ textAlign: "center" }}>Loading dashboard...</p>
      ) : (
        <>
          <section className="admin-kpi-grid" aria-label="Platform key metrics">
            <article className="glass-panel admin-kpi-card">
              <p>Total Users</p>
              <strong>{stats?.totalUsers || 0}</strong>
            </article>
            <article className="glass-panel admin-kpi-card">
              <p>Total Events</p>
              <strong>{stats?.totalEvents || 0}</strong>
            </article>
            <article className="glass-panel admin-kpi-card">
              <p>Total Turnover</p>
              <strong>{formatCurrency(stats?.totalTurnover)}</strong>
            </article>
            <article className="glass-panel admin-kpi-card">
              <p>Platform Profit (10%)</p>
              <strong>{formatCurrency(stats?.platformProfit)}</strong>
            </article>
          </section>

          <section className="admin-chart-grid" aria-label="Analytics charts">
            <article className="glass-panel admin-chart-card">
              <h3>Revenue Composition</h3>
              <div className="admin-chart-card__canvas">
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={turnoverChartData}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="var(--border)"
                    />
                    <XAxis dataKey="name" stroke="var(--text-muted)" />
                    <YAxis
                      stroke="var(--text-muted)"
                      tickFormatter={(value) => `${Math.round(value / 1000)}k`}
                    />
                    <Tooltip formatter={(value) => formatCurrency(value)} />
                    <Bar
                      dataKey="value"
                      radius={[8, 8, 0, 0]}
                      fill="var(--primary)"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </article>

            <article className="glass-panel admin-chart-card">
              <h3>User Role Distribution</h3>
              <div className="admin-chart-card__canvas">
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie
                      data={roleChartData}
                      dataKey="value"
                      nameKey="name"
                      outerRadius={96}
                      innerRadius={52}
                      paddingAngle={3}
                    >
                      {roleChartData.map((entry) => (
                        <Cell key={entry.role} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value, name) => [value, name]} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="admin-role-legend">
                {roleChartData.map((item) => (
                  <span key={item.role}>
                    <i style={{ background: item.color }} aria-hidden />
                    {item.name}: {item.value}
                  </span>
                ))}
              </div>
            </article>
          </section>

          <section
            className="glass-panel admin-users"
            aria-labelledby="admin-users-title"
          >
            <div className="admin-users__header">
              <h3 id="admin-users-title">User and Role Management</h3>
              <p>
                Showing {visibleUsers.length} of {filteredUsers.length} matched
                users
              </p>
            </div>

            <div className="admin-users__controls">
              <input
                type="text"
                className="form-input"
                placeholder="Search by name or email"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />

              <select
                className="form-input"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                <option value="all">All roles</option>
                {ROLES.map((role) => (
                  <option key={role} value={role}>
                    {formatRole(role)}
                  </option>
                ))}
              </select>

              <select
                className="form-input"
                value={sectorFilter}
                onChange={(e) => setSectorFilter(e.target.value)}
              >
                <option value="all">All sectors</option>
                <option value="none">No sector</option>
                {SERVICES.map((sector) => (
                  <option key={sector} value={sector}>
                    {sector}
                  </option>
                ))}
              </select>

              <select
                className="form-input"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
                <option value="name_asc">Name A-Z</option>
                <option value="name_desc">Name Z-A</option>
                <option value="role_asc">Role A-Z</option>
                <option value="role_desc">Role Z-A</option>
              </select>

              <select
                className="form-input"
                value={rowsToShow}
                onChange={(e) => setRowsToShow(e.target.value)}
              >
                <option value="8">Show 8 rows</option>
                <option value="12">Show 12 rows</option>
                <option value="20">Show 20 rows</option>
                <option value="50">Show 50 rows</option>
              </select>

              <label className="admin-users__verified">
                <input
                  type="checkbox"
                  checked={verifiedOnly}
                  onChange={(e) => setVerifiedOnly(e.target.checked)}
                />
                Verified only
              </label>
            </div>

            <div className="admin-users__table-wrap">
              <table className="admin-users__table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Sector</th>
                    <th>Verified</th>
                    <th>Joined</th>
                    <th className="admin-users__actions-col">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleUsers.length === 0 && (
                    <tr>
                      <td colSpan={7} className="admin-users__empty-row">
                        No users match the selected filters.
                      </td>
                    </tr>
                  )}

                  {visibleUsers.map((u) => (
                    <tr key={u._id}>
                      <td>{u.name}</td>
                      <td>{u.email}</td>
                      <td>
                        <span
                          className={`admin-role-pill admin-role-pill--${u.role}`}
                        >
                          {formatRole(u.role)}
                        </span>
                      </td>
                      <td>{u.serviceSector || "-"}</td>
                      <td>{u.isEmailVerified ? "Yes" : "No"}</td>
                      <td>
                        {u.createdAt
                          ? new Date(u.createdAt).toLocaleDateString("en-GB")
                          : "-"}
                      </td>
                      <td className="admin-users__actions-col">
                        <button
                          className="btn btn-primary"
                          onClick={() => openEditModal(u)}
                        >
                          Change Role
                        </button>
                        <button
                          className="btn btn-ghost admin-btn-danger"
                          disabled={u._id === user._id}
                          onClick={() => setRemoveUser(u)}
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}

      {editUser && (
        <div className="modal-overlay" onClick={() => setEditUser(null)}>
          <div
            className="modal admin-user-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal__header">
              <h3 className="modal__title">Update User Role</h3>
              <button
                className="modal__close"
                onClick={() => setEditUser(null)}
              >
                ×
              </button>
            </div>

            <form
              onSubmit={handleUpdateRole}
              className="modal__body admin-user-modal__body"
            >
              <p className="admin-user-modal__hint">
                Updating <strong>{editUser.name}</strong>
              </p>

              <div className="trendy-input-group admin-user-modal__field">
                <select
                  className="trendy-input"
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                >
                  <option value="host">Host / Standard User</option>
                  <option value="ticketer">Ticketer</option>
                  <option value="team_lead">Team Lead</option>
                  <option value="admin">Admin</option>
                </select>
                <label className="trendy-label admin-user-modal__label">
                  Role
                </label>
              </div>

              {selectedRole === "team_lead" && (
                <div className="trendy-input-group admin-user-modal__field">
                  <select
                    className="trendy-input"
                    value={selectedSector}
                    onChange={(e) => setSelectedSector(e.target.value)}
                  >
                    {SERVICES.map((sector) => (
                      <option key={sector} value={sector}>
                        {sector}
                      </option>
                    ))}
                  </select>
                  <label className="trendy-label admin-user-modal__label">
                    Service Sector
                  </label>
                </div>
              )}

              <button
                type="submit"
                className="profile-btn admin-user-modal__submit"
              >
                Save Changes
              </button>
            </form>
          </div>
        </div>
      )}

      {removeUser && (
        <div className="modal-overlay" onClick={() => setRemoveUser(null)}>
          <div
            className="modal admin-user-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal__header">
              <h3 className="modal__title">Confirm User Removal</h3>
              <button
                className="modal__close"
                onClick={() => setRemoveUser(null)}
              >
                ×
              </button>
            </div>

            <div className="modal__body admin-user-modal__body">
              <p className="admin-user-modal__hint">
                Remove <strong>{removeUser.name}</strong> from the platform?
                This action cannot be undone.
              </p>

              <div className="admin-user-modal__actions">
                <button
                  className="btn btn-ghost"
                  onClick={() => setRemoveUser(null)}
                >
                  Cancel
                </button>
                <button
                  className="btn admin-btn-danger-fill"
                  onClick={handleRemoveUser}
                >
                  Remove User
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
