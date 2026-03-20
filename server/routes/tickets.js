const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const { createTicketOrder, getMyTickets } = require("../controllers/ticketController");
const { isAuthenticated } = require("../middleware/auth");

const createTicketValidation = [
  body("eventId").notEmpty().withMessage("Event ID is required"),
  body("tiers").isObject().withMessage("Tiers data is required"),
  body("paymentMethod")
    .isIn(["Card", "GPay"])
    .withMessage("Payment method must be Card or GPay"),
];

router.post("/", isAuthenticated, createTicketValidation, createTicketOrder);
router.get("/my-tickets", isAuthenticated, getMyTickets);

module.exports = router;
