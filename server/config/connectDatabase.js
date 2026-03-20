const mongoose = require("mongoose");
const connectDatabase = () => {
  mongoose
    .connect(process.env.DB_URI)
    .then((con) => {
      console.log("MongoDB connected with HOST: " + con.connection.host);
    })
    .catch((err) => {
      console.error("Failed to connect to MongoDB", err);
    });
};

module.exports = connectDatabase;
