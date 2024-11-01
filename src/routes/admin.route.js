const express = require("express");
const router = express.Router();
const verifyToken = require("../app/middleware/auth");
const authController = require("../app/controllers/auth.controller");
const adminController = require("../app/controllers/admin.controller");

// [AUTH]
router.post("/login", authController.login);
router.post("/refreshToken", authController.refreshToken);

// [PRODUCT_TAG]
router.get("/tags", verifyToken, adminController.getProductTags);
router.post("/tags", verifyToken, adminController.createProductTag);

// [PRODUCT_CATEGORY]
router.get("/categories", verifyToken, adminController.getProductCategory);
router.post("/categories", verifyToken, adminController.createProductCategory);

// [PRODUCTS]
router.get("/products", verifyToken, adminController.getProducts);
router.post("/products", verifyToken, adminController.createProduct);

module.exports = router;
