const fs = require("fs");
const File = require("../models/fileModel");
const upload = require("../config/multerConfig");
const asyncHandler = require("express-async-handler");
const mongoose = require("mongoose");
const nodeCache = require("node-cache");
myCache = new nodeCache({ stdTTL: 3600 });

// @desc upload file
const uploadFile = asyncHandler(async (req, res) => {
  console.log(req);
  const file = req.file;
  const filedata = fs.readFileSync(file.path);

  const FileDoc = new File({
    title: req.body.title,
    username: req.user,
    description: req.body.Description,
    userId: req.userId,
    filedata: filedata,
    contentType: file.mimetype,
  });

  fs.unlinkSync(file.path);

  await FileDoc.save();

  res.json({
    success: true,
    status: 200,
    username: req.user,
    title: req.body.title,
    description: req.body.Description,
    message: "File uploaded successfully",
    method: {
      type: "GET",
      url: "http://localhost:3000/video/files",
    },
  });
});

const streamFile = asyncHandler(async (req, res) => {
  const fileId = req.params.id;
  const range = req.headers.range;

  const fileDoc = await File.findById(fileId);

  try {
    if (!fileDoc) {
      return res.status(404).send("File not found");
    }

    if (!range) {
      console.log("Range header not provided");
      return res.status(400).send("Range header not provided");
    }

     // Fetch the file from the database

    const videoBuffer = fileDoc.filedata.buffer; // Get the video data from the file document
    const videoSize = videoBuffer.byteLength; // Get the size of the video data

    const chunkSize = 10 ** 6; // Set the chunk size to 1 MB
    const start = Number(range.replace(/\D/g, "")); // Get the start of the range
    const end = Math.min(start + chunkSize, videoSize - 1); // Get the end of the range

    const headers = {
      "Content-Range": `bytes ${start}-${end}/${videoSize}`,
      "Accept-Ranges": "bytes",
      "Content-Length": end - start + 1,
      "Content-Type": "video/mp4", // Make sure this is the correct MIME type for your video
    };

    console.log("Response headers:", headers);
    res.writeHead(206, headers);

    const videoStream = Buffer.from(videoBuffer.slice(start, end + 1)); // Get the video data from the buffer

    res.write(videoStream); // Pipe the video data to the response

    res.on("close", () => {
      res.end();
    })

  } catch (err) {
    console.error("Error:", err);
    return res.status(500).send("Internal Server Error");
  }
});

const updateFile = asyncHandler(async (req, res) => {
  const fileId = req.params.id;
  const { title, description } = req.body;

  await File.findByIdAndUpdate(fileId, { title, description });

  res.json({
    success: true,
    status: 200,
    message: "File updated successfully",
    method: {
      type: "GET",
      url: "http://localhost:3000/video/files",
    },
  });
});

const getAllFiles = asyncHandler(async (req, res) => {
  try {
    if (myCache.has("allFiles")) {
      const cachedFiles = myCache.get("allFiles");
      return res.json(cachedFiles);
    } else {
      const files = await File.find({}).select({ filedata: 0 });
      // console.log("Files:", files);

      if (!files || files.length === 0) {
        return res.status(404).json({ error: "No files found" });
      }

      // Process the files
      const processedFiles = processFiles(files);

      // Cache the processed files
      myCache.set("allFiles", processedFiles);

      // Return the files
      res.json(processedFiles);
    }
  } catch (error) {
    console.error("Error getting files:", error);
    res.status(500).json({ error: error.message });
  }
});

function processFiles(files) {
  return {
    count: files.length,
    success: true,
    files: files.map((file) => ({
      id: file._id,
      userId: file.userId,
      title: file.title,
      description: file.description,
      contentType: file.contentType,
      createdAt: file.createdAt,
    })),
    method: {
      type: "GET",
      url: "http://localhost:3000/video/files",
    },
  };
}

