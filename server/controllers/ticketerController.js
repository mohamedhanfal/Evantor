const Ticket = require("../models/Ticket");
const Event = require("../models/Event");

// GET /api/ticketer/stats — Get global ticket flow stats
exports.getTicketerStats = async (req, res, next) => {
  try {
    const allTickets = await Ticket.find().populate("event", "title price");
    
    let totalTicketsSold = 0;
    let totalRevenue = 0;

    const eventStats = {};

    allTickets.forEach(ticket => {
      totalTicketsSold += ticket.totalQuantity || 0;
      const rev = ticket.totalPrice || 0;
      totalRevenue += rev;

      if (ticket.event) {
        if (!eventStats[ticket.event._id]) {
          eventStats[ticket.event._id] = {
            title: ticket.event.title,
            ticketsSold: 0,
            revenue: 0,
          };
        }
        eventStats[ticket.event._id].ticketsSold += ticket.totalQuantity || 0;
        eventStats[ticket.event._id].revenue += rev;
      }
    });

    res.status(200).json({
      success: true,
      stats: {
        totalTicketsSold,
        totalRevenue,
      },
      eventBreakdown: Object.values(eventStats),
    });
  } catch (err) {
    next(err);
  }
};
