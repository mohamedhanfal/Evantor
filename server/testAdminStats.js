const mongoose = require("mongoose");
require("dotenv").config({ path: "../../server/.env" }); // Assuming path relative to execution
const User = require("./models/User");
const Event = require("./models/Event");
const Invoice = require("./models/Invoice");
const Ticket = require("./models/Ticket");
const { getPlatformStats } = require("./controllers/adminController");

async function testStats() {
  await mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/evantor");
  console.log("Connected to MongoDB.");

  // Mock Request/Response
  const req = {};
  const res = {
    status: (code) => ({
      json: (data) => console.log(`RESPONSE (${code}):`, JSON.stringify(data, null, 2)),
    }),
  };
  const next = (err) => console.error("NEXT ERROR:", err);

  await getPlatformStats(req, res, next);

  mongoose.connection.close();
}

testStats();
