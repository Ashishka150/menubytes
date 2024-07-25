const express = require("express");
const userController = require("../controllers/userController.js");
const authController = require("../controllers/authController.js");
const router = express.Router();

router.get("/user/profile",authController.protect,userController.getUserProfile);
router.patch(
  "/update/profile/:id",
  authController.protect,
  userController.upload.single("ProfilePhoto"),
  userController.updateUserProfile
);

module.exports = router;
