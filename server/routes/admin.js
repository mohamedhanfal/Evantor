const express = require("express");
const router = express.Router();
const { isAuthenticated, authorizeRoles } = require("../middleware/auth");
const { getPlatformStats, getAllUsers, updateUserRole } = require("../controllers/adminController");

router.use(isAuthenticated, authorizeRoles("admin"));

router.get("/stats", getPlatformStats);
router.get("/users", getAllUsers);
router.put("/users/:id/role", updateUserRole);

module.exports = router;
