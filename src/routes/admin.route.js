const express = require("express");
const router = express.Router();
const verifyToken = require("../app/middleware/auth");
const authController = require("../app/controllers/auth.controller");
const storeController = require("../app/controllers/store.controller");
const bannersController = require("../app/controllers/banners.controller");
const articleController = require("../app/controllers/article.controller");
const partnersController = require("../app/controllers/partners.controller");
const productController = require("../app/controllers/products.controller");
const productTagsController = require("../app/controllers/product-tags.controller");
const priceRequestsController = require("../app/controllers/price-request.controller");
const articleCategoryController = require("../app/controllers/article-categories.controller");
const productCategoriesController = require("../app/controllers/product-categories.controller");

// [STORE]
router.patch("/store", verifyToken, storeController.updateStore);

// [AUTH]
router.post("/login", authController.login);
router.post("/refreshToken", authController.refreshToken);

// [ARTICLE CATEGORY]
router.get(
  "/article-categories",
  verifyToken,
  articleCategoryController.getAllArticleCategories
);

router.get(
  "/article-categories/:id",
  verifyToken,
  articleCategoryController.getArticleCategoryById
);

router.post(
  "/article-categories",
  verifyToken,
  articleCategoryController.createArticleCategory
);

router.delete(
  "/article-categories/:id",
  verifyToken,
  articleCategoryController.deleteArticleCategory
);

router.patch(
  "/article-categories/:id",
  verifyToken,
  articleCategoryController.updateArticleCategory
);

router.get("/article", verifyToken, articleController.getArticles);
router.post("/article", verifyToken, articleController.createArticle);
router.get("/article/:id", verifyToken, articleController.getOneArticle);
router.patch("/article/:id", verifyToken, articleController.updateArticle);
router.delete("/article/:id", verifyToken, articleController.deleteArticle);

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

// [PRICE REQUESTS]
router.get(
  "/price-requests",
  verifyToken,
  priceRequestsController.getAllPriceRequests
);
router.delete(
  "/price-requests/:id",
  verifyToken,
  priceRequestsController.deletePriceRequest
);
router.put(
  "/price-requests/:id",
  verifyToken,
  priceRequestsController.updatePriceRequestStatus
);

module.exports = router;
