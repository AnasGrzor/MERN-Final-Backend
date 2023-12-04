const express = require("express");
const router = express.Router();

const {
  getAllFiles,
  getAllFIlesbyUser,
  streamFile,
  getFilebyId,
  uploadFile,
  deleteFile,
  deleteAllFiles,
} = require("./uploadController");

router.get("/file/:id", getFilebyId);
router.get("/allFiles", getAllFiles);
router.get("/allFiles/:id", getAllFIlesbyUser);
router.get("/stream/:id", streamFile);
router.post("/upload", uploadFile);
router.delete("/delete/:id", deleteFile);
router.delete("/deleteall", deleteAllFiles);

module.exports = router;
