const mongoose = require("mongoose");

const fileSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  userId: {
    type: String,
    required: true,
  },
  filedata: {
    type: Buffer,
    required: true,
  },
  contentType: {
    type: String,
    required: true,
  }
});

const File = mongoose.model("File", fileSchema);

module.exports = File;
