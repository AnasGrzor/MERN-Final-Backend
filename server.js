require("dotenv").config();
const express = require("express");
app = express();
const mongoose = require("mongoose");
const connectDB = require("./config/dbConn");
const morgan = require("morgan");
const cors = require("cors");
const corsOptions = require("./config/corsOptions");
const { logger, logEvents } = require("./middleware/logger");
const errorHandler = require("./middleware/errorHandler");
const cookieParser = require("cookie-parser");
const upload = require("./config/multerConfig");
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use(cookieParser());
app.use(logger);

connectDB();

app.use(cors(corsOptions));

//routes
app.use("/auth", require("./routes/authRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/video", require("./uploads/uploadRoutes"));

// app.post("/upload", (req, res) => {
//   upload(req, res, (err) => {
//     if (err) {
//       res.render("index", {
//         msg: err,
//       });
//     } else {
//       if (req.file == undefined) {
//         res.render("index", {
//           msg: "Error: No File Selected!",
//         });
//       } else {
//         res.render("index", {
//           msg: "File Uploaded!",
//           file: `uploads/${req.file.filename}`,
//         });
//       }
//     }
//   });
// });

app.use(errorHandler);

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
