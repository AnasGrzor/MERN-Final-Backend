const express = require("express");
const router = express.Router();

const authController = require("../controllers/authController");
const loginLimit = require("../middleware/loginLimiter");

router.route("/login").post(loginLimit, authController.login);

router.route("/refresh").get(authController.refresh);

router.route("/logout").post(authController.logout);

module.exports = router;