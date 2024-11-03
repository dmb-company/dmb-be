const express = require("express");
const router = express.Router();
const verifyToken = require("../app/middleware/auth");
const authController = require("../app/controllers/auth.controller");
const adminController = require("../app/controllers/admin.controller");
const productController = require("../app/controllers/products.controller");
const productTagsController = require("../app/controllers/product-tags.controller");
const productCategoriesController = require("../app/controllers/product-categories.controller");

// [AUTH]
router.post("/login", authController.login);
router.post("/refreshToken", authController.refreshToken);

// [PRODUCT_TAG]
router.get("/tags", verifyToken, productTagsController.getProductTags);
router.post("/tags", verifyToken, productTagsController.createProductTag);

// [PRODUCT_CATEGORY]
router.get(
  "/categories",
  verifyToken,
  productCategoriesController.getProductCategory
);
router.post(
  "/categories",
  verifyToken,
  productCategoriesController.createProductCategory
);
router.delete(
  "/categories",
  verifyToken,
  productCategoriesController.deleteProductCategory
);
router.patch(
  "/categories",
  verifyToken,
  productCategoriesController.updateProductCategory
);

// [PRODUCTS]
router.get("/products", verifyToken, productController.getProducts);
router.post("/products", verifyToken, productController.createProduct);
router.delete("/products", verifyToken, productController.deleteProduct);
router.patch("/products", verifyToken, productController.updateProductFields);

module.exports = router;
