const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Protect routes — verify JWT from cookie or Authorization header
exports.isAuthenticated = async (req, res, next) => {
  try {
    let token;

    // Check cookie first
    if (req.cookies && req.cookies.token && req.cookies.token !== "none") {
      token = req.cookies.token;
    }
    // Fallback to Authorization header
    else if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res
        .status(401)
        .json({ success: false, error: "Please log in to access this resource." });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id);

    if (!req.user) {
      return res
        .status(401)
        .json({ success: false, error: "User no longer exists." });
    }

    next();
  } catch (err) {
    return res
      .status(401)
      .json({ success: false, error: "Invalid or expired token." });
  }
};
