const mongoose = require("mongoose");

const serviceRequestSchema = new mongoose.Schema(
  {
    event: {
      type: mongoose.Schema.ObjectId,
      ref: "Event",
      required: true,
    },
    host: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
    },
    sector: {
      type: String,
      required: true,
      enum: ["Decoration", "DJ", "Food", "Photographers", "Travels"],
    },
    status: {
      type: String,
      enum: ["Requested", "Meeting Scheduled", "Quoted", "Accepted", "Completed"],
      default: "Requested",
    },
    meetingDate: {
      type: Date,
    },
    teamLeadAssigned: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ServiceRequest", serviceRequestSchema);