// const getAllFiles = asyncHandler(async (req, res) => {
//   try {
//     const files = await File.find();
//     res.json({
//       success: true,
//       files: files,
//       method: {
//         type: "GET",
//         url: "http://localhost:3000/video/files",
//       },
//     })
//   } catch (error) {
//     console.error("Error getting files:", error);
//     res.status(500).json({ error: error.message });
//   }
// })

const getFilebyId = asyncHandler(async (req, res) => {
  const { fileid } = req.params;

  try {
    if (!file || file.length === 0) {
      return res.status(404).json({ error: "File not found" });
    }

    // Use async/await to wait for the query to execute
    const file = await File.findById(fileid);

    res.json({
      success: true,
      file: file,
      method: {
        type: "GET",
        url: "http://localhost:3000/video/files",
      },
    });
  } catch (error) {
    console.error("Error getting file:", error);
    res.status(500).json({ error: error.message });
  }
});

const getAllFIlesbyUser = asyncHandler(async (req, res) => {
  try {
    // Check if the user ID is provided
    if (!req.params.id) {
      return res.status(400).json({ error: "No user ID provided" });
    }

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }

    if (!files || files.length === 0) {
      return res.status(404).json({ error: "No files found" });
    }

    // Use async/await to wait for the query to execute
    const files = await File.findMany({ userId: req.params.id });
    res.json({
      success: true,
      files: files,
      method: {
        type: "GET",
        url: "http://localhost:3000/uploads/files",
      },
    });
  } catch (error) {
    console.error("Error getting files:", error);
    res.status(500).json({ error: error.message });
  }
});

const deleteFile = asyncHandler(async (req, res) => {
  try {
    // Check if the file ID is provided
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ error: "No file ID provided" });
    }
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid file ID" });
    }
    const file = await File.findById(id);
    if (!file) {
      return res.status(404).json({ error: "File not found" });
    }
    await File.findByIdAndDelete(id);
    res.json({ message: "File deleted successfully" });
  } catch (err) {
    console.error("Error deleting file:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

const deleteFilebyUser = asyncHandler(async (req, res) => {
  try {
    const { userId, fileId } = req.params;
    // Check if the user ID is provided
    if (!userId || !fileId) {
      return res.status(400).json({ error: "No user ID provided or file ID" });
    }
    if (!mongoose.Types.ObjectId.isValid(userId || fileId)) {
      return res.status(400).json({ error: "Invalid user ID or file ID" });
    }

    // Use async/await to wait for the query to execute
    const files = await File.deleteOne({ userId: userId, _id: fileId });
    res.json({
      success: true,
      files: files,
      message: "File deleted successfully",
      method: {
        type: "GET",
        url: "http://localhost:3000/uploads/files",
      },
    });
  } catch (error) {
    console.error("Error deleting files:", error);
    res.status(500).json({ error: error.message });
  }
});

const deleteAllFIlesbyUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  try {
    // Check if the user ID is provided
    if (!userId) {
      return res.status(400).json({ error: "No user ID provided" });
    }
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }

    // Use async/await to wait for the query to execute
    const files = await File.deleteMany({ userId: userId });
    res.json({
      success: true,
      files: files,
      message: "All Files deleted successfully",
      method: {
        type: "GET",
        url: "http://localhost:3000/uploads/files",
      },
    });
  } catch (error) {
    console.error("Error deleting files:", error);
    res.status(500).json({ error: error.message });
  }
});

const deleteAllFiles = asyncHandler(async (req, res) => {
  try {
    await File.deleteMany({});
    res.json({ message: "All files deleted successfully" });
  } catch (err) {
    console.error("Error deleting files:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = {
  getAllFiles,
  getAllFIlesbyUser,
  getFilebyId,
  updateFile,
  streamFile,
  uploadFile,
  deleteFile,
  deleteFilebyUser,
  deleteAllFIlesbyUser,
  deleteAllFiles,
};
