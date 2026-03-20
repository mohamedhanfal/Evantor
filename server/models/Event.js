const mongoose = require("mongoose");

const ticketTierSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Ticket tier name is required"],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, "Ticket tier price is required"],
      min: [0, "Price cannot be negative"],
    },
    maxPerOrder: {
      type: Number,
      required: [true, "Max per order is required"],
      min: [1, "Max per order must be at least 1"],
    },
  },
  { _id: false }
);

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Event title is required"],
      trim: true,
    },
    date: {
      type: String,
      required: [true, "Event date is required"],
    },
    time: {
      type: String,
      required: [true, "Event time is required"],
    },
    location: {
      type: String,
      required: [true, "Event location is required"],
      trim: true,
    },
    category: {
      type: String,
      required: [true, "Event category is required"],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, "Event price is required"],
      min: [0, "Price cannot be negative"],
    },
    image: {
      type: String,
      default: "",
    },
    description: {
      type: String,
      default: "",
    },
    ticketTiers: {
      type: [ticketTierSchema],
      default: [],
    },
    isPrivate: {
      type: Boolean,
      default: false,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Event", eventSchema);
