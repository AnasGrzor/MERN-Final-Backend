const fs = require("fs");
const File = require("../models/fileModel");
const upload = require("../config/multerConfig");
const asyncHandler = require("express-async-handler");

// const uploadFile = asyncHandler(upload,(async (req, res) => {
//   console.log("req.user:", req.user); // Log the req.user
//   console.log("req.userId:", req.userId); // Log the req.userId
//   console.log("req.file:", req.file); // Log the req.file
//   console.log("req.body:", req.body); // Log the req.body
//   if (!req.userId) {
//     return res.status(401).json({ error: "Unauthorized" });
//   }

//   const userId = req.userId;
//   const file = req.file;
//   const filedata = fs.readFileSync(file.path);
//   const contentType = file.mimetype;

//   try {
//     if (!file) {
//       return res.status(400).json({ error: "No file provided" });
//     }

//     const newFile = new File({
//       // title: req.body.title,
//       // description: req.body.description,
//       // userId: userId,
//       filedata: filedata,
//       contentType: contentType,
//     });

//     fs.unlinkSync(file.path);

//     await newFile.save();

//     res.json({
//       success: true,
//       message: "File uploaded successfully",
//       method: {
//         type: "GET",
//         url: "http://localhost:3000/video/files",
//       },
//     });
//   } catch (err) {
//     console.error("Error:", err);
//     return res.status(500).send("Internal Server Error");
//   }
// }));

const uploadFile = asyncHandler(async (req, res) => {
  const file = req.file
  const filedata = fs.readFileSync(file.path);

  const newFile = new File({
    title: req.body.title,
    description: req.body.description,
    userId: req.userId,
    filedata: filedata,
    contentType: file.mimetype
  })

  fs.unlinkSync(file.path)

  await newFile.save()

  res.json({
    success: true,
    message: "File uploaded successfully",
    method: {
      type: "GET",
      url: "http://localhost:3000/video/files"
    }
  })
})

const streamFile = asyncHandler(async (req, res) => {
  const fileId = req.params.id;

  try {
    const fileDoc = await File.findById(fileId); // Fetch the file from the database

    if (!fileDoc) {
      console.log("File not found:", fileId);
      return res.status(404).send("File not found");
    }

    const videoBuffer = fileDoc.filedata.buffer; // Get the video data from the file document
    const videoSize = videoBuffer.byteLength; // Get the size of the video data
    console.log("Video size:", videoSize);

    const headers = {
      "Content-Length": videoBuffer.byteLength,
      "Content-Type": "video/mp4", // Make sure this is the correct MIME type for your video
    };

    console.log("Response headers:", headers);
    res.writeHead(206, headers);

    return res.end(Buffer.from(videoBuffer)); // Send the video data as a responsevideoBuffer);
  } catch (err) {
    console.error("Error:", err);
    return res.status(500).send("Internal Server Error");
  }
});

const getAllFiles = asyncHandler(async (req, res) => {
  try {
    // Use async/await to wait for the query to execute
    const files = await File.find();
    console.log("Files:", files);

    if (!files || files.length === 0) {
      return res.status(404).json({ error: "No files found" });
    }

    // Return the files
    res.json({
      count: files.length,
      success: true,
      files: files,
      method: {
        type: "GET",
        url: "http://localhost:3000/video/files",
      },
    });
  } catch (error) {
    console.error("Error getting files:", error);
    res.status(500).json({ error: error.message });
  }
});

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
  streamFile,
  uploadFile,
  deleteFile,
  deleteFilebyUser,
  deleteAllFIlesbyUser,
  deleteAllFiles,
};
