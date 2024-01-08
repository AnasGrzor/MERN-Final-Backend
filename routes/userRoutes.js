const express = require("express");
const router = express.Router();

const userController = require("../controllers/userController");
verifyJWT = require("../middleware/verifyJWT");

router.post("/register",userController.createUser);
router.get("/:id",userController.getUserbyId);
router.get("/",userController.getAllusers)

router.use(verifyJWT)
router.patch("/:id",userController.updateUser)
router.delete("/:id",userController.deleteUser);

module.exports = router;
