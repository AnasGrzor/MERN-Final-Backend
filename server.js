require("dotenv").config();
const express = require("express");
app = express();
const mongoose = require("mongoose");
const connectDB = require("./config/dbConn");
const morgan = require("morgan");
const cors = require("cors");
const { logger, logEvents } = require("./middleware/logger");
const errorHandler = require("./middleware/errorHandler");
const cookieParser = require("cookie-parser");
const PORT = process.env.PORT || 4000;

app.use(cors)

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use(cookieParser());
// app.use(logger);

connectDB();

//routes
app.use("/auth", require("./routes/authRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/video", require("./uploads/uploadRoutes"));

app.use(errorHandler);

app.get("/", (req, res) => {
  res.send("API is running...");
})

mongoose.connection.once("open", () => {
  console.log("Connected to MongoDB");
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});

mongoose.connection.on("error", (err) => {
  console.log(err);
  logEvents(
    `${err.no}: ${err.code}\t${err.syscall}\t${err.hostname}`,
    "mongoErrLog.log"
  );
});
