const express = require("express");
const menuController = require("../controllers/menuController.js");
const authController = require("../controllers/authController.js");
const foodController = require("../controllers/foodController.js");
const categoryController = require("../controllers/categoryController.js");
const router = express.Router();

router.post("/signup", authController.signupp);
router.post("/login", authController.loginWithPassword);

router.post(
  "/food/category",
  authController.protect,
  categoryController.addCategory
);
router.patch(
  "/update/food/category/:title",
  authController.protect,
  categoryController.updateFoodCategory
);
router.delete(
  "/delete/food/category/:id",
  authController.protect,
  categoryController.deleteCategory
);

// menu item
router.get(
  "/menu/item/list",
  authController.protect,
  menuController.getMenuItems
);

router.post("/menu/item", authController.protect, menuController.upload.single("photo"), menuController.addMenuItem);
router.patch(
  "/update/menu/item/:id",
  authController.protect,
  menuController.upload.single("photo"),
  menuController.updateMenuItem
);
router.delete(
  "/delete/menu/item/:id",
  authController.protect,
  menuController.deleteMenuItem
);

// foodcatgeory
router.get("/:userID", foodController.allFoodCategory);
router.get("/restaurant/:userID", foodController.allFoodCategoryV2);


module.exports = router;
