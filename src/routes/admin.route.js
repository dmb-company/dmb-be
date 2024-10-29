const express = require("express");
const router = express.Router();
const verifyToken = require("../app/middleware/auth");
const adminController = require("../app/controllers/admin.controller");

router.post("/login", adminController.login);

// [PRODUCT_TAG]
router.get("/tags", verifyToken, adminController.getProductTags);
router.post("/tags", verifyToken, adminController.createProductTags);

// [PRODUCTS]
router.get("/products", verifyToken, adminController.getProducts);
router.post("/products", verifyToken, adminController.createProduct);

module.exports = router;
