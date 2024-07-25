const express = require("express");
const pointsConfigController = require("../controllers/reward/pointsConfigController.js");
const redeemConfigController = require("../controllers/reward/redeemConfigController.js");
const pointsController = require("../controllers/reward/pointsController.js");
const redeemController = require("../controllers/reward/redeemController.js");

const authController = require("../controllers/authController.js");
const router = express.Router();


router.get(
  "/config/:userId",
  authController.protect,
  pointsConfigController.fetchConfigData
);

router.post(
  "/points/config",
  authController.protect,
  pointsConfigController.points_config
);
router.post(
  "/redeem/config",
  authController.protect,
  redeemConfigController.redeemConfig
);

router.post(
  "/points",
  authController.protect,
  pointsController.addPoints
);


router.post("/redeem", authController.protect, redeemController.redeemPoints);

module.exports = router;
