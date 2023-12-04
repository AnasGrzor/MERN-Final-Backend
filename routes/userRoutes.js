const express = require("express");
const router = express.Router();

const userController = require("../controllers/userController");
verifyJWT = require("../middleware/verifyJWT");

router.post("/register",userController.createUser);
router.get("/:id",userController.getUserbyId);

// router.use(verifyJWT)

router
  .route("/")
  .get(userController.getAllusers)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);


module.exports = router;
