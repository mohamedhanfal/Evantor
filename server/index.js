const express = require("express");
const app = express();
const connectDatabase = require("./config/connectDatabase");
require("dotenv").config();

connectDatabase();

app.listen(process.env.PORT, () => {
  console.log(
    `Server is running on port ${process.env.PORT} in ${process.env.NODE_ENV} mode`,
  );
});
