const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const bcrypt = require("bcrypt");

// @desc get all users
// @route GET /users
// @access Private
const getAllusers = asyncHandler(async (req, res) => {
  const users = await User.find().select("-password").lean();
  if (!users?.length) {
    return res.status(400).json({ message: "No users found" });
  }
  res.json({ users });
});

const getUserbyId = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select("-password").lean();
  if (!user) {
    return res.status(400).json({ message: "User not found" });
  }
  res.json({ user })
})

// @desc create new user
// @route POST /users
// @access Private
const createUser = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;
  if (!username,!email,!password) {
      return res.status(400).json({ message: "All fields are required" });
  }
  const duplicate = await User.findOne({ email }).lean().exec();
  if (duplicate) {
      return res.status(409).json({ message: "Duplicate user" });
  }
  const hashedPwd = await bcrypt.hash(password, 10);

  const userObject = { username, email, password: hashedPwd };

  const user = await User.create(userObject);

  if (user) {
      res.status(201).json({ message: `New user ${username} created` });
  }
  else {
      res.status(400).json({ message: "Invalid user data received" });
  }
});

// @desc Update a user
// @route PATCh /users
// @access Private
const updateUser = asyncHandler(async (req, res) => {
  const { id, username, email, password } = req.body;
  if (!id, !username, !email, !password) {
      return res.status(400).json({ message: "All fields are required" });
  }
  const user = await User.findById(id).exec();
  if (!user) {
      return res.status(400).json({ message: "User not found" });
  }

  const duplicate = await User.findOne({ email }).lean().exec();
  if (duplicate && duplicate?._id.toString() !== id) {
      return res.status(409).json({ message: "Duplicate user" });
  }

  user.username = username;
  user.email = email;

  if (password) {
      user.password = await bcrypt.hash(password, 10);
  }

  const updatedUser = await user.save();

  res.json({ message: `${updatedUser.username} updated` });

})

// @desc Delete a user
// @route delete /users
// @access Private
const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.body;
  if (!id) {
      return res.status(400).json({ message: "User ID required" });
  }
  const user = await User.findById(id).exec();
  if (!user) {
      return res.status(400).json({ message: "User not found" });
  }
  const result = await user.deleteOne();

  res.json({ message: `${result.username} deleted` });
})

module.exports = {
  getAllusers,
  getUserbyId,
  createUser,
  updateUser,
  deleteUser
}
