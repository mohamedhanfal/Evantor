const mongoose = require("mongoose");

const invoiceSchema = new mongoose.Schema(
  {
    serviceRequest: {
      type: mongoose.Schema.ObjectId,
      ref: "ServiceRequest",
      required: true,
    },
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
    teamLead: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    description: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["Pending", "Paid"],
      default: "Pending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Invoice", invoiceSchema);
