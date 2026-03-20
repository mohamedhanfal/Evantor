const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const { createEvent, requestService, getHostDashboardData } = require("../controllers/hostController");
const { isAuthenticated, authorizeRoles } = require("../middleware/auth");

const eventValidation = [
  body("title").notEmpty().withMessage("Title is required"),
  body("date").notEmpty().withMessage("Date is required"),
  body("time").notEmpty().withMessage("Time is required"),
  body("location").notEmpty().withMessage("Location is required"),
  body("category").notEmpty().withMessage("Category is required"),
  body("price").isNumeric().withMessage("Price is required and must be a number"),
];

const serviceValidation = [
  body("eventId").notEmpty().withMessage("Event ID is required"),
  body("sector").isIn(["Decoration", "DJ", "Food", "Photographers", "Travels"]).withMessage("Invalid sector"),
];

// All routes here require the user to be a "host" or "admin"
router.use(isAuthenticated, authorizeRoles("host", "admin"));

router.post("/events", eventValidation, createEvent);
router.post("/services/request", serviceValidation, requestService);
router.get("/dashboard", getHostDashboardData);

module.exports = router;
