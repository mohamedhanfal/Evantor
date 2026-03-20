const User = require("../models/User");
const Invoice = require("../models/Invoice");
const Ticket = require("../models/Ticket");
const Event = require("../models/Event");

// GET /api/admin/stats — Get platform-wide statistics
exports.getPlatformStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalEvents = await Event.countDocuments();
    
    // Calculate total service turnover (sum of all paid invoices)
    const paidInvoices = await Invoice.find({ status: "Paid" });
    const serviceTurnover = paidInvoices.reduce((acc, inv) => acc + inv.amount, 0);

    // Calculate total ticket turnover
    const allTickets = await Ticket.find().populate("event");
    let ticketTurnover = 0;
    allTickets.forEach(ticket => {
      ticketTurnover += ticket.totalPrice || 0;
    });

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalEvents,
        serviceTurnover,
        ticketTurnover,
        totalTurnover: serviceTurnover + ticketTurnover,
        platformProfit: (serviceTurnover + ticketTurnover) * 0.1, // Assume 10% platform cut
      }
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/admin/users — Get all users for management
exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().select("-password");
    res.status(200).json({
      success: true,
      users,
    });
  } catch (err) {
    next(err);
  }
};

// PUT /api/admin/users/:id/role — Update user role and sector
exports.updateUserRole = async (req, res, next) => {
  try {
    const { role, serviceSector } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) return res.status(404).json({ success: false, error: "User not found." });

    user.role = role || user.role;
    if (role === "team_lead") {
      user.serviceSector = serviceSector || user.serviceSector;
    } else {
      user.serviceSector = null; // Clear if not team lead
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: `User role updated to ${user.role}.`,
      user: {
        id: user._id,
        name: user.name,
        role: user.role,
        serviceSector: user.serviceSector,
      }
    });
  } catch (err) {
    next(err);
  }
};
