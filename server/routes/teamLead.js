const express = require("express");
const router = express.Router();
const { isAuthenticated, authorizeRoles } = require("../middleware/auth");
const { getSectorRequests, scheduleMeeting, issueInvoice } = require("../controllers/teamLeadController");

// Require team_lead or admin role for these routes
router.use(isAuthenticated, authorizeRoles("team_lead", "admin"));

router.get("/requests", getSectorRequests);
router.put("/requests/:id/schedule", scheduleMeeting);
router.post("/invoices", issueInvoice);

module.exports = router;
