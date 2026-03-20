const mongoose = require("mongoose");

const ticketTierSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
  },
  { _id: false }
);

const ticketSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
    },
    event: {
      type: mongoose.Schema.ObjectId,
      ref: "Event",
      required: true,
    },
    // We store minimal event data so that if an event is deleted or changed, the ticket history stays intact.
    eventTitle: {
      type: String,
      required: true,
    },
    eventDate: {
      type: String,
      required: true,
    },
    eventTime: {
      type: String,
      required: true,
    },
    eventLocation: {
      type: String,
      required: true,
    },
    orderId: {
      type: String,
      required: true,
      unique: true,
    },
    totalQuantity: {
      type: Number,
      required: true,
    },
    totalPrice: {
      type: Number,
      required: true,
    },
    paymentMethod: {
      type: String,
      required: true,
      enum: ["Card", "GPay"],
      default: "Card",
    },
    status: {
      type: String,
      enum: ["valid", "scanned", "cancelled"],
      default: "valid",
    },
    tiers: [ticketTierSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Ticket", ticketSchema);
