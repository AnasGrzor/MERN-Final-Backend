const multer = require("multer");
const path = require("path");

// Set storage engine for videos
const videoStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/videos/");
  },
  filename: function (req, file, cb) {
    cb(null, "video-" + Date.now());
  },
});

// Set storage engine for images
const imageStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/images/");
  },
  filename: function (req, file, cb) {
    cb(null, "image-" + Date.now());
  },
});

// Init video upload
const videoUpload = multer({
  storage: videoStorage,
  limits: { fileSize: 15000000 }, // Limit video file size to 15MB
  fileFilter: function (req, file, cb) {
    checkVideoFileType(file, cb);
  },
}).single("myVideo");

// Init image upload
const imageUpload = multer({
  storage: imageStorage,
  limits: { fileSize: 5000000 }, // Limit image file size to 5MB
  fileFilter: function (req, file, cb) {
    checkImageFileType(file, cb);
  },
}).single("myImage");

// Check video file type
function checkVideoFileType(file, cb) {
  const videoFiletypes = /mp4|mkv|avi/;
  const extname = videoFiletypes.test(
    path.extname(file.originalname).toLowerCase()
  );
  const mimetype = videoFiletypes.test(file.mimetype);
  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error("Error: Videos Only!"));
  }
}

// Check image file type
function checkImageFileType(file, cb) {
  const imageFiletypes = /jpeg|jpg|png|gif/;
  const extname = imageFiletypes.test(
    path.extname(file.originalname).toLowerCase()
  );
  const mimetype = imageFiletypes.test(file.mimetype);
  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error("Error: Images Only!"));
  }
}

module.exports = { videoUpload, imageUpload };
