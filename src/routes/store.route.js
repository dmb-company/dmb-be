const express = require("express");
const router = express.Router();
const storeController = require("../app/controllers/store.controller");
const bannersController = require("../app/controllers/banners.controller");
const articleController = require("../app/controllers/article.controller");
const partnersController = require("../app/controllers/partners.controller");
const productController = require("../app/controllers/products.controller");
const productTagsController = require("../app/controllers/product-tags.controller");
const priceRequestsController = require("../app/controllers/price-request.controller");
const articleCategoryController = require("../app/controllers/article-categories.controller");
const productCategoriesController = require("../app/controllers/product-categories.controller");

// [BANNERS]
router.get("/banners", bannersController.getBanners);

// [ARTICLES]
router.get("/articles", articleController.getArticles);
router.get("/articles/:id", articleController.getOneArticle);
router.get(
  "/article-categories",
  articleCategoryController.getAllArticleCategories
);

// [PARTNERS]
router.get("/partners", partnersController.getPartners);

// [CATEGORIES]
router.get("/categories", productCategoriesController.getProductCategory);

// [TAGS]
router.get("/tags", productTagsController.getProductTags);

// [PRODUCTS]
router.get("/products", productController.getProducts);
router.get("/products/:id", productController.getOneProduct);

// get best seller products
router.get("/best-seller", productController.getBestSellerProducts);

// [PRICE REQUESTS]
router.post("/price-requests", priceRequestsController.createPriceRequest);

router.get("/", storeController.getStoreData);

module.exports = router;
