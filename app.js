const express = require("express");
const app = express();
const mongoose = require("mongoose");
const PORT = 5000;

const { MONGOURI } = require("./config/config");

mongoose.connect(MONGOURI, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.connection.on("connected", () => {
  console.log("mongodb connected");
});
mongoose.connection.on("error", (err) => {
  console.log("mongodb not connected", err);
});
require("./models/User");
require("./models/Post");
app.use(express.json());


app.use(require("./routes/auth"));
app.use(require("./routes/post"));
app.use(require("./routes/user"));
app.listen(PORT, () => {
  console.log("server is running");
});
