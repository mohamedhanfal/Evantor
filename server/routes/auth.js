const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const { register, login, logout, getMe } = require("../controllers/authController");
const { isAuthenticated } = require("../middleware/auth");

// Validation rules
const registerValidation = [
  body("name").trim().notEmpty().withMessage("Name is required."),
  body("email").trim().isEmail().withMessage("Please enter a valid email."),
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters."),
];

const loginValidation = [
  body("email").trim().isEmail().withMessage("Please enter a valid email."),
  body("password").notEmpty().withMessage("Password is required."),
];

router.post("/register", registerValidation, register);
router.post("/login", loginValidation, login);
router.get("/logout", logout);
router.get("/me", isAuthenticated, getMe);

module.exports = router;
