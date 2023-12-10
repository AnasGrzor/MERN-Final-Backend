const express = require("express");
const router = express.Router();
const upload = require("../config/multerConfig");

const {
  getAllFiles,
  getAllFIlesbyUser,
  streamFile,
  getFilebyId,
  uploadFile,
  deleteFile,
  deleteAllFiles,
  deleteAllFIlesbyUser,
  updateFile,
} = require("./uploadController");
const verifyJWT = require("../middleware/verifyJWT");

router.get("/file/:id", getFilebyId);
router.get("/allFiles", getAllFiles);
router.get("/allFiles/:id", getAllFIlesbyUser);
router.get("/stream/:id", streamFile);
router.use(verifyJWT)
router.post("/upload", upload, uploadFile);
router.patch("/update/:id", updateFile);
router.delete("/delete/:id", deleteFile);
router.delete("/deleteall/:id", deleteAllFIlesbyUser);
router.delete("/deleteall", deleteAllFiles);

module.exports = router;
