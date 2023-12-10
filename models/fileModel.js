const mongoose = require("mongoose");

const fileSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  filedata: {
    type: Buffer,
    required: true,
  },
  contentType: {
    type: String,
    required: true,
  },  
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

const File = mongoose.model("File", fileSchema);

module.exports = File;
