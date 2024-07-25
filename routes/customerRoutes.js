const express = require("express");
const customerController = require("../controllers/customer/customerController.js");
const authController = require("../controllers/authController.js");
const router = express.Router();

router.post(
  "/customer/profile",
  authController.protect,
  customerController.createCustomer
);

router.get(
  "/customers/:userId",
  authController.protect,
  customerController.getAllCustomers
);

router.delete(
  "/customers/:id",
  authController.protect,
  customerController.deleteCustomer
);

module.exports = router;
