const express = require("express");
const router = express.Router();
const storeController = require("../app/controllers/store.controller");
const bannersController = require("../app/controllers/banners.controller");
const partnersController = require("../app/controllers/partners.controller");
const productController = require("../app/controllers/products.controller");
const articleCategoryController = require("../app/controllers/article-categories.controller");
const productCategoriesController = require("../app/controllers/product-categories.controller");

router.get("/banners", bannersController.getBanners);
router.get("/partners", partnersController.getPartners);
router.get("/categories", productCategoriesController.getProductCategory);
router.get("/", storeController.getStoreData);

module.exports = router;
