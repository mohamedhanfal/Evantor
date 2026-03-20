const ServiceRequest = require("../models/ServiceRequest");
const Invoice = require("../models/Invoice");

// GET /api/team-lead/requests — Get service requests for the team lead's sector
exports.getSectorRequests = async (req, res, next) => {
  try {
    const sector = req.user.serviceSector;
    if (!sector) return res.status(400).json({ success: false, error: "You are not assigned to a sector." });

    const requests = await ServiceRequest.find({ sector })
      .populate("event", "title date location")
      .populate("host", "name email");

    const invoices = await Invoice.find({ teamLead: req.user.id })
      .populate("serviceRequest", "status")
      .populate("event", "title");

    res.status(200).json({
      success: true,
      requests,
      invoices,
    });
  } catch (err) {
    next(err);
  }
};

// PUT /api/team-lead/requests/:id/schedule — Schedule meeting for a service request
exports.scheduleMeeting = async (req, res, next) => {
  try {
    const { meetingDate } = req.body;
    if (!meetingDate) return res.status(400).json({ success: false, error: "Meeting date is required." });

    const request = await ServiceRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ success: false, error: "Request not found." });

    if (request.sector !== req.user.serviceSector) {
      return res.status(403).json({ success: false, error: "Cannot modify requests for a different sector." });
    }

    request.meetingDate = meetingDate;
    request.status = "Meeting Scheduled";
    request.teamLeadAssigned = req.user.id;
    await request.save();

    res.status(200).json({ success: true, request });
  } catch (err) {
    next(err);
  }
};

// POST /api/team-lead/invoices — Issue an invoice to the host
exports.issueInvoice = async (req, res, next) => {
  try {
    const { serviceRequestId, amount, description } = req.body;

    const request = await ServiceRequest.findById(serviceRequestId);
    if (!request) return res.status(404).json({ success: false, error: "Service request not found." });
    if (request.sector !== req.user.serviceSector) {
      return res.status(403).json({ success: false, error: "Cannot invoice for a different sector." });
    }

    const invoice = await Invoice.create({
      serviceRequest: request._id,
      event: request.event,
      host: request.host,
      teamLead: req.user.id,
      amount,
      description,
    });

    request.status = "Quoted";
    await request.save();

    res.status(201).json({ success: true, invoice });
  } catch (err) {
    next(err);
  }
};
