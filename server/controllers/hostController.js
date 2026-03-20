const Event = require("../models/Event");
const ServiceRequest = require("../models/ServiceRequest");
const Invoice = require("../models/Invoice");
const { validationResult } = require("express-validator");
const fs = require("fs");
const path = require("path");

// POST /api/host/events — Create a new event
exports.createEvent = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, error: errors.array()[0].msg });
    }

    // Assign logged-in user as the event creator/host
    const eventData = { ...req.body, createdBy: req.user.id };

    const event = await Event.create(eventData);

    if (req.file) {
      const filename = `${event._id}.jpg`;
      const imagePath = path.join(__dirname, "../resources/eventImg", filename);
      
      // Ensure directory exists just in case
      if (!fs.existsSync(path.dirname(imagePath))) {
        fs.mkdirSync(path.dirname(imagePath), { recursive: true });
      }
      
      fs.writeFileSync(imagePath, req.file.buffer);
      event.image = `/images/${filename}`;
    } else {
      // Default placeholder if none uploaded
      event.image = "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80";
    }
    await event.save();

    res.status(201).json({
      success: true,
      event,
      message: "Event created successfully!",
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/host/services/request — Request a new service team for an event
exports.requestService = async (req, res, next) => {
  try {
    const { eventId, sector } = req.body;

    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ success: false, error: "Event not found" });
    
    // Validate host owns the event (Optional but good practice if createdBy is added to Event model)
    // if (event.createdBy.toString() !== req.user.id) return res.status(403).json({ error: "Unauthorized" });

    const existingRequest = await ServiceRequest.findOne({ event: eventId, sector });
    if (existingRequest) {
      return res.status(400).json({ success: false, error: `${sector} service already requested for this event.` });
    }

    const serviceRequest = await ServiceRequest.create({
      event: eventId,
      host: req.user.id,
      sector,
    });

    res.status(201).json({
      success: true,
      serviceRequest,
      message: `Successfully requested ${sector} service. The team will schedule a meeting soon.`,
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/host/dashboard — Get host's events, active service requests, and invoices
exports.getHostDashboardData = async (req, res, next) => {
  try {
    // Currently, we don't strictly tie Events to Hosts via a createdBy field in Event model,
    // but the user wants to "plan their event". Let's fetch service requests tied to this host.
    
    // We fetch all ServiceRequests the host made
    const serviceRequests = await ServiceRequest.find({ host: req.user.id }).populate('event', 'title date');
    
    // Fetch all Invoices for this host
    const invoices = await Invoice.find({ host: req.user.id })
      .populate('serviceRequest', 'sector status')
      .populate('event', 'title');

    res.status(200).json({
      success: true,
      serviceRequests,
      invoices,
    });
  } catch (err) {
    next(err);
  }
};
