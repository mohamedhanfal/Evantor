const User = require("../models/User");
const { validationResult } = require("express-validator");

// Helper — send JWT as cookie + JSON response
const sendToken = (user, statusCode, res) => {
  const token = user.getJwtToken();

  const cookieOptions = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  };

  const userData = {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    isEmailVerified: user.isEmailVerified,
  };

  res
    .status(statusCode)
    .cookie("token", token, cookieOptions)
    .json({ success: true, token, user: userData });
};

// POST /api/auth/register
exports.register = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(400)
        .json({ success: false, error: errors.array()[0].msg });
    }

    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res
        .status(400)
        .json({ success: false, error: "An account with this email already exists." });
    }

    const user = await User.create({ name, email, password });
    sendToken(user, 201, res);
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/login
exports.login = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(400)
        .json({ success: false, error: errors.array()[0].msg });
    }

    const { email, password } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() }).select(
      "+password"
    );
    if (!user) {
      return res
        .status(401)
        .json({ success: false, error: "Invalid email or password." });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, error: "Invalid email or password." });
    }

    sendToken(user, 200, res);
  } catch (err) {
    next(err);
  }
};

// GET /api/auth/logout
exports.logout = async (req, res) => {
  res.cookie("token", "none", {
    expires: new Date(Date.now()),
    httpOnly: true,
  });

  res.status(200).json({ success: true, message: "Logged out successfully." });
};

// GET /api/auth/me  (protected)
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, error: "User not found." });
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
      },
    });
  } catch (err) {
    next(err);
  }
};

// PUT /api/auth/profile — Update user profile
exports.updateProfile = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const user = await User.findById(req.user.id).select("+password");

    let emailChanged = false;
    let verificationTokenSent = null;

    if (name) user.name = name;
    if (password) user.password = password;

    if (email && email.toLowerCase() !== user.email) {
      const emailExists = await User.findOne({ email: email.toLowerCase() });
      if (emailExists) {
        return res
          .status(400)
          .json({ success: false, error: "Email is already in use." });
      }
      user.email = email.toLowerCase();
      user.isEmailVerified = false;
      user.emailVerificationToken = require("crypto").randomBytes(20).toString("hex");
      emailChanged = true;
      verificationTokenSent = user.emailVerificationToken; // In a real app, this would be strictly emailed, not returned.
    }

    await user.save(); // triggers pre-save hook for password

    res.status(200).json({
      success: true,
      message: emailChanged
        ? "Profile updated. Please verify your new email."
        : "Profile updated successfully.",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
      },
      // DEVELOPMENT ONLY: returning token in response so frontend can display it in an alert or we can manually test
      ...(verificationTokenSent && { verificationToken: verificationTokenSent }),
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/verify-email — Verify email using token
exports.verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res
        .status(400)
        .json({ success: false, error: "Verification token is required." });
    }

    const user = await User.findOne({ emailVerificationToken: token });

    if (!user) {
      return res
        .status(400)
        .json({ success: false, error: "Invalid or expired verification token." });
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Email verified successfully.",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
      },
    });
  } catch (err) {
    next(err);
  }
};
