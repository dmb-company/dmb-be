const express = require("express");
const router = express.Router();
const verifyToken = require("../app/middleware/auth");
const authController = require("../app/controllers/auth.controller");
const storeController = require("../app/controllers/store.controller");
const bannersController = require("../app/controllers/banners.controller");
const partnersController = require("../app/controllers/partners.controller");
const productController = require("../app/controllers/products.controller");
const productTagsController = require("../app/controllers/product-tags.controller");
const productCategoriesController = require("../app/controllers/product-categories.controller");

// [STORE]
router.patch("/store", verifyToken, storeController.updateStore);

// [AUTH]
router.post("/login", authController.login);
router.post("/refreshToken", authController.refreshToken);

// [PRODUCT_TAG]
router.get("/tags", verifyToken, productTagsController.getProductTags);
router.post("/tags", verifyToken, productTagsController.createProductTag);
router.delete("/tags", verifyToken, productTagsController.deleteProductTag);
router.patch("/tags", verifyToken, productTagsController.updateProductTag);

// [PRODUCT_CATEGORY]
router.get(
  "/categories",
  verifyToken,
  productCategoriesController.getProductCategory
);
router.get(
  "/categories/:id",
  verifyToken,
  productCategoriesController.getOneProductCategory
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
router.get("/products/:id", verifyToken, productController.getOneProduct);
router.post("/products", verifyToken, productController.createProduct);
router.delete("/products", verifyToken, productController.deleteProduct);
router.patch(
  "/products/:id",
  verifyToken,
  productController.updateProductFields
);

// [BANNERS]
router.get("/banners", verifyToken, bannersController.getBanners);
router.post("/banners", verifyToken, bannersController.createBanner);
router.delete("/banners/:id", verifyToken, bannersController.deleteBanner);

// [PARTNERS]
router.get("/partners", verifyToken, partnersController.getPartners);
router.post("/partners", verifyToken, partnersController.createPartner);
router.delete("/partners/:id", verifyToken, partnersController.deletePartner);

module.exports = router;
