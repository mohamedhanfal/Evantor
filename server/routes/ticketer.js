const express = require("express");
const router = express.Router();
const { isAuthenticated, authorizeRoles } = require("../middleware/auth");
const { getTicketerStats } = require("../controllers/ticketerController");

router.use(isAuthenticated, authorizeRoles("ticketer", "admin"));

router.get("/stats", getTicketerStats);

module.exports = router;
