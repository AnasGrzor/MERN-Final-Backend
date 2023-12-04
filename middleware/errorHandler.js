const { logEvents } = require("./logger");
const multer = require("multer");

const errorHandler = (err, req, res, next) => {
  logEvents(
    `${err.name}: ${err.message}\t${req.method}\t${req.url}\t${req.headers.origin}`,
    "errLog.log"
  );
  console.log(err.stack);

  if (err instanceof multer.MulterError) {
    // Multer error occurred
    res.status(400).json({ message: err.message });
  } else {
    const status = res.statusCode ? res.statusCode : 500; // server error

    res.status(status);

    res.json({ message: err.message });
  }
};

module.exports = errorHandler;
