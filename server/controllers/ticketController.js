const Ticket = require("../models/Ticket");
const Event = require("../models/Event");
const { validationResult } = require("express-validator");

// Generate a random order ID (e.g. EV-12345678)
const generateOrderId = () => {
  return "EV-" + Math.floor(10000000 + Math.random() * 90000000).toString();
};

// POST /api/tickets — Create a new ticket order
exports.createTicketOrder = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(400)
        .json({ success: false, error: errors.array()[0].msg });
    }

    const { eventId, tiers, paymentMethod } = req.body;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ success: false, error: "Event not found." });
    }

    let totalQuantity = 0;
    let totalPrice = 0;
    const validatedTiers = [];

    // Map and validate selected tiers
    for (const [tierName, qty] of Object.entries(tiers)) {
      if (qty > 0) {
        const eventTier = event.ticketTiers.find((t) => t.name === tierName);
        if (!eventTier) {
          return res
            .status(400)
            .json({ success: false, error: `Invalid tier: ${tierName}` });
        }
        if (qty > eventTier.maxPerOrder) {
          return res
            .status(400)
            .json({
              success: false,
              error: `Exceeded max per order for tier: ${tierName}`,
            });
        }
        totalQuantity += qty;
        totalPrice += qty * eventTier.price;
        validatedTiers.push({
          name: tierName,
          price: eventTier.price,
          quantity: qty,
        });
      }
    }

    if (totalQuantity === 0) {
      return res
        .status(400)
        .json({ success: false, error: "Please select at least one ticket." });
    }

    const ticket = await Ticket.create({
      user: req.user.id,
      event: event._id,
      eventTitle: event.title,
      eventDate: event.date,
      eventTime: event.time,
      eventLocation: event.location,
      orderId: generateOrderId(),
      totalQuantity,
      totalPrice,
      paymentMethod,
      tiers: validatedTiers,
      status: "valid",
    });

    res.status(201).json({
      success: true,
      ticket,
      message: "Ticket purchased successfully!",
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/tickets/my-tickets — Get logged-in user's tickets
exports.getMyTickets = async (req, res, next) => {
  try {
    const tickets = await Ticket.find({ user: req.user.id }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      count: tickets.length,
      tickets,
    });
  } catch (err) {
    next(err);
  }
};
