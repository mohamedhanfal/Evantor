const Event = require("../models/Event");

// GET /api/events — get all events (with optional filters)
exports.getEvents = async (req, res, next) => {
  try {
    const { location, date, category } = req.query;
    const filter = {};

    if (location) {
      filter.location = { $regex: location, $options: "i" };
    }
    if (date) {
      filter.date = date;
    }
    if (category) {
      filter.category = category;
    }

    const events = await Event.find(filter).sort({ date: 1 });

    res.status(200).json({
      success: true,
      count: events.length,
      events,
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/events/:id — get single event by ID
exports.getEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res
        .status(404)
        .json({ success: false, error: "Event not found." });
    }

    res.status(200).json({ success: true, event });
  } catch (err) {
    next(err);
  }
};
